"""
Resume Parser
=============
Uses spaCy NLP + regex patterns to extract structured information from resume text.

Extracts:
  - Candidate info (name, email, phone, LinkedIn, GitHub, portfolio, location)
  - Summary
  - Skills (technical, programming languages, frameworks, databases, cloud, tools)
  - Education (institution, degree, field, dates, GPA)
  - Experience (company, title, duration, description)
  - Projects (name, description, technologies)
  - Certifications (name, issuer, date)

Design notes:
  - YEAR_RE uses a non-capturing group (?:19|20) so findall() returns full years.
  - Section detection retains inline content that appears after a heading on the same line.
  - Candidate-name extraction uses header-position heuristics and spaCy PERSON entities
    only when they appear in the first few lines, reducing false-positive employer names.
  - Skill matching for short single-character skills uses strict word-boundary guards.
"""

import json
import os
import re
from typing import Any

import spacy

# ---------------------------------------------------------------------------
# Load spaCy model (singleton, with explicit error handling)
# ---------------------------------------------------------------------------

_nlp = None


def _get_nlp():
    global _nlp
    if _nlp is None:
        try:
            _nlp = spacy.load("en_core_web_sm")
        except OSError:
            # Model not installed — return None; callers must handle gracefully.
            _nlp = False  # Sentinel: we tried and failed
    return _nlp if _nlp is not False else None


# ---------------------------------------------------------------------------
# Section header patterns
# ---------------------------------------------------------------------------

SECTION_PATTERNS = {
    "summary": re.compile(
        r"^(professional\s+summary|summary|objective|profile|about\s*me|career\s*objective)",
        re.IGNORECASE,
    ),
    "skills": re.compile(
        r"^(skills|technical\s+skills|core\s+competencies|competencies|expertise|technologies|proficiencies)",
        re.IGNORECASE,
    ),
    "experience": re.compile(
        r"^(experience|work\s+experience|professional\s+experience|employment|work\s+history|career\s+history)",
        re.IGNORECASE,
    ),
    "education": re.compile(
        r"^(education|academic|qualifications|academic\s+background|educational\s+background)",
        re.IGNORECASE,
    ),
    "projects": re.compile(
        r"^(projects|personal\s+projects|academic\s+projects|key\s+projects)",
        re.IGNORECASE,
    ),
    "certifications": re.compile(
        r"^(certifications|certificates|licenses|professional\s+certifications|credentials)",
        re.IGNORECASE,
    ),
    "achievements": re.compile(
        r"^(achievements|awards|honors|accomplishments|recognition)",
        re.IGNORECASE,
    ),
}

# Pattern to detect that a header line also contains inline content after ":" or "—" or "-"
_INLINE_SECTION_SPLIT_RE = re.compile(
    r"^(?:professional\s+summary|summary|objective|profile|about\s*me|career\s*objective"
    r"|skills|technical\s+skills|core\s+competencies|competencies|expertise|technologies|proficiencies"
    r"|experience|work\s+experience|professional\s+experience|employment|work\s+history|career\s+history"
    r"|education|academic|qualifications|academic\s+background|educational\s+background"
    r"|projects|personal\s+projects|academic\s+projects|key\s+projects"
    r"|certifications|certificates|licenses|professional\s+certifications|credentials"
    r"|achievements|awards|honors|accomplishments|recognition)"
    r"\s*[:—\-–]\s*(.+)$",
    re.IGNORECASE,
)

# ---------------------------------------------------------------------------
# Contact / entity patterns
# ---------------------------------------------------------------------------

EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")

# Phone: require at least 7 digits total; avoid matching bare years (4 digits)
PHONE_RE = re.compile(
    r"(?<!\d)"
    r"(?:\+?[1-9]\d{0,2}[\s\-.]?)?"          # optional country code
    r"(?:\(?\d{2,4}\)?[\s\-.]?)?"             # optional area code
    r"\d{3,4}[\s\-.]?\d{3,4}"                 # main number
    r"(?!\d)",
)

