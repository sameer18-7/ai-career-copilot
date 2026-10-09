"""
Feature Engineering
===================
Builds feature representations for resume analysis:
  - TF-IDF vectorization (unigram + bigram, sublinear TF)
  - Resume quality features (section completeness, skill count, etc.)
  - Role alignment features (cosine similarity)
"""

import re
from typing import Any

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from .role_knowledge import get_role_skills
from .resume_parser import flatten_skills


# ---------------------------------------------------------------------------
# Action verbs commonly expected in strong resumes
# ---------------------------------------------------------------------------

ACTION_VERBS = {
    "achieved", "administered", "analyzed", "architected", "automated",
    "built", "collaborated", "communicated", "conducted", "configured",
    "created", "debugged", "delivered", "deployed", "designed", "developed",
    "directed", "documented", "enhanced", "established", "evaluated",
    "executed", "facilitated", "formulated", "generated", "identified",
    "implemented", "improved", "increased", "initiated", "integrated",
    "launched", "led", "maintained", "managed", "mentored", "migrated",
    "monitored", "negotiated", "operated", "optimized", "orchestrated",
    "organized", "oversaw", "performed", "planned", "presented",
    "produced", "programmed", "published", "recommended", "reduced",
    "refactored", "resolved", "restructured", "reviewed", "scaled",
    "secured", "simplified", "spearheaded", "streamlined", "supervised",
    "supported", "tested", "trained", "transformed", "troubleshot",
    "upgraded", "utilized", "verified", "wrote",
}

# Patterns for measurable achievements
METRICS_RE = re.compile(
    r"\d+%|\$\d+|\d+\+?\s*(?:users|clients|customers|projects|team\s*members|"
    r"people|employees|applications|servers|tickets|reports|queries|records|"
    r"orders|transactions|accounts|requests|sessions|hours|days|weeks|months|years)",
    re.IGNORECASE,
)


# ---------------------------------------------------------------------------
# Resume Quality Features
# ---------------------------------------------------------------------------

def compute_resume_features(parsed_resume: dict[str, Any], raw_text: str) -> dict[str, float]:
    """
    Compute numerical features from a parsed resume.

    Returns a dict of feature_name -> value, all normalized to 0-1 where
    practical.
    """
    skills = parsed_resume.get("skills", {})
    flat_skills = flatten_skills(skills) if isinstance(skills, dict) else skills
    education = parsed_resume.get("education", [])
    experience = parsed_resume.get("experience", [])
    projects = parsed_resume.get("projects", [])
    certifications = parsed_resume.get("certifications", [])
    candidate = parsed_resume.get("candidate", {})
    summary = parsed_resume.get("summary", "")

    text_lower = raw_text.lower()
    words = text_lower.split()
    word_count = len(words)

    # --- Section completeness ---
    has_summary = 1.0 if summary and len(summary) > 20 else 0.0
    has_skills = 1.0 if len(flat_skills) > 0 else 0.0
    has_education = 1.0 if len(education) > 0 else 0.0
    has_experience = 1.0 if len(experience) > 0 else 0.0
    has_projects = 1.0 if len(projects) > 0 else 0.0
    has_certifications = 1.0 if len(certifications) > 0 else 0.0

    section_count = sum([
        has_summary, has_skills, has_education,
        has_experience, has_projects, has_certifications,
    ])
    section_completeness = section_count / 6.0

    # --- Contact completeness ---
    contact_fields = ["name", "email", "phone", "linkedin", "github", "location"]
    contact_filled = sum(1 for f in contact_fields if candidate.get(f, ""))
    contact_completeness = contact_filled / len(contact_fields)

    # --- Skill density ---
    num_skills = len(flat_skills)
    skill_density = min(num_skills / 15.0, 1.0)  # Cap at 15 skills

    # --- Action verb usage ---
    action_verb_count = sum(
        1 for w in words if w.strip(".,;:!?") in ACTION_VERBS
    )
    action_verb_density = min(action_verb_count / 20.0, 1.0)

    # --- Measurable achievements ---
    metrics_count = len(METRICS_RE.findall(raw_text))
    metrics_density = min(metrics_count / 5.0, 1.0)

    # --- Resume length (normalized) ---
    # Ideal resume: 300-800 words
    if word_count < 100:
        length_score = 0.2
    elif word_count < 300:
        length_score = 0.6
    elif word_count <= 800:
        length_score = 1.0
    elif word_count <= 1200:
        length_score = 0.8
    else:
        length_score = 0.5

    # --- Experience depth ---
    exp_count = len(experience)
    experience_depth = min(exp_count / 4.0, 1.0)

    # --- Education depth ---
    edu_count = len(education)
    education_depth = min(edu_count / 2.0, 1.0)

    return {
        "section_completeness": section_completeness,
        "contact_completeness": contact_completeness,
        "has_summary": has_summary,
        "has_skills": has_skills,
        "has_education": has_education,
        "has_experience": has_experience,
        "has_projects": has_projects,
        "has_certifications": has_certifications,
        "num_skills": num_skills,
        "skill_density": skill_density,
        "action_verb_count": action_verb_count,
        "action_verb_density": action_verb_density,
        "metrics_count": metrics_count,
        "metrics_density": metrics_density,
        "word_count": word_count,
        "length_score": length_score,
        "experience_depth": experience_depth,
        "education_depth": education_depth,
        "num_experience": exp_count,
        "num_education": edu_count,
        "num_projects": len(projects),
        "num_certifications": len(certifications),
    }


# ---------------------------------------------------------------------------
# Role Alignment (TF-IDF cosine similarity)
# ---------------------------------------------------------------------------

def compute_role_alignment(
    resume_text: str,
    target_role: str,
    tfidf_vectorizer: TfidfVectorizer | None = None,
) -> float:
    """
    Compute cosine similarity between resume text and the target role's
    expected skill profile.

    Returns a float in [0, 1].
    """
    role_skills = get_role_skills(target_role)
    if not role_skills:
        return 0.5  # Neutral if we don't know the role

    # Build a synthetic "role document" from expected skills
    role_doc = " ".join(role_skills)

    if tfidf_vectorizer is not None:
        try:
            vectors = tfidf_vectorizer.transform([resume_text, role_doc])
            sim = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
            return float(np.clip(sim, 0.0, 1.0))
        except Exception:
            pass

    # Fallback: create a local vectorizer
    vectorizer = TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),
        sublinear_tf=True,
        stop_words="english",
    )
    try:
        vectors = vectorizer.fit_transform([resume_text, role_doc])
        sim = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
        return float(np.clip(sim, 0.0, 1.0))
    except Exception:
        return 0.5


def compute_skill_overlap(
    resume_skills: list[str], target_role: str
) -> tuple[float, list[str], list[str]]:
    """
    Compute skill overlap between resume skills and expected role skills.

    Returns:
        (overlap_ratio, matching_skills, missing_skills)
    """
    role_skills = get_role_skills(target_role)
    if not role_skills:
        return 0.5, [], []

    resume_lower = {s.lower() for s in resume_skills}
    role_lower = {s.lower() for s in role_skills}

    matching = resume_lower & role_lower
    missing = role_lower - resume_lower

    overlap = len(matching) / len(role_lower) if role_lower else 0.0

    # Map back to original casing
    matching_orig = [s for s in role_skills if s.lower() in matching]
    missing_orig = [s for s in role_skills if s.lower() in missing]

    return float(overlap), matching_orig, missing_orig
