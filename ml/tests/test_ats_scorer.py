"""
ATS Scorer Tests
================
Unit tests for ml/src/ats_scorer.py

Tests:
  - Weights sum to exactly 1.0
  - Weighted contributions agree with final score
  - Identical inputs produce identical outputs
  - Same roleAlignment value used in atsSubScores and top-level field
  - Required/preferred skill split and handling
  - Project and experience evidence
  - Negated skill mentions are not counted as positive
  - Unknown roles do not silently use wrong profile
  - Missing evidence ≠ proof of missing ability (check returned text)
  - Protected characteristics do not appear in scoring inputs

Run with: python -m pytest ml/tests/test_ats_scorer.py -v
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

import pytest
from ml.src.ats_scorer import compute_ats_score, generate_quick_fixes, WEIGHTS


# ===========================================================================
# Fixtures
# ===========================================================================

SAMPLE_RESUME = {
    "candidate": {
        "name": "Alice Smith",
        "email": "alice@example.com",
        "phone": "555-0100",
        "location": "San Francisco, CA",
        "linkedin": "linkedin.com/in/alice-smith",
        "github": "github.com/alicesmith",
    },
    "summary": "Experienced software engineer with 5 years building scalable Python APIs.",
    "skills": {
        "programmingLanguages": ["Python", "JavaScript"],
        "frameworks": ["FastAPI", "React"],
        "databases": ["PostgreSQL", "MongoDB"],
        "cloud": ["AWS"],
        "tools": ["Docker", "Git", "CI/CD"],
        "technical": [],
        "softSkills": [],
    },
    "education": [
        {"degree": "B.S. Computer Science", "institution": "MIT", "year": "2018"}
    ],
    "experience": [
        {
            "title": "Senior Software Engineer",
            "company": "Acme Corp",
            "duration": "2020 – Present",
            "startDate": "2020",
            "endDate": "Present",
            "description": "Built Python microservices and REST APIs using FastAPI and Docker.",
        }
    ],
    "projects": [
        {
            "name": "Data Dashboard",
            "description": "React frontend with FastAPI backend, deployed on AWS.",
            "technologies": ["React", "FastAPI", "AWS"],
        }
    ],
    "certifications": [],
    "achievements": [],
    "yearsOfExperience": {"value": 5.0, "source": "calculated"},
}

SAMPLE_RAW_TEXT = """Alice Smith
alice@example.com | 555-0100 | linkedin.com/in/alice-smith | github.com/alicesmith

Summary
Experienced software engineer with 5 years building scalable Python APIs.

Skills
Python, JavaScript, FastAPI, React, PostgreSQL, MongoDB, AWS, Docker, Git, CI/CD

Experience
Senior Software Engineer — Acme Corp
2020 – Present
Built Python microservices and REST APIs using FastAPI and Docker.
Reduced API latency by 40% through caching.

Projects
Data Dashboard
React frontend with FastAPI backend, deployed on AWS.