LINKEDIN_RE = re.compile(r"(?<![\w.\-])(?:linkedin\.com/in/|linkedin\.com/pub/)[\w\-]+", re.IGNORECASE)
GITHUB_RE = re.compile(r"(?:github\.com/)[\w\-]+(?!/[a-zA-Z0-9])", re.IGNORECASE)
# Portfolio: exclude linkedin/github; require non-trivial path or known TLDs
PORTFOLIO_RE = re.compile(
    r"https?://(?!(?:linkedin|github)\.com)(?:www\.)?[\w\-]+\.(?:com|io|dev|me|org|net)(?:/[\w\-./]*)?",
    re.IGNORECASE,
)

# Education degree patterns
DEGREE_RE = re.compile(
    r"(?:Ph\.?D|Doctorate|Master(?:'s)?|M\.?S\.?|M\.?A\.?|M\.?B\.?A\.?|"
    r"M\.?Tech|M\.?E\.?|Bachelor(?:'s)?|B\.?S\.?|B\.?A\.?|B\.?E\.?|B\.?Tech|"
    r"B\.?Com|B\.?Sc|Associate(?:'s)?|Diploma|High\s+School|GED)",
    re.IGNORECASE,
)

# Date: Month Year | MM/YYYY | full year
DATE_RE = re.compile(
    r"(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|"
    r"Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|"
    r"Dec(?:ember)?)\s*,?\s*\d{4}|\d{1,2}/\d{4}|(?:19|20)\d{2}",
    re.IGNORECASE,
)

GPA_RE = re.compile(
    r"(?:GPA|CGPA|Grade|Score)\s*:?\s*(\d+\.?\d*)\s*/?\s*(\d+\.?\d*)?",
    re.IGNORECASE,
)

# FIX B1: Use non-capturing group (?:19|20) so findall() returns full four-digit years.
YEAR_RE = re.compile(r"\b(?:19|20)\d{2}\b")

# Date range ending in Present/Current
DATE_RANGE_PRESENT_RE = re.compile(
    r"(?:to|–|—|\-)\s*(?:present|current|now)", re.IGNORECASE
)

# Explicit years-of-experience statement (e.g. "5 years of experience", "2+ years")
EXP_YEARS_STATED_RE = re.compile(
    r"(\d+)\+?\s*(?:years?|yrs?)\s+(?:of\s+)?(?:experience|exp)",
    re.IGNORECASE,
)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def parse_resume(text: str) -> dict[str, Any]:
    """
    Parse resume text into a structured dictionary.

    Returns:
        {
            "candidate": { name, email, phone, location, linkedin, github, portfolio },
            "summary": str,
            "skills": { technical: [], programmingLanguages: [], frameworks: [],
                        databases: [], cloud: [], tools: [], softSkills: [] },
            "education": [{ degree, institution, field, startDate, endDate, gpa }],
            "experience": [{ title, company, location, startDate, endDate, description }],
            "projects": [{ name, description, technologies, links }],
            "certifications": [{ name, issuer, date }],
            "achievements": [],
            "yearsOfExperience": { "value": float|None, "source": str }
        }
    """
    nlp = _get_nlp()
    doc = nlp(text[:100_000]) if nlp else None  # Cap to avoid memory issues

    # Split text into lines for section-based parsing
    lines = text.split("\n")

    # Extract sections
    sections = _detect_sections(lines)

    # Extract candidate info
    candidate = _extract_candidate(text, doc, lines)

    # Extract each section
    summary = _extract_summary(sections)
    skills = _extract_skills(sections, text)
    education = _extract_education(sections)
    experience = _extract_experience(sections)
    projects = _extract_projects(sections)
    certifications = _extract_certifications(sections)
    achievements = _extract_achievements(sections)

    # Years-of-experience: stated vs calculated
    years_of_exp = _extract_years_of_experience(text, experience)

    return {
        "candidate": candidate,
        "summary": summary,
        "skills": skills,
        "education": education,
        "experience": experience,
        "projects": projects,
        "certifications": certifications,
        "achievements": achievements,
        "yearsOfExperience": years_of_exp,
    }


