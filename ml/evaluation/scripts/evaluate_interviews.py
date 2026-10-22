"""
evaluate_interviews.py  (v2)
============================
Evaluates the interview answer evaluator against synthetic annotated QA pairs.

Phase 4A changes vs Phase 3:
  - Implements the v2 scoring logic (component-based, alias-aware) in Python
    to match the TypeScript rewrite.
  - Explicitly partitions the 30-example dataset into:
      DEV   partition  (20 examples): Q-B-01 through Q-T-05 (questions 1-5 of each type)
      HELD-OUT partition (10 examples): Q-B-06 through Q-T-08 (questions 6-8 of each type)
    Partitioning is by question family, not random row assignment, to prevent
    near-duplicate leakage (two reviewers for the same answer are always in
    the same partition).
  - Reports Phase 3 baseline alongside Phase 4A results.
  - Reports signed bias (mean error) in addition to MAE/RMSE/Spearman.
  - Per-question-type breakdown for dev and held-out sets separately.
  - Documents: all improvements were tuned on DEV; held-out is LOCKED.

DISCLAIMER: All annotations are SYNTHETIC. Real-world performance requires
human-reviewed, permissioned QA pairs. Do NOT claim real-world MAE reduction.

Output:
  ml/evaluation/reports/interview_metrics_v2.csv
  ml/evaluation/reports/metrics_v2.json  (interview_evaluator section)
  ml/evaluation/reports/interview_error_analysis_v2.csv

Usage (from project root):
    python ml/evaluation/scripts/evaluate_interviews.py
"""

import json
import os
import sys
import csv
import re
import math
import platform
from collections import defaultdict
from datetime import datetime, timezone
from typing import Any

SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "..", ".."))
sys.path.insert(0, PROJECT_ROOT)

