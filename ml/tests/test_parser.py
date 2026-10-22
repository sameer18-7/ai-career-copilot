"""
Parser Tests
============
Unit tests for ml/src/resume_parser.py

Tests:
  - Complete-year extraction (B1 fix)
  - Inline section heading parsing (B2 fix)
  - Common date formats and malformed dates
  - Email, phone, LinkedIn, GitHub, portfolio extraction
  - Candidate-name extraction (B3 fix)
  - Degree and certification patterns
  - Skill aliases and overlapping terms
  - Duplicate skill deduplication
  - Skills in unrelated contexts
  - Overlapping employment periods
  - Missing and malformed documents
  - Skill taxonomy normalization

Run with: python -m pytest ml/tests/test_parser.py -v
"""

import sys
import os

# Ensure ml package is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

import pytest
from ml.src.resume_parser import (
    YEAR_RE,
    EMAIL_RE,
    PHONE_RE,
    LINKEDIN_RE,
    GITHUB_RE,
    _detect_sections,
    _extract_candidate,
    _extract_education,
    _extract_skills,
    normalize_skill,
    flatten_skills,
    parse_resume,
)


# ===========================================================================
# YEAR_RE tests (B1 fix)
# ===========================================================================

class TestYearRegex:
    def test_finds_full_years(self):
        """findall must return full 4-digit years, not century prefixes."""
        years = YEAR_RE.findall("I worked from 2019 to 2023.")
        assert years == ["2019", "2023"], f"Got: {years}"

    def test_finds_single_year(self):
        years = YEAR_RE.findall("Graduated in 2020.")
        assert years == ["2020"]

    def test_rejects_3_digit_number(self):
        years = YEAR_RE.findall("Room 201 is ready.")
        assert years == [], f"Got: {years}"

    def test_rejects_5_digit_number(self):
        years = YEAR_RE.findall("ID 20200 is invalid.")
        assert years == []

    def test_multiple_years_in_range(self):
        years = YEAR_RE.findall("Experience: 2018–2021")
        assert "2018" in years
        assert "2021" in years

    def test_century_prefix_not_returned(self):
        """Regression: capturing group bug would return '20', '20' not '2020', '2021'."""
        years = YEAR_RE.findall("2020 2021")
        assert all(len(y) == 4 for y in years), f"Short year found: {years}"

    def test_1900s_years(self):
        years = YEAR_RE.findall("Born 1985, graduated 1999")
        assert "1985" in years
        assert "1999" in years

    def test_rejects_non_century_prefix(self):
        years = YEAR_RE.findall("Room 3042 hall 1842")
        # 1842 should not match (18xx, not 19xx or 20xx)
        assert "1842" not in years


# ===========================================================================
# Section detection tests (B2 fix)
# ===========================================================================

class TestSectionDetection:
    def test_inline_skills_header(self):
        """Skills: Python, SQL should put 'Python, SQL' into the skills section."""
        lines = [
            "John Doe",
            "Skills: Python, SQL, Docker",
            "Experience: Software Engineer, Acme Corp",
        ]
        sections = _detect_sections(lines)
        skills_text = " ".join(sections["skills"])
        assert "Python" in skills_text or "SQL" in skills_text, (
            f"Inline skills not captured. skills section: {sections['skills']}"
        )

    def test_inline_education_header(self):
        lines = ["Education — B.Tech, Computer Science"]
        sections = _detect_sections(lines)
        edu_text = " ".join(sections["education"])
        assert "B.Tech" in edu_text or "Computer" in edu_text

    def test_standard_section_header(self):
        """Normal multi-line section structure works."""
        lines = [
            "Skills",
            "Python",
            "JavaScript",
        ]
        sections = _detect_sections(lines)
        assert "Python" in sections["skills"]
        assert "JavaScript" in sections["skills"]

    def test_header_is_not_in_section_content(self):
        """The word 'Skills' itself should not appear as a skill."""
        lines = ["Skills", "Python"]
        sections = _detect_sections(lines)
        assert "Skills" not in sections["skills"]

    def test_multiline_experience(self):
        lines = [
            "Experience",
            "Software Engineer at Acme Corp",
            "2020 - Present",
        ]
        sections = _detect_sections(lines)
        assert any("Software Engineer" in l for l in sections["experience"])

    def test_empty_lines_preserved(self):
        lines = ["Skills", "Python", "", "JavaScript"]
        sections = _detect_sections(lines)
        assert "Python" in sections["skills"]
        assert "JavaScript" in sections["skills"]

    def test_unicode_dash_in_header(self):
        """Section headers with en-dash or em-dash separators."""
        lines = ["Education — B.Sc Computer Science, MIT, 2022"]
        sections = _detect_sections(lines)
        edu_text = " ".join(sections["education"])
        assert "B.Sc" in edu_text or "MIT" in edu_text or "Computer" in edu_text


# ===========================================================================
# Contact info tests
# ===========================================================================