# ---------------------------------------------------------------------------
# Section detection (FIX B2: retain inline content after header)
# ---------------------------------------------------------------------------

def _detect_sections(lines: list[str]) -> dict[str, list[str]]:
    """
    Split resume lines into labeled sections based on header detection.

    Fix (B2): When a section header contains content on the same line
    (e.g. "Skills: Python, SQL, Docker"), the content after the separator
    is extracted and prepended into the corresponding section.
    """
    sections: dict[str, list[str]] = {
        "header": [],
        "summary": [],
        "skills": [],
        "experience": [],
        "education": [],
        "projects": [],
        "certifications": [],
        "achievements": [],
        "other": [],
    }

    current_section = "header"
    for line in lines:
        clean = line.strip()
        if not clean:
            sections[current_section].append("")
            continue

        # Check if this line is a section header
        matched = False
        for section_name, pattern in SECTION_PATTERNS.items():
            if pattern.match(clean):
                current_section = section_name
                matched = True

                # FIX B2: Check for inline content after ":" or "—" on same line
                inline_match = _INLINE_SECTION_SPLIT_RE.match(clean)
                if inline_match:
                    inline_content = inline_match.group(1).strip()
                    if inline_content:
                        sections[current_section].append(inline_content)
                break

        if not matched:
            sections[current_section].append(clean)

    return sections


# ---------------------------------------------------------------------------
# Candidate info extraction (FIX B3: improve name extraction)
# ---------------------------------------------------------------------------

def _extract_candidate(text: str, doc, lines: list[str]) -> dict[str, str]:
    """
    Extract candidate contact information.

    Name heuristic (B3 fix): prefer PERSON entities found in the first 5
    non-empty lines of the document (header area), rather than the absolute
    first PERSON entity in the whole document (which may be an employer).
    """
    # Email
    email_match = EMAIL_RE.search(text)
    email = email_match.group(0) if email_match else ""

    # Phone (exclude matches that are part of URLs or email addresses)
    phone = ""
    for m in PHONE_RE.finditer(text):
        candidate_phone = m.group(0).strip()
        # Must have at least 7 digit characters
        digits = re.sub(r"\D", "", candidate_phone)
        if len(digits) >= 7:
            # Don't accept if it's part of an email or URL context
            start = max(0, m.start() - 5)
            context = text[start: m.start()]
            if "@" not in context and "//" not in context:
                phone = candidate_phone
                break

    # LinkedIn
    linkedin_match = LINKEDIN_RE.search(text)
    linkedin = linkedin_match.group(0) if linkedin_match else ""

    # GitHub
    github_match = GITHUB_RE.search(text)
    github = github_match.group(0) if github_match else ""

    # Portfolio (first URL that is not linkedin/github)
    portfolio = ""
    for m in PORTFOLIO_RE.finditer(text):
        url = m.group(0)
        if "linkedin.com" not in url.lower() and "github.com" not in url.lower():
            portfolio = url
            break

    # Name extraction: FIX B3
    name = _extract_candidate_name(text, doc, lines, email)

    # Location: Use spaCy GPE entities
    location = ""
    if doc:
        for ent in doc.ents:
            if ent.label_ in ("GPE", "LOC"):
                location = ent.text.strip()
                break

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "location": location,
        "linkedin": linkedin,
        "github": github,
        "portfolio": portfolio,
    }


