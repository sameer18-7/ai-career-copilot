"""
evaluate_ats.py
===============
Evaluates the deterministic ATS/readiness scoring rubric against
synthetic human rubric ratings.

Metrics:
  - Per-annotation: system score (0-100) vs reviewer overall (0-10 scaled to 0-100)
  - MAE, RMSE between system score and reviewer_overall*10
  - Spearman rank correlation
  - Component-level comparison where available
  - Per-score-band agreement analysis

IMPORTANT DISCLAIMERS (replicated in output):
  1. The ATS score is a deterministic rubric estimate, NOT a probability of
     being hired, and NOT an employer's official ATS score.
  2. All annotations are SYNTHETIC. Conclusions cannot be generalized to
     real resumes without human-reviewed, permissioned data.
  3. The system score is NEVER calibrated against hiring outcomes.
     "Calibration" in this script refers to alignment with the reviewer rubric
     — not with employment decisions.

Output:
  ml/evaluation/reports/ats_agreement.csv
  ml/evaluation/reports/metrics.json  (ats section)

Usage (from project root):
    python ml/evaluation/scripts/evaluate_ats.py
"""

import json
import os
import sys
import csv
import math
import platform
from datetime import datetime, timezone

SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "..", ".."))
sys.path.insert(0, PROJECT_ROOT)

