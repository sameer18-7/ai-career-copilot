"""
ATS Scorer & Weakness Detector
================================
Computes an explainable ATS/readiness score (0-100) with evidence-backed
sub-scores and text-only Quick Fixes.

Scoring rubric (weights must total 1.0):
  Component                           | Weight
  ----------------------------------- | ------
  Required skill coverage             | 40%
  Preferred skill coverage            | 15%
  Relevant experience/project evidence| 20%
  Role alignment (TF-IDF similarity)  | 10%
  Section completeness                | 10%
  Document parseability & formatting  | 5%

Design invariants:
  - role_alignment is computed ONCE and used consistently in both the
    sub-scores breakdown and the top-level roleAlignment field (fixes B4).
  - Weights sum to exactly 1.0 (verified by assertion).
  - Identical inputs produce identical outputs (deterministic).
  - Evidence is returned for every sub-score component.
  - scoreType distinguishes role-based estimates from JD-based analysis.

Limitations (documented):
  - TF-IDF cosine similarity to a synthetic role-skills document is NOT a
    validated predictor of hiring success. It is labeled an estimate.
  - Skill matching is string-based; contextual negation is detected but
    only for simple patterns (e.g., "no experience with X", "not X").
  - Protected characteristics (gender, age, etc.) are never used in scoring.
"""

from typing import Any

from .feature_engineering import (
    compute_resume_features,
    compute_role_alignment,
    compute_skill_overlap,
)
from .resume_parser import flatten_skills, normalize_skill
from .role_knowledge import get_role_skills


# ---------------------------------------------------------------------------
# Sub-score weights — must sum to 1.0
# ---------------------------------------------------------------------------

WEIGHTS: dict[str, float] = {
    "required_skills":   0.40,
    "preferred_skills":  0.15,
    "experience_evidence": 0.20,
    "role_alignment":    0.10,
    "section_completeness": 0.10,
    "formatting":        0.05,
}

# Assertion: weights must sum to 1.0 (checked at import time)
_weight_sum = round(sum(WEIGHTS.values()), 10)
assert _weight_sum == 1.0, (
    f"ATS scoring weights must sum to 1.0, got {_weight_sum}. "
    f"Components: {WEIGHTS}"
)


# ---------------------------------------------------------------------------
# Negation detection
# ---------------------------------------------------------------------------

_NEGATION_PATTERNS = [
    re.compile(r"(?:no|not|without|lack(?:ing)?|no\s+experience\s+(?:in|with))\s+"
               r"(?:\w+\s+){0,3}", re.IGNORECASE)
    for re in [__import__("re")]
]


def _is_negated(skill: str, text: str) -> bool:
    """
    Heuristic check: return True if the skill appears right after a negation marker.
    This is a simple, conservative check to avoid crediting negated mentions.
    """
    import re as _re
    # Look for patterns like "no experience with Python", "not using Docker", etc.
    pattern = _re.compile(
        r"(?:no|not|without|lack(?:ing)?|no\s+experience\s+(?:in|with))"
        r"(?:\s+\w+){0,3}\s+" + _re.escape(skill),
        _re.IGNORECASE,
    )
    return bool(pattern.search(text))


# ---------------------------------------------------------------------------
# Skill matching with evidence
# ---------------------------------------------------------------------------