def _extract_candidate_name(
    text: str, doc, lines: list[str], email: str
) -> str:
    """
    Heuristic candidate name extraction.

    Strategy:
    1. Check the first 5 non-empty lines for a PERSON entity from spaCy
       (header zone — more likely to be the candidate's name).
    2. If not found, look for the first line that looks like a personal name
       (mostly alpha, reasonable word count, not an email/phone/URL/date).
    3. Return empty string rather than guessing when uncertain.
    """
    non_empty_lines = [l.strip() for l in lines if l.strip()]
    header_zone = "\n".join(non_empty_lines[:8])  # First 8 non-empty lines

    # 1. spaCy PERSON in header zone
    if doc:
        header_doc = doc.vocab.strings  # Reuse vocab
        # Scan entities whose character position is within the header zone
        header_end = len(header_zone)
        for ent in doc.ents:
            if ent.label_ == "PERSON" and ent.start_char <= header_end:
                candidate_name = ent.text.strip()
                # Sanity: 2-50 chars, at least two words or one well-formed name
                if 2 < len(candidate_name) < 50:
                    words = candidate_name.split()
                    alpha_ratio = sum(c.isalpha() or c.isspace() for c in candidate_name) / len(candidate_name)
                    if alpha_ratio > 0.8:
                        return candidate_name

    # 2. Heuristic: first non-empty line that looks like a name
    for line in non_empty_lines[:5]:
        # Skip lines with contact info indicators
        if EMAIL_RE.search(line):
            continue
        if re.search(r"\d{7,}", line):  # Long digit run = phone/ID
            continue
        if re.search(r"https?://|www\.", line, re.IGNORECASE):
            continue
        if LINKEDIN_RE.search(line) or GITHUB_RE.search(line):
            continue
        # Skip lines that look like headings (section headers)
        is_heading = any(p.match(line) for p in SECTION_PATTERNS.values())
        if is_heading:
            continue
        # Check it looks like a name: mostly alpha, 1-4 words, no digits
        words = line.split()
        if not (1 <= len(words) <= 4):
            continue
        alpha_ratio = sum(c.isalpha() or c.isspace() for c in line) / len(line)
        if alpha_ratio > 0.8 and len(line) < 50:
            return line

    return ""


# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------

def _extract_summary(sections: dict[str, list[str]]) -> str:
    """Extract the professional summary."""
    lines = sections.get("summary", [])
    if not lines:
        # Try header section (sometimes summary is at the top without a header)
        header_lines = sections.get("header", [])
        for line in header_lines:
            if len(line) > 100:
                return line
        return ""
    return " ".join(line for line in lines if line).strip()


# ---------------------------------------------------------------------------
# Skills (with canonical taxonomy normalization)
# ---------------------------------------------------------------------------

# Common skill categorization keywords
PROGRAMMING_LANGUAGES = {
    "python", "java", "javascript", "typescript", "c++", "c#",
    "ruby", "go", "golang", "rust", "php", "swift", "kotlin", "scala",
    "matlab", "perl", "dart", "lua", "haskell", "objective-c",
    "sql", "html", "css", "sass", "shell", "bash", "powershell",
    # Single-char languages: only match when clearly labeled (handled separately)
}

# Single-character language names require extra care
_SINGLE_CHAR_LANGUAGES = {"r", "c"}

FRAMEWORKS = {
    "react", "angular", "vue", "vue.js", "next.js", "nextjs", "nuxt",
    "django", "flask", "fastapi", "spring", "spring boot", "express",
    "express.js", "rails", "ruby on rails", "laravel", ".net", "asp.net",
    "node.js", "nodejs", "svelte", "gatsby", "remix", "nest.js", "nestjs",
    "bootstrap", "tailwind", "tailwindcss", "material ui", "chakra ui",
    "jquery", "ember", "backbone",
}

DATABASES = {
    "mysql", "postgresql", "postgres", "mongodb", "redis", "sqlite",
    "oracle", "sql server", "cassandra", "dynamodb", "elasticsearch",
    "neo4j", "mariadb", "couchdb", "firebase", "firestore", "supabase",
}

CLOUD = {
    "aws", "amazon web services", "azure", "gcp", "google cloud",
    "heroku", "digitalocean", "cloudflare", "vercel", "netlify",
    "lambda", "ec2", "s3", "rds", "ecs", "eks", "fargate",
}

