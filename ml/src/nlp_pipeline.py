"""
NLP Pipeline
============
Augments the base resume_parser with spaCy EntityRuler and PhraseMatcher
for domain-specific entity recognition.

Extraction stages:
  Stage A — Regex: emails, phones, URLs, dates, GPA, degrees, metrics
  Stage B — spaCy pretrained NER: PERSON, ORG, GPE, LOC, DATE
  Stage C — Domain-specific: SKILL, JOB_TITLE, DEGREE, CERTIFICATION,
             TECHNOLOGY, PROGRAMMING_LANGUAGE, FRAMEWORK, DATABASE,
             CLOUD_PLATFORM (via EntityRuler + PhraseMatcher)
  Stage D — Candidate name heuristics using header position + context

Entity representation:
    {
        "text": str,          # raw extracted text
        "canonical": str,     # normalized / canonical form
        "label": str,         # entity type
        "start": int,         # char offset start
        "end": int,           # char offset end
        "source": str,        # "regex" | "spacy_ner" | "entity_ruler" | "phrase_matcher"
        "section": str,       # resume section where found
        "confidence": float,  # 1.0 for deterministic; lower for heuristics
        "evidence": str,      # surrounding context
    }

Overlap resolution:
    Longer spans win over shorter ones. Within same length, EntityRuler > spaCy NER.
"""

import re
from typing import Any

import spacy
from spacy.language import Language
from spacy.pipeline import EntityRuler
from spacy.tokens import Doc, Span

from .resume_parser import (
    YEAR_RE,
    EMAIL_RE,
    PHONE_RE,
    LINKEDIN_RE,
    GITHUB_RE,
    PORTFOLIO_RE,
    DEGREE_RE,
    GPA_RE,
    SECTION_PATTERNS,
    normalize_skill,
    _load_taxonomy,
    _get_nlp,
)
from .role_knowledge import get_role_skills

# ---------------------------------------------------------------------------
# Singleton: augmented spaCy pipeline
# ---------------------------------------------------------------------------

_augmented_nlp: Language | None = None


def _build_augmented_nlp() -> Language | None:
    """
    Build and cache a spaCy pipeline with an EntityRuler for domain entities.
    Returns None if the base model is unavailable.
    """
    global _augmented_nlp
    if _augmented_nlp is not None:
        return _augmented_nlp

    base_nlp = _get_nlp()
    if base_nlp is None:
        return None

    # Add EntityRuler BEFORE the NER component so custom rules win
    if "resume_entity_ruler" not in base_nlp.pipe_names:
        ruler = base_nlp.add_pipe("entity_ruler", name="resume_entity_ruler", before="ner")
        ruler.add_patterns(_build_entity_patterns())

    _augmented_nlp = base_nlp
    return _augmented_nlp