def _match_skills_with_evidence(
    resume_skills: list[str],
    role_skills: list[str],
    raw_text: str,
    parsed_resume: dict[str, Any],
) -> dict[str, Any]:
    """
    Match resume skills against required role skills and return structured evidence.

    Returns:
        {
            "matched": [{"skill": str, "source": str, "evidence": str}],
            "missing": [str],
            "overlap_ratio": float,
        }
    where source is one of: "skills_section", "experience", "project", "text_mention".
    """
    import re as _re

    # Build lookup: canonical lower -> display name
    resume_lower = {normalize_skill(s).lower(): s for s in resume_skills}

    # Also scan experience descriptions and project descriptions for skill mentions
    experience = parsed_resume.get("experience", [])
    projects = parsed_resume.get("projects", [])

    exp_text = " ".join(
        f"{e.get('title', '')} {e.get('description', '')}" for e in experience
    ).lower()
    proj_text = " ".join(
        f"{p.get('name', '')} {p.get('description', '')}" for p in projects
    ).lower()
    skills_text = raw_text.lower()

    matched = []
    missing = []
    evidenced_skills: set[str] = set()  # canonical lower

    for skill in role_skills:
        canonical = normalize_skill(skill)
        key = canonical.lower()

        # Check for negation in whole text
        if _is_negated(skill, raw_text):
            missing.append(skill)
            continue

        # Check exact match in parsed skills
        if key in resume_lower:
            matched.append({
                "skill": canonical,
                "source": "skills_section",
                "evidence": f"Listed in skills section as: {resume_lower[key]}",
            })
            evidenced_skills.add(key)
            continue

        # Check alias: scan taxonomy aliases
        alias_found = False
        from .resume_parser import _CANONICAL_MAP, _load_taxonomy
        _load_taxonomy()
        for alias, canon in _CANONICAL_MAP.items():
            if canon.lower() == key and alias in skills_text:
                # Make sure it's not negated
                if not _is_negated(alias, raw_text):
                    matched.append({
                        "skill": canonical,
                        "source": "text_mention",
                        "evidence": f"Alias '{alias}' found in resume text.",
                    })
                    evidenced_skills.add(key)
                    alias_found = True
                    break
        if alias_found:
            continue

        # Check in experience (more valuable evidence)
        if len(skill) > 2 and _re.search(r"\b" + _re.escape(skill.lower()) + r"\b", exp_text):
            matched.append({
                "skill": canonical,
                "source": "experience",
                "evidence": "Demonstrated in work experience.",
            })
            evidenced_skills.add(key)
            continue

        # Check in project descriptions
        if len(skill) > 2 and _re.search(r"\b" + _re.escape(skill.lower()) + r"\b", proj_text):
            matched.append({
                "skill": canonical,
                "source": "project",
                "evidence": "Used in a project.",
            })
            evidenced_skills.add(key)
            continue

        # Check in raw text (weakest — just a mention)
        if len(skill) > 2 and _re.search(r"\b" + _re.escape(skill.lower()) + r"\b", skills_text):
            matched.append({
                "skill": canonical,
                "source": "text_mention",
                "evidence": "Mentioned in resume text.",
            })
            evidenced_skills.add(key)
            continue

        missing.append(skill)

    overlap_ratio = len(matched) / len(role_skills) if role_skills else 0.0
    return {
        "matched": matched,
        "missing": missing,
        "overlap_ratio": overlap_ratio,
    }


# ---------------------------------------------------------------------------
# Experience evidence scoring
# ---------------------------------------------------------------------------

def _score_experience_evidence(
    parsed_resume: dict[str, Any],
    matched_required: list[dict[str, Any]],
    matched_preferred: list[dict[str, Any]],
) -> tuple[float, str]:
    """
    Score how well work experience and project descriptions back up the skill claims.

    Returns: (raw_score_0_to_1, explanation)
    """
    experience = parsed_resume.get("experience", [])
    projects = parsed_resume.get("projects", [])

    score = 0.0
    reasons = []

    # Has experience entries with descriptions
    exp_with_desc = [e for e in experience if e.get("description", "").strip()]
    if exp_with_desc:
        score += 0.35
        reasons.append(f"{len(exp_with_desc)} experience entries with descriptions.")
    elif experience:
        score += 0.15
        reasons.append(f"{len(experience)} experience entries (no descriptions).")

    # Has project entries
    proj_with_desc = [p for p in projects if p.get("description", "").strip()]
    if proj_with_desc:
        score += 0.20
        reasons.append(f"{len(proj_with_desc)} project entries with descriptions.")
    elif projects:
        score += 0.08
        reasons.append(f"{len(projects)} project entries (no descriptions).")

    # Skills evidenced in experience or projects (not just listed)
    exp_proj_evidenced = sum(
        1 for m in (matched_required + matched_preferred)
        if m["source"] in ("experience", "project")
    )
    if exp_proj_evidenced > 0:
        evidence_ratio = min(exp_proj_evidenced / max(len(matched_required) + len(matched_preferred), 1), 1.0)
        score += evidence_ratio * 0.30
        reasons.append(
            f"{exp_proj_evidenced} required/preferred skills evidenced in experience or projects."
        )

    # Years of experience
    years_of_exp = parsed_resume.get("yearsOfExperience", {})
    if isinstance(years_of_exp, dict):
        years_val = years_of_exp.get("value")
        if years_val is not None and years_val > 0:
            score += min(years_val / 10.0, 0.15)  # Up to +15% for 10+ years
            reasons.append(
                f"{years_val:.1f} years of experience ({years_of_exp.get('source', 'unknown')} source)."
            )

    return min(score, 1.0), " ".join(reasons) if reasons else "No experience or project data found."