TOOLS = {
    "docker", "kubernetes", "k8s", "git", "github", "gitlab", "bitbucket",
    "jenkins", "ci/cd", "terraform", "ansible", "prometheus", "grafana",
    "datadog", "nginx", "apache", "linux", "unix", "jira", "confluence",
    "slack", "figma", "photoshop", "illustrator", "webpack", "vite",
    "babel", "eslint", "prettier", "postman", "swagger", "graphql",
    "rest api", "rest apis", "grpc", "kafka", "rabbitmq",
    "celery", "airflow", "spark", "hadoop", "tableau", "power bi",
    "looker", "excel", "pandas", "numpy", "scikit-learn", "tensorflow",
    "pytorch", "keras", "opencv", "matplotlib", "seaborn",
}

SOFT_SKILLS_KW = {
    "leadership", "communication", "teamwork", "problem solving",
    "critical thinking", "time management", "adaptability", "creativity",
    "collaboration", "mentoring", "presentation", "negotiation",
    "project management", "agile", "scrum", "kanban",
}

# Load canonical taxonomy
_TAXONOMY_PATH = os.path.join(os.path.dirname(__file__), "skill_taxonomy.json")
_CANONICAL_MAP: dict[str, str] = {}   # alias_lower -> canonical_name
_CANONICAL_SKILLS: set[str] = set()  # canonical names (lower)


def _load_taxonomy() -> None:
    global _CANONICAL_MAP, _CANONICAL_SKILLS
    if _CANONICAL_MAP:
        return
    try:
        with open(_TAXONOMY_PATH, encoding="utf-8") as f:
            data = json.load(f)
        for canonical, aliases in data.get("skills", {}).items():
            _CANONICAL_SKILLS.add(canonical.lower())
            _CANONICAL_MAP[canonical.lower()] = canonical
            for alias in aliases:
                _CANONICAL_MAP[alias.lower()] = canonical
    except Exception:
        pass  # Graceful degradation if taxonomy not found


def normalize_skill(raw: str) -> str:
    """
    Normalize a raw skill string to its canonical name.
    Returns the canonical form if found, else title-cases the input.
    """
    _load_taxonomy()
    key = raw.lower().strip()
    return _CANONICAL_MAP.get(key, raw)


def _is_safe_skill_match(skill: str, text_lower: str) -> bool:
    """
    Return True if `skill` can safely be matched in `text_lower`.

    Single-character or very short skills use strict word-boundary matching
    to avoid false positives (e.g., "r" matching "our", "c" matching "access").
    """
    if len(skill) <= 1:
        # Single chars: only match when surrounded by non-word characters
        return bool(re.search(r"(?<!\w)" + re.escape(skill) + r"(?!\w)", text_lower))
    elif len(skill) <= 2:
        # Two-char: also require non-word boundaries
        return bool(re.search(r"(?<!\w)" + re.escape(skill) + r"(?!\w)", text_lower))
    else:
        return bool(re.search(r"\b" + re.escape(skill) + r"\b", text_lower))