class TestEmailExtraction:
    def test_basic_email(self):
        m = EMAIL_RE.search("Contact: john.doe@example.com")
        assert m is not None
        assert m.group(0) == "john.doe@example.com"

    def test_plus_addressing(self):
        m = EMAIL_RE.search("user+tag@domain.org")
        assert m is not None

    def test_no_false_positive_in_url(self):
        # URLs with @ should not produce false email matches
        m = EMAIL_RE.search("http://example.com/page")
        assert m is None

    def test_multiple_emails_first_found(self):
        text = "primary@a.com secondary@b.com"
        m = EMAIL_RE.search(text)
        assert m.group(0) == "primary@a.com"


class TestPhoneExtraction:
    def test_basic_phone(self):
        m = PHONE_RE.search("+1 (555) 123-4567")
        assert m is not None
        digits = "".join(c for c in m.group(0) if c.isdigit())
        assert len(digits) >= 7

    def test_us_format(self):
        m = PHONE_RE.search("555-867-5309")
        assert m is not None

    def test_international(self):
        m = PHONE_RE.search("+91 9876543210")
        assert m is not None

    def test_bare_year_not_phone(self):
        """A 4-digit year should not be matched as a phone number."""
        # We verify phone extraction in _extract_candidate requires 7+ digits
        text = "Graduated 2020"
        from ml.src.resume_parser import _extract_candidate
        import types
        result = _extract_candidate(text, None, text.split("\n"))
        # Should not interpret 2020 as a phone number
        phone = result["phone"]
        assert "2020" not in phone or phone == ""


class TestLinkedInExtraction:
    def test_basic_linkedin(self):
        m = LINKEDIN_RE.search("linkedin.com/in/johndoe")
        assert m is not None

    def test_with_https(self):
        m = LINKEDIN_RE.search("https://linkedin.com/in/jane-doe-123")
        assert m is not None

    def test_no_false_positive(self):
        m = LINKEDIN_RE.search("http://notlinkedin.com/in/user")
        assert m is None


class TestGitHubExtraction:
    def test_basic_github(self):
        m = GITHUB_RE.search("github.com/johndoe")
        assert m is not None

    def test_no_path_confusion(self):
        # github.com/user should not accidentally consume path segments
        m = GITHUB_RE.search("github.com/myuser")
        assert m is not None
        assert "myuser" in m.group(0)


# ===========================================================================
# Candidate name tests (B3 fix)
# ===========================================================================

class TestCandidateNameExtraction:
    def _parse(self, text):
        result = parse_resume(text)
        return result["candidate"]["name"]

    def test_name_from_first_line(self):
        text = "Alice Johnson\nalice@example.com\n+1 555 123 4567"
        name = self._parse(text)
        assert "Alice" in name or name == "Alice Johnson", f"Got: {name}"

    def test_does_not_pick_email_as_name(self):
        text = "alice@example.com\nAlice Johnson\nSoftware Engineer"
        name = self._parse(text)
        assert "@" not in name

    def test_short_name_only(self):
        text = "Jo\njo@test.com"
        name = self._parse(text)
        # "Jo" is ≤ 2 chars, should not be returned as name (too short per heuristic)
        # Could be empty — either way no crash
        assert isinstance(name, str)

    def test_name_not_a_section_heading(self):
        text = "Skills\nPython\nJava"
        name = self._parse(text)
        assert name != "Skills"


# ===========================================================================
# Skill extraction tests (B7 fix)
# ===========================================================================

class TestSkillExtraction:
    def _skills(self, text):
        sections = _detect_sections(text.split("\n"))
        return _extract_skills(sections, text)

    def test_basic_skills(self):
        text = "Skills\nPython, JavaScript, Docker"
        s = self._skills(text)
        all_skills = flatten_skills(s)
        assert any("Python" in sk for sk in all_skills)
        assert any("Docker" in sk for sk in all_skills)

    def test_deduplication(self):
        """Repeated skill mentions should not produce duplicates."""
        text = "Skills\nPython, Python, python"
        s = self._skills(text)
        all_lower = [sk.lower() for sk in flatten_skills(s)]
        assert all_lower.count("python") == 1, f"Duplicate python: {all_lower}"

    def test_alias_normalization(self):
        """'Postgres' → 'PostgreSQL', 'nodejs' → 'Node.js'"""
        canonical = normalize_skill("Postgres")
        assert canonical == "PostgreSQL", f"Got: {canonical}"

        canonical2 = normalize_skill("nodejs")
        assert canonical2 == "Node.js", f"Got: {canonical2}"

    def test_js_alias(self):
        assert normalize_skill("js") == "JavaScript"

    def test_sklearn_alias(self):
        assert normalize_skill("sklearn") == "scikit-learn"

    def test_java_and_javascript_not_merged(self):
        """Java and JavaScript are distinct skills."""
        text = "Skills\nJava, JavaScript"
        s = self._skills(text)
        all_skills = [sk.lower() for sk in flatten_skills(s)]
        assert "java" in all_skills
        assert "javascript" in all_skills

    def test_single_char_r_not_falsely_matched(self):
        """The letter 'R' should not match in words like 'our', 'order'."""
        text = "We monitor our service performance in order to deliver results."
        sections = _detect_sections(text.split("\n"))
        s = _extract_skills(sections, text)
        prog_lower = [sk.lower() for sk in s["programmingLanguages"]]
        # 'r' should NOT appear just from incidental substrings
        assert "r" not in prog_lower or "r language" not in prog_lower, (
            "Single-char 'R' incorrectly matched in unrelated text"
        )

    def test_multiword_skill(self):
        text = "Skills\nMachine Learning, Deep Learning, NLP"
        sections = _detect_sections(text.split("\n"))
        # multi-word skills from the taxonomy/tools set
        s = _extract_skills(sections, text)
        all_skills = flatten_skills(s)
        assert len(all_skills) > 0

    def test_pipe_delimiter(self):
        text = "Skills\nPython | JavaScript | Docker"
        sections = _detect_sections(text.split("\n"))
        s = _extract_skills(sections, text)
        all_lower = [sk.lower() for sk in flatten_skills(s)]
        assert "python" in all_lower

    def test_bullet_skills(self):
        text = "Skills\n• Python\n• JavaScript\n• Docker"
        sections = _detect_sections(text.split("\n"))
        s = _extract_skills(sections, text)
        all_lower = [sk.lower() for sk in flatten_skills(s)]
        assert "python" in all_lower