# ---------------------------------------------------------------------------
# Main ATS scoring function (fixes B4, B5)
# ---------------------------------------------------------------------------

def compute_ats_score(
    parsed_resume: dict[str, Any],
    raw_text: str,
    target_role: str,
    job_description: str | None = None,
) -> dict[str, Any]:
    """
    Compute an explainable ATS/readiness score with evidence-backed sub-scores.

    The role_alignment value is computed ONCE and used consistently in both
    the sub-scores and the top-level roleAlignment field (fixes B4).

    Args:
        parsed_resume: Structured resume dict from parse_resume().
        raw_text: Raw resume text.
        target_role: The user-selected target role.
        job_description: Optional job description text. When provided, used
                         as the primary skill reference instead of the role profile.

    Returns:
        {
            "atsScore": int,           # 0-100 total weighted score
            "scoreType": str,          # "role_based" or "jd_based"
            "roleAlignment": float,    # 0-100 (consistent with atsSubScores)
            "atsSubScores": [          # per-component breakdown
                {
                    "label": str,
                    "weight": float,      # 0-1 component weight
                    "rawScore": int,      # 0-100 raw component score
                    "weightedScore": float, # raw * weight
                    "explanation": str,
                    "matched": list,
                    "missing": list,
                }
            ],
            "matchedSkills": list[str],
            "missingRequiredSkills": list[str],
            "missingPreferredSkills": list[str],
            "evidence": list[dict],    # evidence items for matched skills
        }
    """
    # --- Gather skills ---
    skills_dict = parsed_resume.get("skills", {})
    if isinstance(skills_dict, dict):
        flat_skills = flatten_skills(skills_dict)
    else:
        flat_skills = skills_dict if isinstance(skills_dict, list) else []

    # --- Role knowledge ---
    role_skills = get_role_skills(target_role)
    score_type = "role_based"
    if job_description:
        # Use JD as the primary reference (extract keywords from JD)
        role_skills = _extract_jd_skills(job_description, role_skills)
        score_type = "jd_based"

    # Split into required (first 60%) and preferred (remainder)
    n_required = max(1, int(len(role_skills) * 0.6)) if role_skills else 0
    required_skills = role_skills[:n_required]
    preferred_skills = role_skills[n_required:]

    # --- FIX B4: Compute role_alignment ONCE ---
    role_alignment_raw = compute_role_alignment(raw_text, target_role)
    # Use the same rounding for both the sub-score and the top-level field so they agree.
    role_alignment_pct = round(role_alignment_raw * 100, 1)
    role_alignment_score = int(min(role_alignment_pct, 100))

    # --- Required skill matching ---
    req_match = _match_skills_with_evidence(flat_skills, required_skills, raw_text, parsed_resume)
    req_raw_score = int(req_match["overlap_ratio"] * 100)

    # --- Preferred skill matching ---
    pref_match = _match_skills_with_evidence(flat_skills, preferred_skills, raw_text, parsed_resume)
    pref_raw_score = int(pref_match["overlap_ratio"] * 100)

    # --- Experience evidence scoring ---
    exp_raw, exp_explanation = _score_experience_evidence(
        parsed_resume,
        req_match["matched"],
        pref_match["matched"],
    )
    exp_score = int(exp_raw * 100)

    # --- Section completeness ---
    features = compute_resume_features(parsed_resume, raw_text)
    section_score = int(features["section_completeness"] * 100)
    if features["has_summary"] and features["has_skills"] and features["has_experience"]:
        section_score = min(section_score + 10, 100)

    # --- Formatting / readability ---
    formatting_raw = (
        features["action_verb_density"] * 0.30
        + features["metrics_density"] * 0.25
        + features["length_score"] * 0.25
        + features["contact_completeness"] * 0.20
    )
    formatting_score = int(formatting_raw * 100)

    # --- Weighted total ---
    components = {
        "required_skills":    req_raw_score,
        "preferred_skills":   pref_raw_score,
        "experience_evidence": exp_score,
        "role_alignment":     role_alignment_score,
        "section_completeness": section_score,
        "formatting":         formatting_score,
    }

    ats_score = sum(
        int(score * WEIGHTS[key])
        for key, score in components.items()
    )
    ats_score = max(0, min(100, ats_score))

    # --- Build sub-scores with evidence ---
    sub_scores = [
        {
            "label": "Required Skill Coverage",
            "weight": WEIGHTS["required_skills"],
            "rawScore": max(0, min(100, req_raw_score)),
            "weightedScore": round(req_raw_score * WEIGHTS["required_skills"], 2),
            "explanation": (
                f"{len(req_match['matched'])} of {len(required_skills)} required skills evidenced. "
                f"Score is based on confirmed matches only — missing skills are reported separately."
            ),
            "matched": [m["skill"] for m in req_match["matched"]],
            "missing": req_match["missing"],
        },
        {
            "label": "Preferred Skill Coverage",
            "weight": WEIGHTS["preferred_skills"],
            "rawScore": max(0, min(100, pref_raw_score)),
            "weightedScore": round(pref_raw_score * WEIGHTS["preferred_skills"], 2),
            "explanation": (
                f"{len(pref_match['matched'])} of {len(preferred_skills)} preferred skills evidenced."
            ),
            "matched": [m["skill"] for m in pref_match["matched"]],
            "missing": pref_match["missing"],
        },
        {
            "label": "Experience & Project Evidence",
            "weight": WEIGHTS["experience_evidence"],
            "rawScore": max(0, min(100, exp_score)),
            "weightedScore": round(exp_score * WEIGHTS["experience_evidence"], 2),
            "explanation": exp_explanation,
            "matched": [],
            "missing": [],
        },
        {
            "label": "Role Alignment",
            "weight": WEIGHTS["role_alignment"],
            # rawScore uses the same rounded value as the top-level roleAlignment field (B4 fix)
            "rawScore": role_alignment_pct,
            "weightedScore": round(role_alignment_pct * WEIGHTS["role_alignment"], 2),
            "explanation": (
                f"TF-IDF cosine similarity between your resume and the {target_role} skill profile: "
                f"{role_alignment_raw:.2f}. "
                "Note: this is a text-similarity estimate, not a validated hiring predictor."
            ),
            "matched": [],
            "missing": [],
        },
        {
            "label": "Section Completeness",
            "weight": WEIGHTS["section_completeness"],
            "rawScore": max(0, min(100, section_score)),
            "weightedScore": round(section_score * WEIGHTS["section_completeness"], 2),
            "explanation": _section_explanation(features),
            "matched": [],
            "missing": _missing_sections(features),
        },
        {
            "label": "Formatting & Readability",
            "weight": WEIGHTS["formatting"],
            "rawScore": max(0, min(100, formatting_score)),
            "weightedScore": round(formatting_score * WEIGHTS["formatting"], 2),
            "explanation": _formatting_explanation(features),
            "matched": [],
            "missing": [],
        },
    ]

    # Collect all evidence
    all_evidence = req_match["matched"] + pref_match["matched"]

    return {
        "atsScore": ats_score,
        "scoreType": score_type,
        "roleAlignment": role_alignment_pct,  # consistent with sub-score rawScore (B4 fix)
        "atsSubScores": sub_scores,
        "matchedSkills": sorted(set(m["skill"] for m in req_match["matched"])),
        "missingRequiredSkills": req_match["missing"],
        "missingPreferredSkills": pref_match["missing"],
        "evidence": all_evidence,
    }