def _extract_skills(sections: dict[str, list[str]], full_text: str) -> dict[str, list[str]]:
    """Extract and categorize skills from the skills section and full text."""
    _load_taxonomy()
    skill_lines = sections.get("skills", [])
    raw_skills: set[str] = set()

    # Parse skill lines (handle bullet points, commas, pipes, slashes)
    for line in skill_lines:
        if not line:
            continue
        # Split on common delimiters
        parts = re.split(r"[,;|•·▪►▸/]|(?:\s{2,})|\s+and\s+", line)
        for part in parts:
            skill = part.strip().strip("·•▪►▸-").strip()
            if skill and len(skill) > 1 and len(skill) < 60:
                raw_skills.add(skill)

    text_lower = full_text.lower()

    categorized: dict[str, list[str]] = {
        "technical": [],
        "programmingLanguages": [],
        "frameworks": [],
        "databases": [],
        "cloud": [],
        "tools": [],
        "softSkills": [],
    }

    seen: set[str] = set()

    def _add_skill(skill_raw: str, category: str) -> None:
        canonical = normalize_skill(skill_raw)
        key = canonical.lower()
        if key not in seen:
            seen.add(key)
            categorized[category].append(canonical)

    # Categorize raw skills from skills section
    for skill in raw_skills:
        skill_lower = skill.lower()
        if skill_lower in seen:
            continue
        # Avoid categorizing section headers
        if any(p.match(skill) for p in SECTION_PATTERNS.values()):
            continue

        if skill_lower in PROGRAMMING_LANGUAGES:
            _add_skill(skill, "programmingLanguages")
        elif skill_lower in _SINGLE_CHAR_LANGUAGES:
            _add_skill(skill, "programmingLanguages")
        elif skill_lower in FRAMEWORKS:
            _add_skill(skill, "frameworks")
        elif skill_lower in DATABASES:
            _add_skill(skill, "databases")
        elif skill_lower in CLOUD:
            _add_skill(skill, "cloud")
        elif skill_lower in TOOLS:
            _add_skill(skill, "tools")
        elif skill_lower in SOFT_SKILLS_KW:
            _add_skill(skill, "softSkills")
        else:
            _add_skill(skill, "technical")

    # Supplement with known skills found in full text (B7 fix: safe matching)
    for skill_set, category in [
        (PROGRAMMING_LANGUAGES, "programmingLanguages"),
        (FRAMEWORKS, "frameworks"),
        (DATABASES, "databases"),
        (CLOUD, "cloud"),
        (TOOLS, "tools"),
    ]:
        for skill in skill_set:
            if skill in seen:
                continue
            if _is_safe_skill_match(skill, text_lower):
                canonical = normalize_skill(skill)
                key = canonical.lower()
                if key not in seen:
                    seen.add(key)
                    categorized[category].append(canonical)

    # Also scan for single-char languages with safe matching
    for skill in _SINGLE_CHAR_LANGUAGES:
        if skill in seen:
            continue
        # For single-char languages, only count if found in skills section text
        skills_text = " ".join(skill_lines).lower()
        if _is_safe_skill_match(skill, skills_text):
            canonical = normalize_skill(skill)
            key = canonical.lower()
            if key not in seen:
                seen.add(key)
                categorized["programmingLanguages"].append(canonical)

    return categorized


# ---------------------------------------------------------------------------
# Education
# ---------------------------------------------------------------------------

def _extract_education(sections: dict[str, list[str]]) -> list[dict[str, str]]:
    """Extract education entries."""
    lines = sections.get("education", [])
    if not lines:
        return []

    entries = []
    current: dict[str, str] = {}

    for line in lines:
        if not line:
            if current:
                entries.append(current)
                current = {}
            continue

        # Check for degree
        degree_match = DEGREE_RE.search(line)
        if degree_match:
            if current and "degree" in current:
                entries.append(current)
                current = {}
            current["degree"] = line
            current["institution"] = ""
            current["field"] = ""

            # Extract year — FIX B1: YEAR_RE now returns full years
            years = YEAR_RE.findall(line)
            if len(years) >= 2:
                current["startDate"] = years[0]
                current["endDate"] = years[-1]
                current["year"] = years[-1]
            elif years:
                current["year"] = years[0]
                current["startDate"] = ""
                current["endDate"] = years[0]
            else:
                current["year"] = ""
                current["startDate"] = ""
                current["endDate"] = ""

            # Extract GPA
            gpa_match = GPA_RE.search(line)
            if gpa_match:
                current["gpa"] = gpa_match.group(1)

            continue

        # If we have an ongoing entry, this might be institution or details
        if current:
            if not current.get("institution"):
                current["institution"] = line
            else:
                # Look for dates or GPA in supplementary lines
                years = YEAR_RE.findall(line)
                if years and not current.get("year"):
                    current["year"] = years[-1]
                gpa_match = GPA_RE.search(line)
                if gpa_match and not current.get("gpa"):
                    current["gpa"] = gpa_match.group(1)
        else:
            # Start a new entry
            current = {"degree": line, "institution": "", "field": "", "year": ""}
            years = YEAR_RE.findall(line)
            if years:
                current["year"] = years[-1]

    if current:
        entries.append(current)

    return entries


