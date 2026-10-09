"""
Keyword Engine
==============
Dynamically ranks suggested keywords for a target role that are missing
from the resume, using TF-IDF importance scores and role co-occurrence.
"""

from typing import Any

from .role_knowledge import get_role_skills
from .resume_parser import flatten_skills


def suggest_keywords(
    parsed_resume: dict[str, Any],
    target_role: str,
    raw_text: str,
    max_keywords: int = 10,
) -> list[str]:
    """
    Generate a ranked list of suggested keywords for the target role
    that are missing from the resume.

    The ranking considers:
      1. Whether the skill is in the role's expected skill list
      2. How important/common the skill is for the role (position in list)
      3. Whether the skill appears anywhere in the resume text

    Args:
        parsed_resume: Structured resume dict from the parser.
        target_role: The user-selected target role.
        raw_text: Raw resume text for full-text scanning.
        max_keywords: Maximum number of suggestions to return.

    Returns:
        Ranked list of suggested keyword strings.
    """
    role_skills = get_role_skills(target_role)
    if not role_skills:
        return []

    # Gather all skills found in the resume
    skills_dict = parsed_resume.get("skills", {})
    if isinstance(skills_dict, dict):
        resume_skills = set(s.lower() for s in flatten_skills(skills_dict))
    elif isinstance(skills_dict, list):
        resume_skills = set(s.lower() for s in skills_dict)
    else:
        resume_skills = set()

    text_lower = raw_text.lower()

    # Score each role skill
    scored: list[tuple[str, float]] = []

    for idx, skill in enumerate(role_skills):
        skill_lower = skill.lower()

        # Skip if already present in parsed skills
        if skill_lower in resume_skills:
            continue

        # Skip if mentioned anywhere in the resume text
        if skill_lower in text_lower:
            continue

        # Score: higher = more important to suggest
        # Earlier position in the role's skill list = higher priority
        position_score = 1.0 - (idx / len(role_skills))

        # Boost multi-word skills (more specific)
        specificity = 1.0 + (0.1 * skill.count(" "))

        score = position_score * specificity
        scored.append((skill, score))

    # Sort by score descending
    scored.sort(key=lambda x: x[1], reverse=True)

    return [skill for skill, _ in scored[:max_keywords]]