def _build_entity_patterns() -> list[dict[str, Any]]:
    """Build entity ruler patterns for domain-specific resume entities."""
    patterns: list[dict[str, Any]] = []

    # --- JOB_TITLE patterns ---
    job_titles = [
        "Software Engineer", "Senior Software Engineer", "Staff Engineer",
        "Backend Developer", "Frontend Developer", "Full-Stack Developer",
        "Full Stack Developer", "Web Developer", "Mobile Developer",
        "iOS Developer", "Android Developer",
        "Data Scientist", "Data Analyst", "Data Engineer",
        "Machine Learning Engineer", "ML Engineer", "AI Engineer",
        "DevOps Engineer", "Site Reliability Engineer", "SRE",
        "Cloud Engineer", "Platform Engineer", "Infrastructure Engineer",
        "Product Manager", "Product Owner", "Project Manager",
        "UI/UX Designer", "UX Designer", "UI Designer", "Graphic Designer",
        "Engineering Manager", "CTO", "VP of Engineering", "Tech Lead",
        "QA Engineer", "Test Engineer", "SDET",
        "Security Engineer", "Cybersecurity Analyst", "Penetration Tester",
        "Solutions Architect", "Cloud Architect", "Enterprise Architect",
        "Business Analyst", "Systems Analyst",
        "HR Manager", "Recruiter", "Talent Acquisition",
        "Financial Analyst", "Accountant", "Auditor",
        "Marketing Manager", "Digital Marketer", "SEO Specialist",
        "Sales Representative", "Account Executive", "Sales Manager",
        "Nurse", "Physician", "Doctor", "Medical Assistant",
        "Teacher", "Professor", "Instructor", "Tutor",
        "Consultant", "Management Consultant", "IT Consultant",
        "Software Engineering Intern", "Data Science Intern",
        "Research Scientist", "Research Engineer",
    ]
    for title in job_titles:
        patterns.append({"label": "JOB_TITLE", "pattern": title})
        # Case-insensitive via lower pattern
        patterns.append({"label": "JOB_TITLE", "pattern": title.lower()})

    # --- DEGREE patterns ---
    degree_variants = [
        "Bachelor of Science", "Bachelor of Arts", "Bachelor of Engineering",
        "Bachelor of Technology", "B.S.", "B.A.", "B.E.", "B.Tech", "B.Sc",
        "Master of Science", "Master of Arts", "Master of Business Administration",
        "Master of Engineering", "Master of Technology",
        "M.S.", "M.A.", "MBA", "M.Tech", "M.E.", "M.Sc",
        "Doctor of Philosophy", "Ph.D.", "PhD", "Doctorate",
        "Associate of Science", "Associate of Arts", "A.S.", "A.A.",
        "High School Diploma", "GED", "Diploma",
    ]
    for deg in degree_variants:
        patterns.append({"label": "DEGREE", "pattern": deg})

    # --- CERTIFICATION patterns ---
    certifications = [
        "AWS Certified", "AWS Solutions Architect", "AWS Developer",
        "Azure Certified", "Microsoft Certified", "Google Cloud Certified",
        "Google Associate Cloud Engineer", "GCP Professional",
        "Certified Kubernetes Administrator", "CKA",
        "Certified Kubernetes Application Developer", "CKAD",
        "Certified Information Systems Security Professional", "CISSP",
        "Certified Ethical Hacker", "CEH",
        "Project Management Professional", "PMP",
        "Certified Scrum Master", "CSM",
        "Oracle Certified", "Java Certified",
        "CompTIA Security+", "CompTIA A+", "CompTIA Network+",
        "Tableau Desktop Specialist", "Tableau Server Certified",
        "TensorFlow Developer Certificate",
    ]
    for cert in certifications:
        patterns.append({"label": "CERTIFICATION", "pattern": cert})

    # --- SKILL / TECHNOLOGY patterns ---
    # These are longer multi-word skills that spaCy NER won't pick up
    multi_word_skills = [
        "Machine Learning", "Deep Learning", "Natural Language Processing",
        "Computer Vision", "Data Science", "Data Engineering",
        "System Design", "Software Architecture", "Microservices",
        "REST APIs", "RESTful APIs", "GraphQL API",
        "CI/CD", "Continuous Integration", "Continuous Deployment",
        "Infrastructure as Code", "Test Driven Development", "TDD",
        "Behavior Driven Development", "BDD",
        "Agile Methodology", "Scrum Framework",
        "Object Oriented Programming", "OOP",
        "Functional Programming", "Design Patterns",
        "Data Structures", "Algorithms", "Big O",
        "Cloud Computing", "Serverless", "Distributed Systems",
        "Message Queues", "Event Driven Architecture",
        "Feature Engineering", "Model Deployment", "MLOps",
        "A/B Testing", "Statistical Analysis", "Data Visualization",
        "Web Scraping", "API Integration",
        "SQL Optimization", "Database Design",
        "Network Security", "Penetration Testing",
    ]
    for skill in multi_word_skills:
        patterns.append({"label": "SKILL", "pattern": skill})

    return patterns


# ---------------------------------------------------------------------------
# Public API: extract_entities
# ---------------------------------------------------------------------------

def extract_entities(
    text: str,
    sections: dict[str, list[str]] | None = None,
) -> list[dict[str, Any]]:
    """
    Run the full 4-stage entity extraction pipeline on resume text.

    Args:
        text: Raw resume text.
        sections: Pre-computed section dict from _detect_sections (optional).

    Returns:
        List of entity dicts (see module docstring for structure).
    """
    nlp = _build_augmented_nlp()

    entities: list[dict[str, Any]] = []

    # --- Stage A: Regex-based extraction ---
    entities.extend(_stage_a_regex(text))

    # --- Stage B+C: spaCy NER + EntityRuler ---
    if nlp:
        doc = nlp(text[:100_000])
        entities.extend(_stage_bc_spacy(doc, text))

    # --- Deduplicate and resolve overlapping spans ---
    entities = _resolve_overlaps(entities)

    return entities