# ---------------------------------------------------------------------------
# Experience
# ---------------------------------------------------------------------------

def _extract_experience(sections: dict[str, list[str]]) -> list[dict[str, str]]:
    """Extract work experience entries."""
    lines = sections.get("experience", [])
    if not lines:
        return []

    entries = []
    current: dict[str, str] | None = None
    desc_lines: list[str] = []

    for line in lines:
        if not line:
            if current:
                current["description"] = " ".join(desc_lines)
                entries.append(current)
                current = None
                desc_lines = []
            continue

        # Heuristic: lines with dates are likely job headers
        dates = DATE_RE.findall(line)
        has_date = len(dates) >= 1
        has_range = bool(DATE_RANGE_PRESENT_RE.search(line))

        if has_date or has_range:
            if current:
                current["description"] = " ".join(desc_lines)
                entries.append(current)
                desc_lines = []

            # Build duration string from found dates
            year_dates = YEAR_RE.findall(line)
            if year_dates:
                duration = " – ".join(year_dates)
            elif dates:
                duration = " – ".join(str(d) for d in dates)
            else:
                duration = ""

            if has_range or re.search(r"present|current", line, re.IGNORECASE):
                if duration and "present" not in duration.lower():
                    duration += " – Present"
                elif not duration:
                    duration = "– Present"

            current = {
                "title": line,
                "company": "",
                "location": "",
                "startDate": year_dates[0] if year_dates else "",
                "endDate": "Present" if has_range else (year_dates[-1] if len(year_dates) > 1 else ""),
                "duration": duration,
                "description": "",
            }
        elif current:
            # Check if this looks like a company name (short, not a bullet point)
            if not current.get("company") and not line.startswith(("•", "·", "-", "▪", "►")):
                if len(line) < 80:
                    current["company"] = line
                    continue
            desc_lines.append(line)
        else:
            # No current entry yet; this might be a job title
            current = {
                "title": line,
                "company": "",
                "location": "",
                "startDate": "",
                "endDate": "",
                "duration": "",
                "description": "",
            }

    if current:
        current["description"] = " ".join(desc_lines)
        entries.append(current)

    return entries


# ---------------------------------------------------------------------------
# Projects
# ---------------------------------------------------------------------------

def _extract_projects(sections: dict[str, list[str]]) -> list[dict[str, Any]]:
    """Extract project entries."""
    lines = sections.get("projects", [])
    if not lines:
        return []

    entries = []
    current: dict[str, Any] | None = None
    desc_lines: list[str] = []

    for line in lines:
        if not line:
            if current:
                current["description"] = " ".join(desc_lines)
                current["technologies"] = _extract_tech_from_text(current["description"])
                entries.append(current)
                current = None
                desc_lines = []
            continue

        # Project headers tend to be shorter, non-bullet lines
        is_bullet = line.startswith(("•", "·", "-", "▪", "►", "▸"))

        if not is_bullet and (current is None or len(line) < 80):
            if current:
                current["description"] = " ".join(desc_lines)
                current["technologies"] = _extract_tech_from_text(current["description"])
                entries.append(current)
                desc_lines = []

            current = {
                "name": line,
                "description": "",
                "technologies": [],
                "links": "",
            }
        elif current:
            desc_lines.append(line.lstrip("•·-▪►▸ "))

    if current:
        current["description"] = " ".join(desc_lines)
        current["technologies"] = _extract_tech_from_text(current["description"])
        entries.append(current)

    return entries