# ---------------------------------------------------------------------------
# JD-based skill extraction (fallback to role skills if JD is sparse)
# ---------------------------------------------------------------------------

def _extract_jd_skills(job_description: str, role_skills: list[str]) -> list[str]:
    """
    Extract skill requirements from a job description.
    Falls back to role_skills if the JD doesn't yield enough skills.
    """
    from .resume_parser import PROGRAMMING_LANGUAGES, FRAMEWORKS, DATABASES, CLOUD, TOOLS
    import re as _re

    jd_lower = job_description.lower()
    found: list[str] = []
    seen: set[str] = set()

    for skill_set in [PROGRAMMING_LANGUAGES, FRAMEWORKS, DATABASES, CLOUD, TOOLS]:
        for skill in skill_set:
            if skill in seen:
                continue
            if len(skill) > 2 and _re.search(r"\b" + _re.escape(skill) + r"\b", jd_lower):
                canonical = normalize_skill(skill)
                key = canonical.lower()
                if key not in seen:
                    seen.add(key)
                    found.append(canonical)

    if len(found) < 5:
        return role_skills  # Not enough JD signals; use role profile
    return found


# ---------------------------------------------------------------------------
# Explanation helpers
# ---------------------------------------------------------------------------

def _section_explanation(features: dict[str, float]) -> str:
    present = []
    missing = []
    for section, key in [
        ("Summary", "has_summary"), ("Skills", "has_skills"),
        ("Education", "has_education"), ("Experience", "has_experience"),
        ("Projects", "has_projects"), ("Certifications", "has_certifications"),
    ]:
        if features.get(key, 0.0) > 0:
            present.append(section)
        else:
            missing.append(section)

    parts = []
    if present:
        parts.append(f"Found: {', '.join(present)}.")
    if missing:
        parts.append(f"Missing: {', '.join(missing)}.")
    return " ".join(parts) or "No section data."


