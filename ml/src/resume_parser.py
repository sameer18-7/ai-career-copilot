"""
Resume Parser
=============
Uses spaCy NLP + regex patterns to extract structured information from resume text.

Extracts:
  - Candidate info (name, email, phone, LinkedIn, GitHub, location)
  - Summary
  - Skills (technical, programming languages, frameworks, databases, cloud, tools)
  - Education (institution, degree, field, dates, GPA)
  - Experience (company, title, duration, description)
  - Projects (name, description, technologies)
  - Certifications (name, issuer, date)
"""

import re
from typing import Any

import spacy

# ---------------------------------------------------------------------------
# Load spaCy model (singleton)
# ---------------------------------------------------------------------------

_nlp = None


def _get_nlp():
    global _nlp
    if _nlp is None:
        _nlp = spacy.load("en_core_web_sm")
    return _nlp


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

# ---------------------------------------------------------------------------
# Contact / entity patterns
# ---------------------------------------------------------------------------

EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")
PHONE_RE = re.compile(
    r"(?:\+?\d{1,3}[\s\-.]?)?\(?\d{2,4}\)?[\s\-.]?\d{3,4}[\s\-.]?\d{3,4}"
)
LINKEDIN_RE = re.compile(r"(?:linkedin\.com/in/|linkedin\.com/pub/)[\w\-]+", re.IGNORECASE)
GITHUB_RE = re.compile(r"(?:github\.com/)[\w\-]+", re.IGNORECASE)
PORTFOLIO_RE = re.compile(
    r"(?:https?://)?(?:www\.)?[\w\-]+\.(?:com|io|dev|me|org|net)(?:/[\w\-/]*)?",
    re.IGNORECASE,
)

# Education degree patterns
DEGREE_RE = re.compile(
    r"(Ph\.?D|Doctorate|Master(?:'s)?|M\.?S\.?|M\.?A\.?|M\.?B\.?A\.?|"
    r"M\.?Tech|M\.?E\.?|Bachelor(?:'s)?|B\.?S\.?|B\.?A\.?|B\.?E\.?|B\.?Tech|"
    r"B\.?Com|B\.?Sc|Associate(?:'s)?|Diploma|High\s+School|GED)",
    re.IGNORECASE,
)

DATE_RE = re.compile(
    r"(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|"
    r"Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|"
    r"Dec(?:ember)?)\s*,?\s*\d{4}|\d{1,2}/\d{4}|\d{4}",
    re.IGNORECASE,
)

GPA_RE = re.compile(
    r"(?:GPA|CGPA|Grade|Score)\s*:?\s*(\d+\.?\d*)\s*/?\s*(\d+\.?\d*)?",
    re.IGNORECASE,
)