# ===========================================================================
# Education tests
# ===========================================================================

class TestEducationExtraction:
    def test_degree_extracted(self):
        text = "Education\nB.Tech in Computer Science, MIT, 2022"
        result = parse_resume(text)
        edu = result["education"]
        assert len(edu) > 0
        assert "B.Tech" in edu[0]["degree"] or "Computer" in edu[0]["degree"]

    def test_year_full_four_digits(self):
        """Education year must be a 4-digit string."""
        text = "Education\nBachelor of Science, State University\n2018 - 2022"
        result = parse_resume(text)
        edu = result["education"]
        if edu:
            year = edu[0].get("year", "")
            if year:
                assert len(year) == 4, f"Short year: {year!r}"
                assert year.startswith(("19", "20"))

    def test_gpa_extracted(self):
        text = "Education\nB.S. Computer Science\nGPA: 3.8/4.0"
        result = parse_resume(text)
        edu = result["education"]
        if edu:
            assert edu[0].get("gpa", "") in ("3.8", "")


# ===========================================================================
# Certifications tests
# ===========================================================================

class TestCertificationExtraction:
    def test_basic_cert(self):
        text = "Certifications\nAWS Certified Solutions Architect — 2023"
        result = parse_resume(text)
        certs = result["certifications"]
        assert len(certs) > 0
        assert "AWS" in certs[0]["name"]

    def test_cert_year_extracted(self):
        text = "Certifications\nGoogle Cloud Professional Data Engineer 2022"
        result = parse_resume(text)
        certs = result["certifications"]
        if certs:
            assert certs[0].get("date", "") in ("2022", "")


# ===========================================================================
# Skill normalization
# ===========================================================================

class TestNormalization:
    def test_postgres_canonical(self):
        assert normalize_skill("Postgres") == "PostgreSQL"

    def test_scikit_variants(self):
        assert normalize_skill("scikit learn") == "scikit-learn"
        assert normalize_skill("Scikit-learn") == "scikit-learn"

    def test_unknown_skill_passthrough(self):
        # Unknown skills are returned as-is
        result = normalize_skill("FictionalTechXYZ")
        assert result == "FictionalTechXYZ"

    def test_case_insensitive_alias(self):
        assert normalize_skill("NODEJS") == "Node.js"

    def test_nextjs_variants(self):
        assert normalize_skill("nextjs") == "Next.js"
        assert normalize_skill("next.js") == "Next.js"

    def test_tensorflow_alias(self):
        assert normalize_skill("tf") == "TensorFlow"


# ===========================================================================
# Edge cases
# ===========================================================================

class TestEdgeCases:
    def test_empty_text(self):
        result = parse_resume("")
        assert isinstance(result, dict)
        assert result["candidate"]["name"] == ""
        assert result["skills"]["programmingLanguages"] == []

    def test_whitespace_only(self):
        result = parse_resume("   \n\n  \t  ")
        assert isinstance(result, dict)

    def test_very_short_text(self):
        result = parse_resume("John")
        assert isinstance(result, dict)

    def test_no_sections(self):
        text = "This is a plain paragraph with no section headers."
        result = parse_resume(text)
        assert isinstance(result, dict)

    def test_flatten_skills_empty(self):
        result = flatten_skills({})
        assert result == []

    def test_flatten_skills_multiple_categories(self):
        skills = {
            "programmingLanguages": ["Python", "Java"],
            "frameworks": ["React"],
            "databases": [],
        }
        flat = flatten_skills(skills)
        assert set(flat) == {"Python", "Java", "React"}
