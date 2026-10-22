"""
evaluate_parser.py
==================
Evaluates the resume_parser.py field-extraction pipeline against 30
synthetic annotated fixtures.

Metrics computed:
  - Per-field precision, recall, F1 for categorical fields
  - Skill extraction P/R/F1 (extraction + canonical normalization)
  - Section detection accuracy
  - Years-of-experience MAE where ground truth is numeric
  - Error catalogue (FP / FN / wrong normalization / wrong section / wrong date)

Output:
  ml/evaluation/reports/parser_metrics.csv
  ml/evaluation/reports/error_analysis.csv  (appended)
  ml/evaluation/reports/metrics.json  (parser section)

Matching rules (as configured in eval_config.json):
  - name:    exact string match (after strip)
  - email:   exact string match (lowercase)
  - phone:   normalized digits only (strip +, spaces, dashes)
  - linkedin/github/portfolio: exact string match (lowercase, strip https?://)
  - skills:  canonical_lower (normalize both predicted and ground truth)
  - section: label_only (section name must match; no boundary check)
  - year:    exact integer

NOTE: All conclusions in this report are limited to performance on
SYNTHETIC fixtures. Synthetic results do NOT validate real-world performance.
Human annotation of real (permissioned, anonymised) resumes is required
for real-world performance claims.

Usage (from project root):
    python ml/evaluation/scripts/evaluate_parser.py
"""

import json
import os
import sys
import csv
import re
import platform
from datetime import datetime, timezone
from typing import Any

SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "..", ".."))
sys.path.insert(0, PROJECT_ROOT)