def _missing_sections(features: dict[str, float]) -> list[str]:
    return [
        section
        for section, key in [
            ("Summary", "has_summary"), ("Skills", "has_skills"),
            ("Education", "has_education"), ("Experience", "has_experience"),
            ("Projects", "has_projects"), ("Certifications", "has_certifications"),
        ]
        if features.get(key, 0.0) == 0.0
    ]


def _formatting_explanation(features: dict[str, float]) -> str:
    parts = []
    parts.append(f"Action verbs: {int(features.get('action_verb_count', 0))} found.")
    parts.append(f"Metrics: {int(features.get('metrics_count', 0))} quantified achievements.")
    wc = int(features.get("word_count", 0))
    parts.append(f"Word count: {wc} ({'ideal' if 300 <= wc <= 800 else 'outside ideal 300-800 range'}).")
    parts.append(f"Contact completeness: {int(features.get('contact_completeness', 0) * 100)}%.")
    return " ".join(parts)


# ---------------------------------------------------------------------------
# Quick Fixes (Weakness Detection)
# ---------------------------------------------------------------------------

def generate_quick_fixes(
    parsed_resume: dict[str, Any],
    raw_text: str,
    target_role: str,
    ats_result: dict[str, Any] | None = None,
    max_fixes: int = 7,
) -> list[str]:
    """
    Generate text-only quick fix recommendations based on detected weaknesses.

    Args:
        parsed_resume: Structured resume dict.
        raw_text: Raw resume text.
        target_role: The user-selected target role.
        ats_result: Pre-computed ATS result to avoid duplicate computation.
        max_fixes: Maximum suggestions to return.

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

    # --- Contact info incomplete ---
    if features["contact_completeness"] < 0.5:
        fixes.append(
            "Complete your contact information (email, phone, LinkedIn profile)."
        )

    # --- Skill gap from pre-computed ATS result (avoids recomputation) ---
    if ats_result:
        missing_req = ats_result.get("missingRequiredSkills", [])
        if len(missing_req) >= 3:
            top_missing = missing_req[:3]
            fixes.append(
                f"These required skills for {target_role} are not evidenced in your resume: "
                f"{', '.join(top_missing)}. Consider adding relevant experience or listing them explicitly."
            )
    else:
        # Fallback: compute overlap
        _, _, missing = compute_skill_overlap(flat_skills_from_parsed(parsed_resume), target_role)
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


def flat_skills_from_parsed(parsed_resume: dict[str, Any]) -> list[str]:
    """Safely extract flat skill list from parsed resume."""
    skills_dict = parsed_resume.get("skills", {})
    if isinstance(skills_dict, dict):
        return flatten_skills(skills_dict)
    return skills_dict if isinstance(skills_dict, list) else []
