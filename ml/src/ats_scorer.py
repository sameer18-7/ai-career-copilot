"""
ATS Scorer & Weakness Detector
================================
Computes an explainable ATS score (0-100) with subscores and generates
text-only Quick Fixes based on detected resume weaknesses.

Scoring components:
  - Role Alignment (cosine similarity + skill overlap)
  - Keyword Match (skill coverage for target role)
  - Section Completeness (summary, skills, education, experience, etc.)
  - Formatting & Readability (action verbs, metrics, structure)
"""

from typing import Any

from .feature_engineering import (
    compute_resume_features,
    compute_role_alignment,
    compute_skill_overlap,
)
from .resume_parser import flatten_skills
from .role_knowledge import get_role_skills


# ---------------------------------------------------------------------------
# Sub-score weights (must sum to 1.0)
# ---------------------------------------------------------------------------

WEIGHTS = {
    "role_alignment": 0.30,
    "keyword_match": 0.25,
    "section_completeness": 0.25,
    "formatting": 0.20,
}


# ---------------------------------------------------------------------------
# ATS Scoring
# ---------------------------------------------------------------------------

def compute_ats_score(
    parsed_resume: dict[str, Any],
    raw_text: str,
    target_role: str,
) -> dict[str, Any]:
    """
    Compute an explainable ATS score with sub-score breakdown.

    Returns:
        {
            "atsScore": int (0-100),
            "atsSubScores": [
                {"label": "Role Alignment", "value": int},
                {"label": "Keyword Match", "value": int},
                {"label": "Section Completeness", "value": int},
                {"label": "Formatting & Readability", "value": int},
            ]
        }
    """
    features = compute_resume_features(parsed_resume, raw_text)

    # --- Role Alignment sub-score ---
    role_alignment_raw = compute_role_alignment(raw_text, target_role)
    role_alignment_score = int(min(role_alignment_raw * 130, 100))  # Scaled up slightly

    # --- Keyword Match sub-score ---
    skills_dict = parsed_resume.get("skills", {})
    if isinstance(skills_dict, dict):
        flat_skills = flatten_skills(skills_dict)
    else:
        flat_skills = skills_dict if isinstance(skills_dict, list) else []

    overlap_ratio, _, _ = compute_skill_overlap(flat_skills, target_role)
    keyword_score = int(min(overlap_ratio * 120, 100))  # Scaled

    # Boost keyword score if resume text contains many role keywords
    role_skills = get_role_skills(target_role)
    if role_skills:
        text_lower = raw_text.lower()
        text_matches = sum(1 for s in role_skills if s.lower() in text_lower)
        text_ratio = text_matches / len(role_skills)
        keyword_score = int((keyword_score * 0.6) + (text_ratio * 100 * 0.4))

    # --- Section Completeness sub-score ---
    section_score = int(features["section_completeness"] * 100)

    # Bonus for having all key sections
    if features["has_summary"] and features["has_skills"] and features["has_experience"]:
        section_score = min(section_score + 10, 100)

    # --- Formatting & Readability sub-score ---
    formatting_components = [
        features["action_verb_density"] * 0.30,
        features["metrics_density"] * 0.25,
        features["length_score"] * 0.25,
        features["contact_completeness"] * 0.20,
    ]
    formatting_score = int(sum(formatting_components) * 100)

    # --- Weighted total ---
    ats_score = int(
        role_alignment_score * WEIGHTS["role_alignment"]
        + keyword_score * WEIGHTS["keyword_match"]
        + section_score * WEIGHTS["section_completeness"]
        + formatting_score * WEIGHTS["formatting"]
    )

    # Clamp
    ats_score = max(0, min(100, ats_score))

    return {
        "atsScore": ats_score,
        "atsSubScores": [
            {"label": "Role Alignment", "value": max(0, min(100, role_alignment_score))},
            {"label": "Keyword Match", "value": max(0, min(100, keyword_score))},
            {"label": "Section Completeness", "value": max(0, min(100, section_score))},
            {"label": "Formatting & Readability", "value": max(0, min(100, formatting_score))},
        ],
    }


# ---------------------------------------------------------------------------
# Quick Fixes (Weakness Detection)
# ---------------------------------------------------------------------------

def generate_quick_fixes(
    parsed_resume: dict[str, Any],
    raw_text: str,
    target_role: str,
    max_fixes: int = 7,
) -> list[str]:
    """
    Generate text-only quick fix recommendations based on detected weaknesses.

    Returns a list of actionable improvement strings.
    """
    features = compute_resume_features(parsed_resume, raw_text)
    fixes: list[str] = []

    # --- Missing summary ---
    if not features["has_summary"]:
        fixes.append(
            f"Add a professional summary at the top of your resume, "
            f"tailored to {target_role} roles."
        )

    # --- Few or no skills listed ---
    if features["num_skills"] < 5:
        fixes.append(
            "Expand your skills section. List specific technical skills, "
            "tools, and frameworks relevant to your target role."
        )

    # --- No measurable achievements ---
    if features["metrics_count"] == 0:
        fixes.append(
            "Add measurable achievements to your experience "
            "(e.g., 'Reduced API latency by 40%', 'Managed a team of 8')."
        )
    elif features["metrics_count"] < 3:
        fixes.append(
            "Quantify more of your achievements with specific numbers, "
            "percentages, or dollar amounts."
        )

    # --- Low action verb usage ---
    if features["action_verb_density"] < 0.3:
        fixes.append(
            "Start bullet points with strong action verbs "
            "(e.g., 'Developed', 'Implemented', 'Led', 'Optimized')."
        )

    # --- Missing experience ---
    if not features["has_experience"]:
        fixes.append(
            "Add work experience, internships, or relevant volunteer work "
            "to demonstrate practical application of your skills."
        )

    # --- Missing education ---
    if not features["has_education"]:
        fixes.append(
            "Include your educational background, degrees, and relevant coursework."
        )

    # --- No projects ---
    if not features["has_projects"]:
        fixes.append(
            "Add personal or academic projects that demonstrate your skills "
            f"in {target_role}-related work."
        )

    # --- No certifications ---
    if not features["has_certifications"]:
        role_skills = get_role_skills(target_role)
        if role_skills:
            fixes.append(
                f"Consider adding relevant certifications for {target_role} roles "
                f"to strengthen your profile."
            )

    # --- Contact info incomplete ---
    if features["contact_completeness"] < 0.5:
        fixes.append(
            "Complete your contact information (email, phone, LinkedIn profile)."
        )

    # --- Skill gap with target role ---
    skills_dict = parsed_resume.get("skills", {})
    if isinstance(skills_dict, dict):
        flat_skills = flatten_skills(skills_dict)
    else:
        flat_skills = skills_dict if isinstance(skills_dict, list) else []

    _, _, missing = compute_skill_overlap(flat_skills, target_role)
    if len(missing) >= 3:
        top_missing = missing[:3]
        fixes.append(
            f"Add experience with key skills for {target_role}: "
            f"{', '.join(top_missing)}."
        )

    # --- Resume too short ---
    if features["word_count"] < 200:
        fixes.append(
            "Your resume appears quite short. Expand your descriptions "
            "with more detail about your responsibilities and achievements."
        )

    # --- Resume too long ---
    if features["word_count"] > 1200:
        fixes.append(
            "Consider condensing your resume. Focus on the most relevant "
            "and recent experience for your target role."
        )

    return fixes[:max_fixes]