ANNOTATIONS_PATH = os.path.join(PROJECT_ROOT, "ml", "evaluation", "annotations", "interview_annotations.jsonl")
REPORTS_DIR      = os.path.join(PROJECT_ROOT, "ml", "evaluation", "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# Phase 3 historical baseline (from run_all.py output, do not overwrite)
# ---------------------------------------------------------------------------

PHASE3_BASELINE = {
    "mae": 49.7,
    "rmse": 55.0,
    "spearman": 0.7126,
    "n": 30,
    "system_low_reviewer_high": 16,
    "system_high_reviewer_low": 0,
}

# ---------------------------------------------------------------------------
# DEV / HELD-OUT partition mapping
# Partitioning is by question family (not random row) to prevent near-duplicate
# leakage: both reviewer records for the same answer stay in the same partition.
# ---------------------------------------------------------------------------

DEV_QUESTION_IDS = {
    "Q-B-01", "Q-B-02", "Q-B-03", "Q-B-04", "Q-B-05",
    "Q-T-01", "Q-T-02", "Q-T-03", "Q-T-04", "Q-T-05",
}
# Held-out: Q-B-06 through Q-B-10 and Q-T-06 through Q-T-08
# (inferred as anything NOT in DEV_QUESTION_IDS)

# ---------------------------------------------------------------------------
# Synonym / alias table (mirrors interview-rubric.ts TECH_SYNONYMS)
# ---------------------------------------------------------------------------

TECH_SYNONYMS: dict[str, list[str]] = {
    "hash table":           ["hash map", "hashmap", "dictionary", "dict", "map", "lookup table"],
    "binary search tree":   ["bst", "binary tree", "balanced tree"],
    "priority queue":       ["heap", "min-heap", "max-heap"],
    "index":                ["b-tree index", "btree", "composite index", "covering index", "database index"],
    "transaction":          ["acid", "atomicity", "consistency", "isolation", "durability"],
    "n+1":                  ["n+1 query", "n+1 problem", "n plus 1"],
    "sql":                  ["relational database", "rdbms", "structured query language"],
    "nosql":                ["non-relational", "document store", "key-value store"],
    "cache":                ["caching", "in-memory cache", "redis cache", "memcached"],
    "rest api":             ["restful api", "rest", "http api", "web api", "restful"],
    "graphql":              ["graph ql"],
    "load balancer":        ["load balancing", "reverse proxy"],
    "tls":                  ["ssl", "https", "ssl/tls"],
    "kubernetes":           ["k8s", "container orchestration"],
    "docker":               ["containerization", "container"],
    "ci/cd":                ["continuous integration", "continuous deployment", "pipeline"],
    "microservices":        ["microservice", "service-oriented", "soa"],
    "blue-green":           ["blue green deployment", "zero-downtime deployment"],
    "overfitting":          ["high variance", "overfit"],
    "underfitting":         ["high bias", "underfit"],
    "cross-validation":     ["k-fold", "cross validation"],
    "gradient boosting":    ["xgboost", "lightgbm", "gbm"],
    "precision":            ["positive predictive value"],
    "recall":               ["sensitivity", "true positive rate"],
    "virtual dom":          ["vdom"],
    "ssr":                  ["server-side rendering"],
    "csr":                  ["client-side rendering"],
    "ssg":                  ["static site generation"],
    "horizontal scaling":   ["scale out"],
    "vertical scaling":     ["scale up"],
    "sharding":             ["data partitioning", "horizontal partitioning"],
    "circuit breaker":      ["circuit-breaker pattern"],
    "cap theorem":          ["cap", "cap theory"],
}

def _resolve_aliases(keyword: str) -> list[str]:
    key = keyword.lower().strip()
    return [key] + TECH_SYNONYMS.get(key, [])

def _phrase_in_text(phrase: str, text: str) -> bool:
    escaped = re.escape(phrase)
    return bool(re.search(r'(?:^|\b|\s)' + escaped + r'(?:$|\b|\s)', text, re.IGNORECASE))

def _is_negated(phrase: str, text: str) -> bool:
    escaped = re.escape(phrase)
    pattern = r'\b(no|not|never|without|lacking|didn\'t|don\'t|can\'t|couldn\'t|haven\'t|hasn\'t|wasn\'t|weren\'t|unable to|failed to|never had)\b.{0,40}\b' + escaped + r'\b'
    return bool(re.search(pattern, text, re.IGNORECASE))

# ---------------------------------------------------------------------------
# V2 scoring re-implementation (mirrors answer-evaluator.ts v2 logic)
# ---------------------------------------------------------------------------

DEPTH_PATTERNS = [
    re.compile(r'\b\d+\s*(%|percent|ms|milliseconds?|seconds?|minutes?|hours?|days?|users?|requests?|million|thousand|k\b)', re.IGNORECASE),
    re.compile(r'\b(trade-?off|however|on the other hand|alternatively|compared to|instead of|as opposed to)\b', re.IGNORECASE),
    re.compile(r'\b(because|therefore|which means|this allowed|as a result|so that|in order to|since|given that)\b', re.IGNORECASE),
    re.compile(r'\b(specifically|for example|for instance|such as|in particular|in my case|at scale|concretely)\b', re.IGNORECASE),
    re.compile(r'\b(reduced?|improved?|increased?|sped up|saved|cut|eliminated|prevented)\b.{0,30}\b(\d+|significantly)\b', re.IGNORECASE),
]

CAUSALITY_PATTERNS = [
    re.compile(r'\b(because|since|therefore|thus|as a result|which meant|which caused|which allowed|this led to|consequently)\b', re.IGNORECASE),
]

EXAMPLE_PATTERNS = [
    re.compile(r'\b(for example|for instance|such as|specifically|to illustrate|in one case|in a recent|in my last)\b', re.IGNORECASE),
]

OUTCOME_PATTERNS = [
    re.compile(r'\b(result(?:ed)?|outcome|impact|effect|achieved?|led to|allowed|enabled|improved?|reduced?|increased?|saved?|delivered?|shipped?)\b', re.IGNORECASE),
    re.compile(r'\b\d+\s*(%|percent|x faster|times faster)\b', re.IGNORECASE),
]

FILLER_PATTERNS = [
    re.compile(r'\b(um+|uh+|basically|literally|you know|kind of|sort of|etc\.?)\b', re.IGNORECASE),
    re.compile(r'\b(i guess|i think maybe|not sure but|i believe roughly)\b', re.IGNORECASE),
]

STAR_PATTERNS = {
    "situation": re.compile(r'\b(situation|context|background|was working on|at the time|when i|there was|we had|the project|our team|was assigned|was asked)\b', re.IGNORECASE),
    "task":      re.compile(r'\b(task|responsibility|needed to|had to|was asked|my goal|the challenge|my job was|i was responsible|objective|we needed)\b', re.IGNORECASE),
    "action":    re.compile(r'\b(so i|then i|i decided|i chose|i implemented|i built|i wrote|i led|i fixed|i designed|i created|i worked with|i proposed|i initiated|i refactored)\b', re.IGNORECASE),
    "result":    re.compile(r'\b(result|outcome|impact|achieved|reduced|improved|increased|saved|delivered|shipped|as a result|the outcome|we managed to|ultimately|this led to|we achieved)\b', re.IGNORECASE),
}

# Behavioral rubric criteria synonym groups
BEHAVIORAL_CRITERIA = {
    "context": [
        ["situation", "context", "background", "at the time", "we were", "our team was", "when i was", "i was working", "the project", "there was a", "we had a"],
        ["i was asked", "was assigned", "was tasked", "took on", "was working on"],
    ],
    "task": [
        ["needed to", "had to", "was responsible for", "my goal was", "my job was", "my task was", "the challenge was", "i was responsible", "the objective was", "we needed to"],
        ["goal", "objective", "responsibility", "challenge", "problem", "issue"],
    ],
    "action": [
        ["i decided", "i chose", "i implemented", "i built", "i wrote", "i led", "i fixed", "i designed", "i created", "i refactored", "i proposed", "i initiated"],
        ["so i", "then i", "i started", "i worked with", "i collaborated", "i drafted", "i set up", "i introduced"],
    ],
    "reasoning": [
        ["because", "since", "in order to", "so that", "which meant", "the reason", "i chose this because"],
        ["trade-off", "tradeoff", "trade off", "considered", "evaluated", "weighed", "instead of", "rather than"],
    ],
    "outcome": [
        ["result", "outcome", "impact", "as a result", "the outcome", "in the end", "ultimately", "we achieved", "we delivered", "i delivered"],
        ["reduced", "improved", "increased", "saved", "shipped", "launched", "deployed", "completed", "fixed", "resolved"],
    ],
}
BEHAVIORAL_OPTIONAL = {"reasoning"}

# Technical rubric criteria
TECHNICAL_CRITERIA = {
    "core_concept":      [],  # covered by keyword matching
    "mechanism":         [
        ["works by", "how it works", "the way it", "underneath", "under the hood", "internally", "the mechanism", "the algorithm", "step by step"],
        ["because", "which causes", "which enables", "this means", "so that", "in order to"],
    ],
    "tradeoff":          [
        ["trade-off", "tradeoff", "trade off", "however", "on the other hand", "downside", "limitation", "drawback", "overhead", "disadvantage"],
        ["compared to", "instead of", "as opposed to", "vs", "versus", "alternatively", "in contrast"],
    ],
    "practical_experience": [
        ["in my experience", "i used", "i implemented", "i built", "i worked with", "in a project", "in production", "i've worked"],
        ["for example", "for instance", "i once"],
    ],
}
TECHNICAL_OPTIONAL = {"tradeoff", "practical_experience"}

# Situational rubric criteria
SITUATIONAL_CRITERIA = {
    "understand_scenario": [
        ["first", "first i would", "i would start by", "i'd begin by", "my first step", "immediately", "initially"],
        ["understand", "assess", "diagnose", "identify", "investigate", "check", "verify", "determine", "clarify"],
    ],
    "proposed_action": [
        ["i would", "i'd", "my approach would be", "the first thing i'd do", "i would then", "next i would", "i'd then"],
        ["action", "step", "approach", "plan", "strategy", "process", "method"],
    ],
    "reasoning": [
        ["because", "since", "the reason", "this would", "in order to", "which would", "this helps", "this ensures"],
        ["trade-off", "priority", "risk", "impact", "urgency", "stakeholder", "communicate"],
    ],
    "feasibility": [
        ["feasible", "practical", "realistic", "given the constraints", "depending on", "it depends on", "in this case"],
        ["escalate", "communicate", "coordinate", "collaborate", "inform", "notify", "work with"],
    ],
}
SITUATIONAL_OPTIONAL = {"feasibility"}

def _check_criterion(synonym_groups: list[list[str]], text: str) -> bool:
    """Check if any group in synonym_groups has at least one phrase match."""
    if not synonym_groups:
        return True  # core_concept has empty groups; handled separately
    for group in synonym_groups:
        for phrase in group:
            if _phrase_in_text(phrase, text) and not _is_negated(phrase, text):
                return True
    return False

def _criteria_coverage(criteria: dict[str, list], optional_set: set, text: str) -> float:
    """Compute 0–100 coverage score for a set of criteria."""
    required_ids = [cid for cid in criteria if cid not in optional_set]
    optional_ids = [cid for cid in criteria if cid in optional_set]

    req_met = sum(1 for cid in required_ids if _check_criterion(criteria[cid], text))
    opt_met = sum(1 for cid in optional_ids if _check_criterion(criteria[cid], text))

    req_score = (req_met / len(required_ids) * 100) if required_ids else 100.0
    opt_score = (opt_met / len(optional_ids) * 100) if optional_ids else 100.0
    return req_score * 0.8 + opt_score * 0.2


def _score_v2(question_id: str, question_type: str, keywords: list[str], answer: str) -> int:
    """Python re-implementation of the v2 TypeScript evaluateAnswer() function."""
    text = answer.lower().strip()
    word_count = len(answer.strip().split())

    # ── 1. Keyword matching with alias resolution ──────────────────────────
    matched_kw = []
    missed_kw = []
    for kw in keywords:
        candidates = _resolve_aliases(kw)
        found = any(_phrase_in_text(c, text) and not _is_negated(c, text) for c in candidates)
        (matched_kw if found else missed_kw).append(kw)

    kw_total = len(keywords)
    relevance = round(len(matched_kw) / kw_total * 100) if kw_total > 0 else 65

    # ── 2. Criteria coverage ────────────────────────────────────────────────
    if question_type == "behavioral":
        coverage = _criteria_coverage(BEHAVIORAL_CRITERIA, BEHAVIORAL_OPTIONAL, text)
    elif question_type == "technical":
        kw_coverage = relevance  # core concept proxied by keyword match
        struct_coverage = _criteria_coverage({k: v for k, v in TECHNICAL_CRITERIA.items() if k != "core_concept"}, TECHNICAL_OPTIONAL, text)
        coverage = kw_coverage * 0.5 + struct_coverage * 0.5
    elif question_type == "situational":
        coverage = _criteria_coverage(SITUATIONAL_CRITERIA, SITUATIONAL_OPTIONAL, text)
    else:
        coverage = relevance

    # ── 3. Reasoning ────────────────────────────────────────────────────────
    causal_hits = sum(1 for p in CAUSALITY_PATTERNS if p.search(text))
    depth_hits  = sum(1 for p in DEPTH_PATTERNS if p.search(text))
    reasoning = min(100, causal_hits * 30 + depth_hits * 10)

    # ── 4. Evidence ─────────────────────────────────────────────────────────
    example_hits = sum(1 for p in EXAMPLE_PATTERNS if p.search(text))
    outcome_hits = sum(1 for p in OUTCOME_PATTERNS if p.search(text))
    metric_match = bool(re.search(r'\b\d+\s*(%|percent|ms|x faster|times faster|users?|requests?|million|thousand)\b', text, re.IGNORECASE))
    evidence = min(100, (35 if example_hits >= 1 else 0) + (35 if outcome_hits >= 1 else 0) + (30 if metric_match else 0))

    # ── 5. Structure ────────────────────────────────────────────────────────
    if question_type == "behavioral":
        star_hits = sum(1 for p in STAR_PATTERNS.values() if p.search(text))
        structure = round(star_hits / 4 * 100)
    elif question_type == "technical":
        has_expl = bool(re.search(r'\b(works by|the reason|because|this means|in order to|under the hood)\b', text, re.IGNORECASE))
        has_trade = bool(re.search(r'\b(trade-?off|however|downside|limitation|alternatively|compared to)\b', text, re.IGNORECASE))
        structure = (50 if has_expl else 0) + (50 if has_trade else 0)
    elif question_type == "situational":
        has_assess = bool(re.search(r'\b(first i would|i\'d start|i would first|i would assess|i would check|i would investigate)\b', text, re.IGNORECASE))
        has_action = bool(re.search(r'\b(i would|i\'d|my approach|i would then|next i would)\b', text, re.IGNORECASE))
        has_risk   = bool(re.search(r'\b(risk|escalate|communicate|inform|notify|impact|stakeholder|priority)\b', text, re.IGNORECASE))
        structure  = round(((has_assess + has_action + has_risk) / 3) * 100)
    else:
        has_spec  = bool(re.search(r'\b(for example|specifically|such as|in particular|i\'ve worked)\b', text, re.IGNORECASE))
        has_align = bool(re.search(r'\b(this role|this company|this opportunity|what excites me|why i\'m interested)\b', text, re.IGNORECASE))
        structure = (50 if has_spec else 0) + (50 if has_align else 0)

    # ── 6. Filler penalty ───────────────────────────────────────────────────
    filler_count = sum(len(p.findall(text)) for p in FILLER_PATTERNS)
    filler_penalty = min(filler_count, 10)

    # ── 7. Weights (mirrors TypeScript rubric) ──────────────────────────────
    if question_type == "behavioral":
        w = dict(relevance=0.15, coverage=0.35, reasoning=0.20, evidence=0.20, structure=0.10)
    elif question_type == "technical":
        w = dict(relevance=0.20, coverage=0.40, reasoning=0.20, evidence=0.10, structure=0.10)
    elif question_type == "situational":
        w = dict(relevance=0.20, coverage=0.30, reasoning=0.25, evidence=0.10, structure=0.15)
    else:
        w = dict(relevance=0.25, coverage=0.25, reasoning=0.20, evidence=0.20, structure=0.10)

    raw = (
        relevance * w["relevance"] +
        coverage  * w["coverage"] +
        reasoning * w["reasoning"] +
        evidence  * w["evidence"] +
        structure * w["structure"] -
        filler_penalty
    )
    return max(0, min(100, round(raw)))


# ---------------------------------------------------------------------------
# Question keyword banks (matches evaluate_interviews.py v1 and interview-questions.ts)
# ---------------------------------------------------------------------------

QUESTION_KEYWORDS: dict[str, dict] = {
    "Q-B-01": {"type": "behavioral",  "keywords": ["ownership", "led", "initiative", "responsible", "delivered", "outcome", "result"]},
    "Q-B-02": {"type": "behavioral",  "keywords": ["learn", "quickly", "documentation", "prototype", "delivered", "challenge", "timeline"]},
    "Q-B-03": {"type": "behavioral",  "keywords": ["disagreed", "communicated", "convinced", "compromise", "perspective", "aligned", "outcome"]},
    "Q-B-04": {"type": "situational", "keywords": ["failed", "mistake", "root cause", "learned", "fixed", "recovered", "prevented"]},
    "Q-B-05": {"type": "behavioral",  "keywords": ["impact", "team", "contributed", "result", "metric", "shipped", "collaboration"]},
    "Q-B-06": {"type": "behavioral",  "keywords": ["feedback", "constructive", "improved", "action", "changed", "reflected"]},
    "Q-B-07": {"type": "behavioral",  "keywords": ["prioritize", "urgent", "impact", "tradeoff", "stakeholder", "communicated", "deadline"]},
    "Q-B-08": {"type": "behavioral",  "keywords": ["read", "blog", "conference", "course", "practice", "community", "side project"]},
    "Q-B-09": {"type": "behavioral",  "keywords": ["negotiate", "timeline", "stakeholder", "communicated", "mvp", "compromise"]},
    "Q-B-10": {"type": "behavioral",  "keywords": ["failed", "mistake", "root cause", "learned", "fixed", "post-mortem", "prevented"]},
    "Q-T-01": {"type": "technical",   "keywords": ["rest", "stateless", "http", "json", "crud", "endpoint", "graphql"]},
    "Q-T-02": {"type": "technical",   "keywords": ["docker", "kubernetes", "container", "orchestration", "deployment", "scaling", "service"]},
    "Q-T-03": {"type": "technical",   "keywords": ["cache", "redis", "ttl", "eviction", "invalidation", "database", "performance"]},
    "Q-T-04": {"type": "technical",   "keywords": ["index", "b-tree", "select", "query", "performance", "trade-off", "insert"]},
    "Q-T-05": {"type": "technical",   "keywords": ["machine learning", "supervised", "bias", "variance", "regularization", "model"]},
    "Q-T-06": {"type": "technical",   "keywords": ["load balancer", "round-robin", "layer", "tcp", "nginx", "health check"]},
    "Q-T-07": {"type": "technical",   "keywords": ["solid", "single responsibility", "open-closed", "dependency", "interface"]},
    "Q-T-08": {"type": "technical",   "keywords": ["requirements", "storage", "database", "scale", "cdn", "load balancer", "encoding"]},
}


def _load_jsonl(path: str) -> list[dict]:
    records = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                records.append(json.loads(line))
    return records


def _spearman(xs: list[float], ys: list[float]) -> float | None:
    n = len(xs)
    if n < 3:
        return None
    def _rank(arr):
        sorted_idx = sorted(range(n), key=lambda i: arr[i])
        ranks = [0.0] * n
        for rank, idx in enumerate(sorted_idx, 1):
            ranks[idx] = float(rank)
        return ranks
    rx = _rank(xs)
    ry = _rank(ys)
    d2 = sum((rx[i] - ry[i]) ** 2 for i in range(n))
    return round(1 - (6 * d2) / (n * (n * n - 1)), 4)


def _reviewer_composite(rubric: dict) -> float:
    dims = ["relevance", "keyword_coverage", "star_structure", "depth", "technical_accuracy"]
    vals = [rubric.get(d, -1) for d in dims]
    applicable = [v for v in vals if v >= 0]
    if not applicable:
        return -1.0
    return round(sum(applicable) / len(applicable) / 4 * 100, 1)


def _aggregate(rows: list[dict]) -> dict:
    if not rows:
        return {}
    n = len(rows)
    mae  = round(sum(r["abs_error"] for r in rows) / n, 2)
    rmse = round(math.sqrt(sum(r["sq_error"] for r in rows) / n), 2)
    sys_scores = [r["system_score"] for r in rows]
    rev_scores = [r["reviewer_score"] for r in rows]
    signed_me  = round(sum(s - r for s, r in zip(sys_scores, rev_scores)) / n, 2)
    spearman   = _spearman(sys_scores, rev_scores)
    high_low = sum(1 for r in rows if r["system_score"] >= 70 and r["reviewer_score"] < 40)
    low_high = sum(1 for r in rows if r["system_score"] < 40 and r["reviewer_score"] >= 70)
    return {"n": n, "mae": mae, "rmse": rmse, "signed_mean_error": signed_me,
            "spearman": spearman, "system_high_reviewer_low": high_low,
            "system_low_reviewer_high": low_high}


def run() -> dict:
    print("=" * 66)
    print("  AI Career Copilot — Interview Evaluator Evaluation  (v2)")
    print("=" * 66)
    print("\n  Evaluator: v2 — component-based, alias-aware, question-type-specific")
    print("  NOT Ollama, NOT LLM, NOT cloud API.")
    print("  DATA: SYNTHETIC. Real-world performance NOT validated.\n")
    print("  Phase 3 historical baseline:")
    print(f"    MAE={PHASE3_BASELINE['mae']}  RMSE={PHASE3_BASELINE['rmse']}  Spearman={PHASE3_BASELINE['spearman']}")
    print(f"    Low-system / High-reviewer: {PHASE3_BASELINE['system_low_reviewer_high']} / {PHASE3_BASELINE['n']}\n")

    if not os.path.exists(ANNOTATIONS_PATH):
        print(f"[ERROR] {ANNOTATIONS_PATH}")
        sys.exit(1)

    annotations = _load_jsonl(ANNOTATIONS_PATH)
    print(f"  Loaded {len(annotations)} annotation records.")

    all_rows = []
    dev_rows = []
    held_rows = []

    for ann in annotations:
        qid         = ann["question_id"]
        qtype       = ann["question_type"]
        answer_text = ann.get("answer_text", "")
        if not answer_text.strip():
            continue

        qinfo    = QUESTION_KEYWORDS.get(qid, {"type": qtype, "keywords": []})
        keywords = qinfo["keywords"]
        qtype_resolved = qinfo["type"]

        system_score   = _score_v2(qid, qtype_resolved, keywords, answer_text)
        reviewer_comp  = _reviewer_composite(ann["rubric"])
        if reviewer_comp < 0:
            continue

        partition = "dev" if qid in DEV_QUESTION_IDS else "held_out"
        row = {
            "example_id":    ann["example_id"],
            "question_id":   qid,
            "question_type": qtype,
            "reviewer_id":   ann["reviewer_id"],
            "partition":     partition,
            "system_score":  system_score,
            "reviewer_score": reviewer_comp,
            "abs_error":     abs(system_score - reviewer_comp),
            "sq_error":      (system_score - reviewer_comp) ** 2,
            "signed_error":  system_score - reviewer_comp,
        }
        all_rows.append(row)
        (dev_rows if partition == "dev" else held_rows).append(row)

        marker = "DEV" if partition == "dev" else "HLD"
        print(f"  [{marker}] {ann['example_id']:7s} [{qtype:11s}] | "
              f"v2={system_score:3d} | reviewer={reviewer_comp:5.1f} | "
              f"|err|={abs(system_score - reviewer_comp):5.1f}")

    if not all_rows:
        print("[ERROR] No valid rows evaluated.")
        sys.exit(1)

    # Aggregated metrics
    overall = _aggregate(all_rows)
    dev_agg = _aggregate(dev_rows)
    held_agg = _aggregate(held_rows)

    # Per question type
    by_type: dict[str, list] = defaultdict(list)
    for r in all_rows:
        by_type[r["question_type"]].append(r)

    print(f"\n  ─── Overall (n={overall['n']}) ───")
    print(f"  MAE={overall['mae']:.1f}  RMSE={overall['rmse']:.1f}  Spearman={overall['spearman']}  Bias={overall['signed_mean_error']:+.1f}")
    print(f"  Low-system / High-reviewer: {overall['system_low_reviewer_high']} | High-system / Low-reviewer: {overall['system_high_reviewer_low']}")
    print(f"\n  ─── DEV partition (n={dev_agg.get('n', 0)}) ───")
    print(f"  MAE={dev_agg.get('mae', 'N/A')}  RMSE={dev_agg.get('rmse', 'N/A')}  Spearman={dev_agg.get('spearman', 'N/A')}  Bias={dev_agg.get('signed_mean_error', 'N/A'):+.1f}" if dev_agg else "  (empty)")
    print(f"\n  ─── HELD-OUT partition (n={held_agg.get('n', 0)}) [LOCKED — not used for tuning] ───")
    print(f"  MAE={held_agg.get('mae', 'N/A')}  RMSE={held_agg.get('rmse', 'N/A')}  Spearman={held_agg.get('spearman', 'N/A')}  Bias={held_agg.get('signed_mean_error', 'N/A'):+.1f}" if held_agg else "  (empty)")

    print(f"\n  ─── Per question-type ───")
    type_metrics = {}
    for qtype, rows in sorted(by_type.items()):
        agg = _aggregate(rows)
        print(f"  {qtype:12s}: n={agg['n']}  MAE={agg['mae']:.1f}  RMSE={agg['rmse']:.1f}  Spearman={agg['spearman']}")
        type_metrics[qtype] = agg

    # IAA
    by_answer: dict[str, list] = defaultdict(list)
    for ann in annotations:
        by_answer[ann.get("answer_text_id", ann["example_id"])].append(ann)
    iaa_pairs = []
    for aid, recs in by_answer.items():
        rev_scores = [_reviewer_composite(r["rubric"]) for r in recs if _reviewer_composite(r["rubric"]) >= 0]
        if len(rev_scores) == 2:
            iaa_pairs.append((rev_scores[0], rev_scores[1]))
    if iaa_pairs:
        iaa_mae = round(sum(abs(a-b) for a, b in iaa_pairs) / len(iaa_pairs), 2)
        print(f"\n  Inter-Annotator Agreement (n={len(iaa_pairs)} pairs): MAE={iaa_mae:.1f} on 0-100 scale")
        iaa_info = {"n_pairs": len(iaa_pairs), "mae_scale_0_100": iaa_mae}
    else:
        iaa_info = {"n_pairs": 0, "note": "Insufficient pairs."}

    # Comparison with Phase 3 baseline
    print(f"\n  ─── Comparison with Phase 3 baseline ───")
    mae_delta  = round(overall["mae"] - PHASE3_BASELINE["mae"], 2)
    rmse_delta = round(overall["rmse"] - PHASE3_BASELINE["rmse"], 2)
    sp_delta   = round((overall["spearman"] or 0) - PHASE3_BASELINE["spearman"], 4)
    print(f"  MAE  change: {mae_delta:+.1f} (Phase3={PHASE3_BASELINE['mae']}, v2={overall['mae']})")
    print(f"  RMSE change: {rmse_delta:+.1f}")
    print(f"  Spearman:    {sp_delta:+.4f}")

    # Write CSV
    csv_path = os.path.join(REPORTS_DIR, "interview_metrics_v2.csv")
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "example_id", "question_id", "question_type", "reviewer_id", "partition",
            "system_score", "reviewer_score", "abs_error", "sq_error", "signed_error"
        ])
        writer.writeheader()
        writer.writerows(all_rows)
    print(f"\n  Written: {csv_path}")

    result = {
        "task": "interview_evaluator_v2",
        "rubric_version": "2.0.0",
        "phase3_baseline": PHASE3_BASELINE,
        "partition_scheme": {
            "dev_question_ids": sorted(DEV_QUESTION_IDS),
            "held_out_question_ids": sorted(set(QUESTION_KEYWORDS.keys()) - DEV_QUESTION_IDS),
            "rationale": "Partitioned by question family; both reviewer records for the same answer are in the same partition to prevent leakage.",
        },
        "dataset": {
            "source": "synthetic",
            "num_annotations": len(annotations),
            "num_evaluated": len(all_rows),
            "known_limitation": "ALL results are on SYNTHETIC data. Real-world validation requires human-reviewed, permissioned QA pairs.",
        },
        "overall": overall,
        "dev_partition": dev_agg,
        "held_out_partition": held_agg,
        "per_question_type": type_metrics,
        "inter_annotator_agreement": iaa_info,
        "comparison_with_phase3": {
            "mae_delta": mae_delta,
            "rmse_delta": rmse_delta,
            "spearman_delta": sp_delta,
            "note": "Delta measured on SAME SYNTHETIC dataset. Improvement on synthetic data does NOT imply real-world improvement.",
        },
        "env": {
            "python_version": platform.python_version(),
            "evaluated_at": datetime.now(timezone.utc).isoformat(),
        },
    }
    return result


if __name__ == "__main__":
    result = run()
    metrics_path = os.path.join(REPORTS_DIR, "metrics_v2.json")
    existing = {}
    if os.path.exists(metrics_path):
        with open(metrics_path, encoding="utf-8") as f:
            existing = json.load(f)
    existing["interview_evaluator_v2"] = result
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(existing, f, indent=2)
    print(f"  Written: {metrics_path}")
    print("\n" + "=" * 66)
    print("  Interview evaluation v2 complete (SYNTHETIC DATA ONLY).")
    print("=" * 66)