def _extract_tech_from_text(text: str) -> list[str]:
    """Extract technology mentions from a description string."""
    text_lower = text.lower()
    techs = []
    seen = set()
    for skill_set in [PROGRAMMING_LANGUAGES, FRAMEWORKS, DATABASES, CLOUD, TOOLS]:
        for skill in skill_set:
            if skill in seen:
                continue
            if len(skill) > 2 and re.search(r"\b" + re.escape(skill) + r"\b", text_lower):
                canonical = normalize_skill(skill)
                key = canonical.lower()
                if key not in seen:
                    seen.add(key)
                    techs.append(canonical)
    return techs


# ---------------------------------------------------------------------------
# Certifications
# ---------------------------------------------------------------------------

def _extract_certifications(sections: dict[str, list[str]]) -> list[dict[str, str]]:
    """Extract certification entries."""
    lines = sections.get("certifications", [])
    if not lines:
        return []

    entries = []
    for line in lines:
        if not line:
            continue
        line = line.lstrip("•·-▪►▸ ")
        if len(line) < 3:
            continue

        entry: dict[str, str] = {"name": line, "issuer": "", "date": ""}

        # Try to find a year (FIX B1: returns full years now)
        years = YEAR_RE.findall(line)
        if years:
            entry["date"] = years[-1]

        entries.append(entry)

    return entries


# ---------------------------------------------------------------------------
# Achievements
# ---------------------------------------------------------------------------

def _extract_achievements(sections: dict[str, list[str]]) -> list[str]:
    """Extract achievements/awards."""
    lines = sections.get("achievements", [])
    return [line.lstrip("•·-▪►▸ ") for line in lines if line]


# ---------------------------------------------------------------------------
# Years of experience
# ---------------------------------------------------------------------------

def _extract_years_of_experience(
    text: str, experience: list[dict[str, str]]
) -> dict[str, Any]:
    """
    Calculate or extract years of experience.

    Returns:
        {
            "value": float | None,
            "source": "stated" | "calculated" | "unknown"
        }
    """
    # 1. Check for explicitly stated duration
    stated_match = EXP_YEARS_STATED_RE.search(text)
    if stated_match:
        return {"value": float(stated_match.group(1)), "source": "stated"}

    # 2. Try to calculate from experience date ranges
    total_months = 0
    from datetime import date
    import calendar

    month_abbrevs = {
        "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
        "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
    }

    def _parse_year_month(s: str) -> tuple[int, int] | None:
        """Parse 'Jan 2020', '01/2020', or '2020' into (year, month)."""
        s = s.strip()
        # Month name + year
        m = re.match(r"([a-z]{3})(?:\w*)\s+(\d{4})", s, re.IGNORECASE)
        if m:
            mon = month_abbrevs.get(m.group(1).lower()[:3])
            if mon:
                return int(m.group(2)), mon
        # MM/YYYY
        m = re.match(r"(\d{1,2})/(\d{4})", s)
        if m:
            month = int(m.group(1))
            if 1 <= month <= 12:
                return int(m.group(2)), month
        # Year only
        m = re.match(r"((?:19|20)\d{2})", s)
        if m:
            return int(m.group(1)), 1
        return None

    current_year = date.today().year
    current_month = date.today().month

    for exp in experience:
        start_str = exp.get("startDate", "")
        end_str = exp.get("endDate", "")

        start = _parse_year_month(start_str) if start_str else None
        if end_str.lower() in ("present", "current", "now", ""):
            end = (current_year, current_month)
        else:
            end = _parse_year_month(end_str) if end_str else None

        if start and end:
            months = (end[0] - start[0]) * 12 + (end[1] - start[1])
            if 0 < months <= 600:  # Sanity: max 50 years
                total_months += months

    if total_months > 0:
        return {"value": round(total_months / 12, 1), "source": "calculated"}

    return {"value": None, "source": "unknown"}


# ---------------------------------------------------------------------------
# Utility: flatten all skills to a single list
# ---------------------------------------------------------------------------

def flatten_skills(skills_dict: dict[str, list[str]]) -> list[str]:
    """Return a flat list of all skills from the categorized dict."""
    result = []
    for values in skills_dict.values():
        result.extend(values)
    return result