def _stage_a_regex(text: str) -> list[dict[str, Any]]:
    """Stage A: deterministic regex-based entity extraction."""
    entities = []

    for m in EMAIL_RE.finditer(text):
        entities.append(_make_entity(
            text=m.group(0), canonical=m.group(0).lower(),
            label="EMAIL", start=m.start(), end=m.end(),
            source="regex", confidence=1.0,
            context=_context(text, m.start(), m.end()),
        ))

    for m in PHONE_RE.finditer(text):
        val = m.group(0).strip()
        digits = re.sub(r"\D", "", val)
        if len(digits) >= 7:
            entities.append(_make_entity(
                text=val, canonical=val,
                label="PHONE", start=m.start(), end=m.end(),
                source="regex", confidence=1.0,
                context=_context(text, m.start(), m.end()),
            ))

    for m in LINKEDIN_RE.finditer(text):
        entities.append(_make_entity(
            text=m.group(0), canonical=m.group(0),
            label="LINKEDIN", start=m.start(), end=m.end(),
            source="regex", confidence=1.0,
            context="",
        ))

    for m in GITHUB_RE.finditer(text):
        entities.append(_make_entity(
            text=m.group(0), canonical=m.group(0),
            label="GITHUB", start=m.start(), end=m.end(),
            source="regex", confidence=1.0,
            context="",
        ))

    for m in YEAR_RE.finditer(text):
        year = int(m.group(0))
        if 1950 <= year <= 2030:  # Sanity check
            entities.append(_make_entity(
                text=m.group(0), canonical=m.group(0),
                label="YEAR", start=m.start(), end=m.end(),
                source="regex", confidence=1.0,
                context=_context(text, m.start(), m.end()),
            ))

    for m in GPA_RE.finditer(text):
        entities.append(_make_entity(
            text=m.group(0), canonical=m.group(1),
            label="GPA", start=m.start(), end=m.end(),
            source="regex", confidence=1.0,
            context=_context(text, m.start(), m.end()),
        ))

    for m in DEGREE_RE.finditer(text):
        entities.append(_make_entity(
            text=m.group(0), canonical=m.group(0),
            label="DEGREE", start=m.start(), end=m.end(),
            source="regex", confidence=0.9,
            context=_context(text, m.start(), m.end()),
        ))

    return entities


def _stage_bc_spacy(doc: Doc, text: str) -> list[dict[str, Any]]:
    """Stage B+C: spaCy pretrained NER + EntityRuler results."""
    _INCLUDE_LABELS = {
        "PERSON", "ORG", "GPE", "LOC", "DATE",
        # Custom labels from EntityRuler
        "JOB_TITLE", "DEGREE", "CERTIFICATION", "SKILL",
    }

    entities = []
    for ent in doc.ents:
        if ent.label_ not in _INCLUDE_LABELS:
            continue

        source = "entity_ruler" if hasattr(ent, "kb_id_") and ent.kb_id_ else "spacy_ner"
        canonical = normalize_skill(ent.text) if ent.label_ in ("SKILL",) else ent.text

        entities.append(_make_entity(
            text=ent.text,
            canonical=canonical,
            label=ent.label_,
            start=ent.start_char,
            end=ent.end_char,
            source=source,
            confidence=1.0 if source == "entity_ruler" else 0.85,
            context=_context(text, ent.start_char, ent.end_char),
        ))

    return entities


# ---------------------------------------------------------------------------
# Overlap resolution
# ---------------------------------------------------------------------------

def _resolve_overlaps(entities: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Remove overlapping entity spans, keeping longer spans first.
    When spans have equal length, EntityRuler > spaCy NER > regex.
    """
    if not entities:
        return entities

    source_priority = {"entity_ruler": 0, "phrase_matcher": 1, "spacy_ner": 2, "regex": 3}

    def sort_key(e: dict[str, Any]) -> tuple[int, int, int]:
        span_len = e["end"] - e["start"]
        return (-span_len, source_priority.get(e["source"], 9), e["start"])

    sorted_ents = sorted(entities, key=sort_key)
    kept: list[dict[str, Any]] = []
    used_chars: set[int] = set()

    for ent in sorted_ents:
        span = set(range(ent["start"], ent["end"]))
        if span & used_chars:
            continue  # Overlaps with a higher-priority entity
        used_chars |= span
        kept.append(ent)

    return sorted(kept, key=lambda e: e["start"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_entity(
    text: str,
    canonical: str,
    label: str,
    start: int,
    end: int,
    source: str,
    confidence: float,
    context: str,
    section: str = "",
) -> dict[str, Any]:
    return {
        "text": text,
        "canonical": canonical,
        "label": label,
        "start": start,
        "end": end,
        "source": source,
        "section": section,
        "confidence": confidence,
        "evidence": context,
    }


def _context(text: str, start: int, end: int, window: int = 60) -> str:
    """Return surrounding text for evidence display."""
    ctx_start = max(0, start - window)
    ctx_end = min(len(text), end + window)
    snippet = text[ctx_start:ctx_end].replace("\n", " ")
    if ctx_start > 0:
        snippet = "…" + snippet
    if ctx_end < len(text):
        snippet += "…"
    return snippet