ANNOTATIONS_PATH = os.path.join(PROJECT_ROOT, "ml", "evaluation", "annotations", "ats_annotations.jsonl")
FIXTURES_PATH    = os.path.join(PROJECT_ROOT, "ml", "evaluation", "fixtures", "synthetic_resumes.jsonl")
REPORTS_DIR      = os.path.join(PROJECT_ROOT, "ml", "evaluation", "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)


def _load_jsonl(path: str) -> list[dict]:
    records = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                records.append(json.loads(line))
    return records


def _spearman(xs: list[float], ys: list[float]) -> float | None:
    """Simple Spearman correlation without scipy dependency."""
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


def _get_env_info() -> dict:
    return {
        "python_version": platform.python_version(),
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
    }


def run() -> dict:
    print("=" * 60)
    print("  AI Career Copilot — ATS Scoring Evaluation")
    print("=" * 60)
    print("\n  DISCLAIMER: ATS score is a deterministic rubric estimate.")
    print("  It is NOT a hiring probability or official employer ATS score.")
    print("  All annotations are SYNTHETIC. Real-world validation pending.\n")

    if not os.path.exists(ANNOTATIONS_PATH):
        print(f"[ERROR] Annotations not found: {ANNOTATIONS_PATH}")
        sys.exit(1)
    if not os.path.exists(FIXTURES_PATH):
        print(f"[ERROR] Fixtures not found: {FIXTURES_PATH}")
        sys.exit(1)

    try:
        from ml.src.resume_parser import parse_resume
        from ml.src.ats_scorer import compute_ats_score
    except ImportError as e:
        print(f"[ERROR] Cannot import ML modules: {e}")
        sys.exit(1)

    fixtures    = {r["fixture_id"]: r for r in _load_jsonl(FIXTURES_PATH)}
    annotations = _load_jsonl(ANNOTATIONS_PATH)

    # Deduplicate: if same fixture+role has two reviewers, keep both for IAA
    rows = []
    errors_list = []

    for ann in annotations:
        fixture_id = ann["resume_text_id"]
        if fixture_id not in fixtures:
            print(f"  [WARN] Fixture {fixture_id} not found, skipping {ann['example_id']}")
            continue

        text        = fixtures[fixture_id]["text"]
        target_role = ann["target_role"]

        try:
            parsed = parse_resume(text)
            result = compute_ats_score(parsed, text, target_role)
        except Exception as exc:
            errors_list.append({
                "example_id": ann["example_id"],
                "error": str(exc)[:120],
            })
            continue

        system_score_100 = result.get("atsScore", 0)

        rubric = ann["rubric"]
        reviewer_overall_0_10 = rubric.get("reviewer_overall", -1)
        if reviewer_overall_0_10 < 0:
            continue  # Not rated

        # Scale reviewer score to 0-100 for comparison
        reviewer_scaled = reviewer_overall_0_10 * 10

        rows.append({
            "example_id":          ann["example_id"],
            "fixture_id":          fixture_id,
            "target_role":         target_role,
            "reviewer_id":         ann["reviewer_id"],
            "reviewer_overall_10": reviewer_overall_0_10,
            "reviewer_scaled_100": reviewer_scaled,
            "system_score_100":    system_score_100,
            "abs_error":           abs(system_score_100 - reviewer_scaled),
            "sq_error":            (system_score_100 - reviewer_scaled) ** 2,
            "score_type":          result.get("scoreType", "role_based"),
        })

        print(f"  {ann['example_id']:8s} | role={target_role:25s} | "
              f"reviewer={reviewer_scaled:3.0f} | system={system_score_100:3d} | "
              f"|err|={abs(system_score_100 - reviewer_scaled):3.0f}")

    if not rows:
        print("[ERROR] No valid annotated examples could be evaluated.")
        sys.exit(1)

    # Aggregate metrics
    n = len(rows)
    mae  = round(sum(r["abs_error"] for r in rows) / n, 2)
    rmse = round(math.sqrt(sum(r["sq_error"] for r in rows) / n), 2)
    sys_scores      = [r["system_score_100"] for r in rows]
    reviewer_scaled = [r["reviewer_scaled_100"] for r in rows]
    spearman        = _spearman(sys_scores, reviewer_scaled)

    print(f"\n  n={n}  MAE={mae:.1f}  RMSE={rmse:.1f}  Spearman={spearman}")

    # Score-band agreement
    bands = {"0-29": {"agree": 0, "total": 0}, "30-59": {"agree": 0, "total": 0},
             "60-79": {"agree": 0, "total": 0}, "80-100": {"agree": 0, "total": 0}}
    for r in rows:
        s = r["system_score_100"]
        if   s < 30:  band = "0-29"
        elif s < 60:  band = "30-59"
        elif s < 80:  band = "60-79"
        else:          band = "80-100"
        bands[band]["total"] += 1
        rv = r["reviewer_scaled_100"]
        if   rv < 30:  rv_band = "0-29"
        elif rv < 60:  rv_band = "30-59"
        elif rv < 80:  rv_band = "60-79"
        else:           rv_band = "80-100"
        if band == rv_band:
            bands[band]["agree"] += 1

    print("\n  Score-band agreement (system vs reviewer):")
    for band, d in bands.items():
        pct = d["agree"] / d["total"] * 100 if d["total"] else 0
        print(f"    {band}: {d['agree']}/{d['total']} = {pct:.0f}%")

    # Inter-annotator agreement for examples with 2 reviewers
    from collections import defaultdict
    by_fixture_role: dict[str, list] = defaultdict(list)
    for r in rows:
        by_fixture_role[(r["fixture_id"], r["target_role"])].append(r["reviewer_overall_10"])
    iaa_pairs = [(vs[0], vs[1]) for vs in by_fixture_role.values() if len(vs) == 2]
    if iaa_pairs:
        iaa_mae = round(sum(abs(a - b) for a, b in iaa_pairs) / len(iaa_pairs), 2)
        print(f"\n  Inter-Annotator Agreement (n={len(iaa_pairs)} pairs, MAE on 0-10 scale): {iaa_mae:.2f}")
        iaa_info = {"n_pairs": len(iaa_pairs), "mae_scale_0_10": iaa_mae}
    else:
        iaa_info = {"n_pairs": 0, "note": "Insufficient reviewer pairs for IAA calculation"}

    # Write CSV
    csv_path = os.path.join(REPORTS_DIR, "ats_agreement.csv")
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "example_id","fixture_id","target_role","reviewer_id",
            "reviewer_overall_10","reviewer_scaled_100","system_score_100",
            "abs_error","sq_error","score_type"
        ])
        writer.writeheader()
        writer.writerows(rows)
    print(f"\n  Written: {csv_path}")

    return {
        "task": "ats_scorer",
        "disclaimer": (
            "ATS score is a deterministic rubric estimate, not a hiring "
            "probability or official employer ATS score. All annotations are "
            "SYNTHETIC. Real-world calibration requires human-reviewed, "
            "permissioned resumes. The scorer is NEVER calibrated against "
            "hiring outcomes."
        ),
        "dataset": {
            "source": "synthetic",
            "num_annotations": len(annotations),
            "num_evaluated": n,
        },
        "metrics": {
            "mae_system_vs_reviewer_scaled_100":  mae,
            "rmse_system_vs_reviewer_scaled_100": rmse,
            "spearman_correlation": spearman,
        },
        "score_band_agreement": {b: d for b, d in bands.items()},
        "inter_annotator_agreement": iaa_info,
        "env": _get_env_info(),
    }


if __name__ == "__main__":
    result = run()
    metrics_path = os.path.join(REPORTS_DIR, "metrics.json")
    existing = {}
    if os.path.exists(metrics_path):
        with open(metrics_path, encoding="utf-8") as f:
            existing = json.load(f)
    existing["ats_scorer"] = result
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(existing, f, indent=2)
    print(f"  Written: {metrics_path}")
    print("\n" + "=" * 60)
    print("  ATS evaluation complete (SYNTHETIC DATA ONLY).")
    print("=" * 60)