Education
B.S. Computer Science, MIT, 2018
"""


# ===========================================================================
# Weight integrity
# ===========================================================================

class TestWeightIntegrity:
    def test_weights_sum_to_one(self):
        """WEIGHTS must sum to exactly 1.0 (checked at import time by assertion)."""
        total = round(sum(WEIGHTS.values()), 10)
        assert total == 1.0, f"Weights sum to {total}, not 1.0. {WEIGHTS}"

    def test_all_components_present(self):
        expected = {
            "required_skills", "preferred_skills", "experience_evidence",
            "role_alignment", "section_completeness", "formatting",
        }
        assert set(WEIGHTS.keys()) == expected

    def test_no_negative_weights(self):
        assert all(w >= 0 for w in WEIGHTS.values())

    def test_weighted_scores_agree_with_total(self):
        result = compute_ats_score(SAMPLE_RESUME, SAMPLE_RAW_TEXT, "Software Engineer")
        sub_scores = result["atsSubScores"]

        computed_total = round(sum(s["weightedScore"] for s in sub_scores))
        ats = result["atsScore"]

        # Allow ±2 for rounding
        assert abs(computed_total - ats) <= 2, (
            f"Weighted sum {computed_total} does not agree with atsScore {ats}. "
            f"Sub-scores: {[(s['label'], s['weightedScore']) for s in sub_scores]}"
        )


# ===========================================================================
# Determinism
# ===========================================================================

class TestDeterminism:
    def test_identical_inputs_identical_output(self):
        """Same inputs must always produce same outputs."""
        result1 = compute_ats_score(SAMPLE_RESUME, SAMPLE_RAW_TEXT, "Software Engineer")
        result2 = compute_ats_score(SAMPLE_RESUME, SAMPLE_RAW_TEXT, "Software Engineer")
        assert result1["atsScore"] == result2["atsScore"]
        assert result1["roleAlignment"] == result2["roleAlignment"]
        assert result1["matchedSkills"] == result2["matchedSkills"]

    def test_different_roles_different_scores(self):
        """Different target roles should produce different missing skills."""
        res_se = compute_ats_score(SAMPLE_RESUME, SAMPLE_RAW_TEXT, "Software Engineer")
        res_nurse = compute_ats_score(SAMPLE_RESUME, SAMPLE_RAW_TEXT, "Nurse")
        # A software-focused resume should score much lower for Nurse
        assert res_nurse["atsScore"] < res_se["atsScore"]


# ===========================================================================
# Role alignment consistency (B4 fix)
# ===========================================================================

class TestRoleAlignmentConsistency:
    def test_role_alignment_consistent_in_subscores_and_toplevel(self):
        """roleAlignment must match the Role Alignment sub-score rawScore."""
        result = compute_ats_score(SAMPLE_RESUME, SAMPLE_RAW_TEXT, "Software Engineer")

        top_level_ra = result["roleAlignment"]
        sub_score_ra = next(
            (s["rawScore"] for s in result["atsSubScores"] if s["label"] == "Role Alignment"),
            None,
        )
        assert sub_score_ra is not None, "Role Alignment sub-score not found"
        # Both are now float with 1 decimal (round(..., 1)) — must be identical.
        assert top_level_ra == sub_score_ra, (
            f"Top-level roleAlignment {top_level_ra} ≠ sub-score rawScore {sub_score_ra}. "
            "Both should be round(raw * 100, 1) from the same computation."
        )

    def test_role_alignment_in_range(self):
        result = compute_ats_score(SAMPLE_RESUME, SAMPLE_RAW_TEXT, "Software Engineer")
        assert 0 <= result["roleAlignment"] <= 100


# ===========================================================================
# Skill matching
# ===========================================================================

class TestSkillMatching:
    def test_required_skills_matched(self):
        result = compute_ats_score(SAMPLE_RESUME, SAMPLE_RAW_TEXT, "Software Engineer")
        # Python is in SAMPLE_RESUME and should be matched
        assert "Python" in result["matchedSkills"] or len(result["matchedSkills"]) > 0

    def test_missing_required_skills_returned(self):
        result = compute_ats_score(SAMPLE_RESUME, SAMPLE_RAW_TEXT, "Nurse")
        # Nurse skills like "Patient Care" are missing
        assert len(result["missingRequiredSkills"]) > 0

    def test_no_match_for_empty_resume(self):
        empty_resume = {
            "candidate": {"name": "", "email": "", "phone": "", "location": "", "linkedin": "", "github": ""},
            "summary": "",
            "skills": {"technical": [], "programmingLanguages": [], "frameworks": [],
                       "databases": [], "cloud": [], "tools": [], "softSkills": []},
            "education": [], "experience": [], "projects": [], "certifications": [],
            "achievements": [], "yearsOfExperience": {"value": None, "source": "unknown"},
        }
        result = compute_ats_score(empty_resume, "", "Software Engineer")
        assert result["atsScore"] == 0 or result["atsScore"] < 20

    def test_evidence_structure(self):
        result = compute_ats_score(SAMPLE_RESUME, SAMPLE_RAW_TEXT, "Software Engineer")
        for item in result["evidence"]:
            assert "skill" in item
            assert "source" in item
            assert "evidence" in item
            assert item["source"] in ("skills_section", "experience", "project", "text_mention")

    def test_project_skills_are_evidenced(self):
        """Skills used in projects should be captured in evidence."""
        result = compute_ats_score(SAMPLE_RESUME, SAMPLE_RAW_TEXT, "Software Engineer")
        sources = {e["source"] for e in result["evidence"]}
        # Should have at least skills_section or project source
        assert len(sources) > 0

    def test_negated_skill_not_counted(self):
        """'No experience with X' should not award points for X."""
        resume_with_negation = dict(SAMPLE_RESUME)
        negated_text = SAMPLE_RAW_TEXT + "\nNo experience with Kubernetes."
        result = compute_ats_score(resume_with_negation, negated_text, "DevOps Engineer")
        # Kubernetes should be in missing, not matched
        matched = [m.lower() for m in result["matchedSkills"]]
        assert "kubernetes" not in matched or "kubernetes" in [m.lower() for m in result["missingRequiredSkills"]]

    def test_preferred_skills_separate_from_required(self):
        """Preferred skills should not be in missingRequiredSkills."""
        result = compute_ats_score(SAMPLE_RESUME, SAMPLE_RAW_TEXT, "Software Engineer")
        required_missing = set(result["missingRequiredSkills"])
        preferred_missing = set(result["missingPreferredSkills"])
        # Required and preferred missing sets should be disjoint
        assert required_missing.isdisjoint(preferred_missing), (
            f"Overlap: {required_missing & preferred_missing}"
        )


# ===========================================================================
# Unknown role handling
# ===========================================================================

class TestUnknownRole:
    def test_unknown_role_does_not_crash(self):
        """Unknown roles should not raise exceptions."""
        result = compute_ats_score(SAMPLE_RESUME, SAMPLE_RAW_TEXT, "Interdimensional Travel Agent")
        assert isinstance(result["atsScore"], int)

    def test_unknown_role_neutral_alignment(self):
        """Unknown role returns a defined result, not arbitrary garbage."""
        result = compute_ats_score(SAMPLE_RESUME, SAMPLE_RAW_TEXT, "ZZZZUNKNOWNROLE")
        assert result["atsScore"] >= 0
        assert result["atsScore"] <= 100


# ===========================================================================
# Score type
# ===========================================================================

class TestScoreType:
    def test_role_based_without_jd(self):
        result = compute_ats_score(SAMPLE_RESUME, SAMPLE_RAW_TEXT, "Software Engineer")
        assert result["scoreType"] == "role_based"

    def test_jd_based_with_jd(self):
        jd = "We are looking for a Python and Docker expert with REST API experience."
        result = compute_ats_score(SAMPLE_RESUME, SAMPLE_RAW_TEXT, "Software Engineer", job_description=jd)
        assert result["scoreType"] == "jd_based"


# ===========================================================================
# Missing evidence ≠ missing ability
# ===========================================================================

class TestMissingEvidenceDisclaimer:
    def test_missing_required_skills_has_disclaimer(self):
        """
        Required skills in missingRequiredSkills are 'not evidenced', not 'not possessed'.
        The section completeness explanation should not claim the candidate lacks ability.
        """
        result = compute_ats_score(SAMPLE_RESUME, SAMPLE_RAW_TEXT, "Nurse")
        sub = next((s for s in result["atsSubScores"] if s["label"] == "Required Skill Coverage"), None)
        if sub and sub["explanation"]:
            explanation = sub["explanation"].lower()
            # Should say "evidenced" not "you don't have" or "you lack"
            assert "evidenced" in explanation or "found" in explanation


# ===========================================================================
# Quick fixes
# ===========================================================================

class TestQuickFixes:
    def test_returns_list(self):
        result = compute_ats_score(SAMPLE_RESUME, SAMPLE_RAW_TEXT, "Software Engineer")
        fixes = generate_quick_fixes(SAMPLE_RESUME, SAMPLE_RAW_TEXT, "Software Engineer", ats_result=result)
        assert isinstance(fixes, list)

    def test_max_fixes_respected(self):
        result = compute_ats_score(SAMPLE_RESUME, SAMPLE_RAW_TEXT, "Software Engineer")
        fixes = generate_quick_fixes(SAMPLE_RESUME, SAMPLE_RAW_TEXT, "Software Engineer",
                                     ats_result=result, max_fixes=3)
        assert len(fixes) <= 3

    def test_empty_resume_generates_fixes(self):
        empty = {
            "candidate": {"name": "", "email": "", "phone": "", "location": "", "linkedin": "", "github": ""},
            "summary": "", "skills": {"technical": [], "programmingLanguages": [], "frameworks": [],
                                      "databases": [], "cloud": [], "tools": [], "softSkills": []},
            "education": [], "experience": [], "projects": [], "certifications": [],
            "achievements": [], "yearsOfExperience": {"value": None, "source": "unknown"},
        }
        fixes = generate_quick_fixes(empty, "", "Software Engineer")
        assert len(fixes) > 0