YEAR_RE = re.compile(r"\b(19|20)\d{2}\b")


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
            "achievements": []
        }
    """
    nlp = _get_nlp()
    doc = nlp(text[:100_000])  # Cap to avoid memory issues

    # Split text into lines for section-based parsing
    lines = text.split("\n")

    # Extract sections
    sections = _detect_sections(lines)

    # Extract candidate info
    candidate = _extract_candidate(text, doc)

    # Extract each section
    summary = _extract_summary(sections)
    skills = _extract_skills(sections, text)
    education = _extract_education(sections)
    experience = _extract_experience(sections)
    projects = _extract_projects(sections)
    certifications = _extract_certifications(sections)
    achievements = _extract_achievements(sections)

    return {
        "candidate": candidate,
        "summary": summary,
        "skills": skills,
        "education": education,
        "experience": experience,
        "projects": projects,
        "certifications": certifications,
        "achievements": achievements,
    }


# ---------------------------------------------------------------------------
# Section detection
# ---------------------------------------------------------------------------

def _detect_sections(lines: list[str]) -> dict[str, list[str]]:
    """Split resume lines into labeled sections based on header detection."""
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
                break

        if not matched:
            sections[current_section].append(clean)

    return sections


# ---------------------------------------------------------------------------
# Candidate info extraction
# ---------------------------------------------------------------------------

def _extract_candidate(text: str, doc) -> dict[str, str]:
    """Extract candidate contact information."""
    # Email
    email_match = EMAIL_RE.search(text)
    email = email_match.group(0) if email_match else ""

    # Phone
    phone_match = PHONE_RE.search(text)
    phone = phone_match.group(0).strip() if phone_match else ""

    # LinkedIn
    linkedin_match = LINKEDIN_RE.search(text)
    linkedin = linkedin_match.group(0) if linkedin_match else ""

    # GitHub
    github_match = GITHUB_RE.search(text)
    github = github_match.group(0) if github_match else ""

    # Name: Use spaCy NER to find PERSON entities, pick the first one
    name = ""
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            candidate_name = ent.text.strip()
            # Filter out very short or very long names
            if 2 < len(candidate_name) < 50:
                name = candidate_name
                break

    # If spaCy didn't find a name, use the first non-empty line (common pattern)
    if not name:
        for line in text.split("\n"):
            line = line.strip()
            if line and not EMAIL_RE.search(line) and not PHONE_RE.search(line):
                # Check it looks like a name (mostly alpha, reasonable length)
                if len(line) < 50 and sum(c.isalpha() or c.isspace() for c in line) > len(line) * 0.7:
                    name = line
                    break

    # Location: Use spaCy GPE entities
    location = ""
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
        "portfolio": "",
    }


# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------

def _extract_summary(sections: dict[str, list[str]]) -> str:
    """Extract the professional summary."""
    lines = sections.get("summary", [])
    if not lines:
        # Try header section (sometimes summary is at the top without a header)
        header_lines = sections.get("header", [])
        # Look for long text blocks in the header (likely a summary)
        for line in header_lines:
            if len(line) > 100:
                return line
        return ""
    return " ".join(line for line in lines if line).strip()


# ---------------------------------------------------------------------------
# Skills
# ---------------------------------------------------------------------------

# Common skill categorization keywords
PROGRAMMING_LANGUAGES = {
    "python", "java", "javascript", "typescript", "c++", "c#", "c",
    "ruby", "go", "golang", "rust", "php", "swift", "kotlin", "scala",
    "r", "matlab", "perl", "dart", "lua", "haskell", "objective-c",
    "sql", "html", "css", "sass", "less", "shell", "bash", "powershell",
}

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
    "rest", "rest api", "rest apis", "grpc", "kafka", "rabbitmq",
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


def _extract_skills(sections: dict[str, list[str]], full_text: str) -> dict[str, list[str]]:
    """Extract and categorize skills."""
    skill_lines = sections.get("skills", [])
    raw_skills = set()

    # Parse skill lines (handle bullet points, commas, pipes)
    for line in skill_lines:
        if not line:
            continue
        # Split on common delimiters
        parts = re.split(r"[,;|•·▪►▸\-]|\s{2,}", line)
        for part in parts:
            skill = part.strip().strip("·•▪►▸-").strip()
            if skill and len(skill) > 1 and len(skill) < 60:
                raw_skills.add(skill)

    # Also scan full text for known skills
    text_lower = full_text.lower()

    categorized = {
        "technical": [],
        "programmingLanguages": [],
        "frameworks": [],
        "databases": [],
        "cloud": [],
        "tools": [],
        "softSkills": [],
    }

    seen = set()

    # Categorize raw skills
    for skill in raw_skills:
        skill_lower = skill.lower()
        if skill_lower in seen:
            continue
        seen.add(skill_lower)

        if skill_lower in PROGRAMMING_LANGUAGES:
            categorized["programmingLanguages"].append(skill)
        elif skill_lower in FRAMEWORKS:
            categorized["frameworks"].append(skill)
        elif skill_lower in DATABASES:
            categorized["databases"].append(skill)
        elif skill_lower in CLOUD:
            categorized["cloud"].append(skill)
        elif skill_lower in TOOLS:
            categorized["tools"].append(skill)
        elif skill_lower in SOFT_SKILLS_KW:
            categorized["softSkills"].append(skill)
        else:
            categorized["technical"].append(skill)

    # Supplement with known skills found in full text
    for skill_set, category in [
        (PROGRAMMING_LANGUAGES, "programmingLanguages"),
        (FRAMEWORKS, "frameworks"),
        (DATABASES, "databases"),
        (CLOUD, "cloud"),
        (TOOLS, "tools"),
    ]:
        for skill in skill_set:
            if skill not in seen and re.search(r"\b" + re.escape(skill) + r"\b", text_lower):
                seen.add(skill)
                categorized[category].append(skill.title() if len(skill) > 3 else skill.upper())

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

            # Extract year
            years = YEAR_RE.findall(line)
            if years:
                current["year"] = years[-1]
            else:
                current["year"] = ""

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

        # Check for "to" or "-" or "–" date ranges
        has_range = bool(re.search(r"(?:to|–|—|\-)\s*(?:present|current|\d)", line, re.IGNORECASE))

        if has_date or has_range:
            if current:
                current["description"] = " ".join(desc_lines)
                entries.append(current)
                desc_lines = []

            duration = " - ".join(dates) if dates else ""
            if re.search(r"present|current", line, re.IGNORECASE):
                duration += " - Present" if duration and "Present" not in duration else ""

            current = {
                "title": line,
                "company": "",
                "location": "",
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
                entries.append(current)
                current = None
                desc_lines = []
            continue

        # Project headers tend to be shorter, non-bullet lines
        is_bullet = line.startswith(("•", "·", "-", "▪", "►", "▸"))

        if not is_bullet and (current is None or len(line) < 80):
            if current:
                current["description"] = " ".join(desc_lines)
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
        entries.append(current)

    return entries


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

        # Try to find a year
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
# Utility: flatten all skills to a single list
# ---------------------------------------------------------------------------

def flatten_skills(skills_dict: dict[str, list[str]]) -> list[str]:
    """Return a flat list of all skills from the categorized dict."""
    result = []
    for values in skills_dict.values():
        result.extend(values)
    return result