FIXTURES_PATH     = os.path.join(PROJECT_ROOT, "ml", "evaluation", "fixtures", "synthetic_resumes.jsonl")
ANNOTATIONS_PATH  = os.path.join(PROJECT_ROOT, "ml", "evaluation", "annotations", "parser_annotations.jsonl")
REPORTS_DIR       = os.path.join(PROJECT_ROOT, "ml", "evaluation", "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)


# ---------------------------------------------------------------------------
# Helper utilities
# ---------------------------------------------------------------------------

def _normalize_phone(phone: str | None) -> str:
    """Strip all non-digit characters for phone comparison."""
    if not phone:
        return ""
    return re.sub(r"\D", "", phone)


def _normalize_url(url: str | None) -> str:
    """Lowercase and strip http(s):// prefix."""
    if not url:
        return ""
    return re.sub(r"^https?://", "", url.strip().lower())


def _normalize_email(email: str | None) -> str:
    return (email or "").strip().lower()


def _normalize_skill_lower(skill: str) -> str:
    """Try to normalize via the parser's normalize_skill; fallback to lowercase."""
    try:
        from ml.src.resume_parser import normalize_skill
        return normalize_skill(skill).lower()
    except Exception:
        return skill.lower()


def _get_env_info() -> dict:
    try:
        import spacy
        spacy_version = spacy.__version__
        model_meta = spacy.load("en_core_web_sm").meta
        model_version = model_meta.get("version", "unknown")
    except Exception:
        spacy_version = "unknown"
        model_version = "unknown"
    return {
        "python_version": platform.python_version(),
        "spacy_version": spacy_version,
        "spacy_model_version": model_version,
        "platform": platform.system(),
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
    }


# ---------------------------------------------------------------------------
# Load data
# ---------------------------------------------------------------------------

def _load_jsonl(path: str) -> list[dict]:
    records = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                records.append(json.loads(line))
    return records


# ---------------------------------------------------------------------------
# Per-example evaluation
# ---------------------------------------------------------------------------

def _evaluate_example(
    fixture: dict, annotation: dict, parsed: dict
) -> dict[str, Any]:
    """
    Compare parser output against a single annotation record.
    Returns a dict of field-level correct/incorrect/missing/extra counts
    and an errors list.
    """
    gt = annotation["ground_truth"]
    gt_candidate = gt.get("candidate", {})

    errors = []
    field_results = {}

    # --- Contact fields ---
    for field, norm_fn in [
        ("name",      lambda v: (v or "").strip()),
        ("email",     _normalize_email),
        ("phone",     _normalize_phone),
        ("linkedin",  _normalize_url),
        ("github",    _normalize_url),
        ("portfolio", _normalize_url),
    ]:
        gt_val   = norm_fn(gt_candidate.get(field))
        pred_val = norm_fn(parsed.get("candidate", {}).get(field))
        correct  = gt_val == pred_val

        if gt_val and pred_val and not correct:
            errors.append({
                "example_id": annotation["example_id"],
                "field": field,
                "error_type": "wrong_value",
                "expected": gt_val[:80],
                "predicted": pred_val[:80],
            })
        elif gt_val and not pred_val:
            errors.append({
                "example_id": annotation["example_id"],
                "field": field,
                "error_type": "missed_entity",
                "expected": gt_val[:80],
                "predicted": "",
            })
        elif pred_val and not gt_val:
            errors.append({
                "example_id": annotation["example_id"],
                "field": field,
                "error_type": "false_positive",
                "expected": "",
                "predicted": pred_val[:80],
            })

        field_results[field] = {
            "tp": int(bool(gt_val and correct)),
            "fp": int(bool(pred_val and not gt_val)),
            "fn": int(bool(gt_val and not pred_val)),
        }

    # --- Skill extraction and normalization ---
    gt_skills_canonical  = set(_normalize_skill_lower(s) for s in gt["skills"].get("expected_canonical", []))
    should_not_appear    = set(_normalize_skill_lower(s) for s in gt["skills"].get("should_not_appear", []))

    raw_predicted_skills = parsed.get("skills", {})
    if isinstance(raw_predicted_skills, dict):
        from ml.src.resume_parser import flatten_skills
        predicted_flat = flatten_skills(raw_predicted_skills)
    elif isinstance(raw_predicted_skills, list):
        predicted_flat = raw_predicted_skills
    else:
        predicted_flat = []

    predicted_skills_canonical = set(_normalize_skill_lower(s) for s in predicted_flat)

    skill_tp = len(gt_skills_canonical & predicted_skills_canonical)
    skill_fp = len(predicted_skills_canonical - gt_skills_canonical)
    skill_fn = len(gt_skills_canonical - predicted_skills_canonical)

    # False positives from should_not_appear
    false_positives_from_negation = should_not_appear & predicted_skills_canonical
    for fp_skill in false_positives_from_negation:
        errors.append({
            "example_id": annotation["example_id"],
            "field": "skill",
            "error_type": "false_positive_should_not_appear",
            "expected": "",
            "predicted": fp_skill,
        })

    # Missing expected skills
    for missing in (gt_skills_canonical - predicted_skills_canonical):
        errors.append({
            "example_id": annotation["example_id"],
            "field": "skill",
            "error_type": "missed_entity",
            "expected": missing,
            "predicted": "",
        })

    field_results["skill_extraction"] = {"tp": skill_tp, "fp": skill_fp, "fn": skill_fn}
    field_results["skill_normalization_fp"] = {"count": len(false_positives_from_negation)}

    # --- Section detection ---
    gt_sections = {s["label"]: s["present"] for s in gt.get("sections", [])}
    predicted_sections = parsed.get("skills", {})  # Check from parsed sections
    section_tp = section_fp = section_fn = 0
    for label, expected_present in gt_sections.items():
        # Derive presence from parsed output
        if label == "skills":
            skill_list = flatten_skills(parsed.get("skills", {})) if isinstance(parsed.get("skills"), dict) else parsed.get("skills", [])
            actual_present = len(skill_list) > 0
        elif label == "summary":
            actual_present = bool((parsed.get("summary") or "").strip())
        else:
            actual_present = len(parsed.get(label, [])) > 0

        if expected_present and actual_present:
            section_tp += 1
        elif not expected_present and actual_present:
            section_fp += 1
            errors.append({
                "example_id": annotation["example_id"],
                "field": f"section:{label}",
                "error_type": "false_positive",
                "expected": "not_present",
                "predicted": "present",
            })
        elif expected_present and not actual_present:
            section_fn += 1
            errors.append({
                "example_id": annotation["example_id"],
                "field": f"section:{label}",
                "error_type": "missed_entity",
                "expected": "present",
                "predicted": "not_present",
            })
    field_results["section_detection"] = {"tp": section_tp, "fp": section_fp, "fn": section_fn}

    # --- Years of experience (MAE) ---
    gt_yoe    = gt.get("years_of_experience")
    pred_yoe_data = parsed.get("yearsOfExperience", {})
    pred_yoe  = pred_yoe_data.get("value") if isinstance(pred_yoe_data, dict) else None

    yoe_error = None
    if gt_yoe is not None and pred_yoe is not None:
        yoe_error = abs(float(pred_yoe) - float(gt_yoe))
    elif gt_yoe is not None and pred_yoe is None:
        errors.append({
            "example_id": annotation["example_id"],
            "field": "years_of_experience",
            "error_type": "missed_entity",
            "expected": str(gt_yoe),
            "predicted": "",
        })

    return {
        "example_id": annotation["example_id"],
        "fixture_id": fixture["fixture_id"],
        "field_results": field_results,
        "yoe_error": yoe_error,
        "errors": errors,
    }


# ---------------------------------------------------------------------------
# Aggregate metrics
# ---------------------------------------------------------------------------

def _prf(tp: int, fp: int, fn: int) -> tuple[float, float, float]:
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall    = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1        = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0.0
    return round(precision, 4), round(recall, 4), round(f1, 4)


def run() -> dict:
    print("=" * 60)
    print("  AI Career Copilot — Resume Parser Evaluation")
    print("=" * 60)

    if not os.path.exists(FIXTURES_PATH):
        print(f"[ERROR] Fixtures file not found: {FIXTURES_PATH}")
        sys.exit(1)
    if not os.path.exists(ANNOTATIONS_PATH):
        print(f"[ERROR] Annotations file not found: {ANNOTATIONS_PATH}")
        sys.exit(1)

    # Import parser
    try:
        from ml.src.resume_parser import parse_resume, flatten_skills
    except ImportError as e:
        print(f"[ERROR] Cannot import resume_parser: {e}")
        sys.exit(1)

    fixtures    = {r["fixture_id"]: r for r in _load_jsonl(FIXTURES_PATH)}
    annotations = _load_jsonl(ANNOTATIONS_PATH)

    print(f"\n  Loaded {len(fixtures)} fixtures, {len(annotations)} annotations.")
    print("  DATA PROVENANCE: Synthetic fixtures only.")
    print("  LIMITATION: Results apply to synthetic data only.\n")

    # Aggregate accumulators
    field_accum: dict[str, dict[str, int]] = {}
    all_errors = []
    yoe_errors = []
    n_processed = 0

    for ann in annotations:
        fixture_id = ann["resume_text_id"]
        if fixture_id not in fixtures:
            print(f"  [WARN] Fixture {fixture_id} not found, skipping {ann['example_id']}")
            continue

        fixture = fixtures[fixture_id]
        text = fixture["text"]

        try:
            parsed = parse_resume(text)
        except Exception as exc:
            all_errors.append({
                "example_id": ann["example_id"],
                "field": "PARSE_CRASH",
                "error_type": "crash",
                "expected": "",
                "predicted": str(exc)[:120],
            })
            continue

        result = _evaluate_example(fixture, ann, parsed)
        all_errors.extend(result["errors"])
        if result["yoe_error"] is not None:
            yoe_errors.append(result["yoe_error"])

        for field, counts in result["field_results"].items():
            if field not in field_accum:
                field_accum[field] = {"tp": 0, "fp": 0, "fn": 0}
            field_accum[field]["tp"] += counts.get("tp", 0)
            field_accum[field]["fp"] += counts.get("fp", 0)
            field_accum[field]["fn"] += counts.get("fn", 0)

        n_processed += 1
        print(f"  [{n_processed:02d}/{len(annotations)}] {ann['example_id']} ({fixture['label']})")

    # Compute metrics
    csv_rows = []
    metrics_by_field = {}
    for field, counts in field_accum.items():
        if field == "skill_normalization_fp":
            continue  # handled separately
        p, r, f1 = _prf(counts["tp"], counts["fp"], counts["fn"])
        support = counts["tp"] + counts["fn"]
        csv_rows.append({
            "field": field,
            "precision": p,
            "recall": r,
            "f1": f1,
            "support_tp_fn": support,
        })
        metrics_by_field[field] = {"precision": p, "recall": r, "f1": f1, "support": support}

    yoe_mae = round(float(sum(yoe_errors) / len(yoe_errors)), 3) if yoe_errors else None

    # Print summary
    print(f"\n  {'Field':<26} {'Precision':>9} {'Recall':>9} {'F1':>9} {'Support':>9}")
    print("  " + "-" * 62)
    for row in csv_rows:
        print(f"  {row['field']:<26} {row['precision']:>9.4f} {row['recall']:>9.4f} {row['f1']:>9.4f} {row['support_tp_fn']:>9}")
    if yoe_mae is not None:
        print(f"\n  Years-of-experience MAE: {yoe_mae:.3f} years (n={len(yoe_errors)})")

    # Error summary
    from collections import Counter
    error_type_counts = Counter(e["error_type"] for e in all_errors)
    print(f"\n  Error breakdown (total {len(all_errors)}):")
    for etype, cnt in error_type_counts.most_common():
        print(f"    {etype}: {cnt}")

    # Write CSV reports
    parser_csv = os.path.join(REPORTS_DIR, "parser_metrics.csv")
    with open(parser_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["field","precision","recall","f1","support_tp_fn"])
        writer.writeheader()
        writer.writerows(csv_rows)
    print(f"\n  Written: {parser_csv}")

    error_csv = os.path.join(REPORTS_DIR, "error_analysis.csv")
    with open(error_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["example_id","field","error_type","expected","predicted"])
        writer.writeheader()
        writer.writerows(all_errors)
    print(f"  Written: {error_csv}")

    result = {
        "task": "resume_parser",
        "dataset": {
            "source": "synthetic",
            "num_fixtures": len(fixtures),
            "num_annotations": len(annotations),
            "num_processed": n_processed,
            "known_limitation": "ALL RESULTS ARE SYNTHETIC. Real-world performance requires human-annotated, permissioned resumes.",
        },
        "metrics_by_field": metrics_by_field,
        "years_of_experience_mae": yoe_mae,
        "total_errors": len(all_errors),
        "error_type_counts": dict(error_type_counts),
        "env": _get_env_info(),
    }
    return result


if __name__ == "__main__":
    result = run()
    metrics_path = os.path.join(REPORTS_DIR, "metrics.json")
    existing = {}
    if os.path.exists(metrics_path):
        with open(metrics_path, encoding="utf-8") as f:
            existing = json.load(f)
    existing["parser"] = result
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(existing, f, indent=2)
    print(f"  Written: {metrics_path}")
    print("\n" + "=" * 60)
    print("  Parser evaluation complete (SYNTHETIC DATA ONLY).")
    print("=" * 60)
