"""
run_all.py
==========
Master evaluation runner for AI Career Copilot Phase 3.
Runs all implemented evaluations in order, collects results, and
writes a human-readable summary report.

Evaluations run:
  1. Category classifier  (real CSV data, real model)
  2. Resume parser        (synthetic fixtures)
  3. ATS scorer           (synthetic annotations)
  4. Interview evaluator  (synthetic annotations)
  5. Job matching         SKIPPED — not implemented (schema only)

Writes:
  ml/evaluation/reports/metrics.json
  ml/evaluation/reports/summary.md

Usage (from project root):
    python ml/evaluation/scripts/run_all.py

Exit codes:
  0 — all implemented evaluations completed without errors
  1 — one or more evaluations failed to run
"""

import json
import os
import sys
import traceback
from datetime import datetime, timezone

SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "..", ".."))
sys.path.insert(0, PROJECT_ROOT)

REPORTS_DIR = os.path.join(PROJECT_ROOT, "ml", "evaluation", "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)

METRICS_PATH = os.path.join(REPORTS_DIR, "metrics.json")
SUMMARY_PATH = os.path.join(REPORTS_DIR, "summary.md")


def _banner(title: str) -> None:
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)


def run_classifier():
    from ml.evaluation.scripts import evaluate_classifier
    return evaluate_classifier.run()


def run_parser():
    from ml.evaluation.scripts import evaluate_parser
    return evaluate_parser.run()


def run_ats():
    from ml.evaluation.scripts import evaluate_ats
    return evaluate_ats.run()


def run_interviews():
    from ml.evaluation.scripts import evaluate_interviews
    return evaluate_interviews.run()


def main():
    _banner("AI Career Copilot — Phase 3 Evaluation (run_all.py)")
    print(f"  Project root: {PROJECT_ROOT}")
    print(f"  Reports dir:  {REPORTS_DIR}")
    print(f"  Started at:   {datetime.now(timezone.utc).isoformat()}")

    results   = {}
    statuses  = {}

    tasks = [
        ("classifier",  "Category Classifier Evaluation",    run_classifier),
        ("parser",      "Resume Parser Evaluation",          run_parser),
        ("ats_scorer",  "ATS/Readiness Scorer Evaluation",   run_ats),
        ("interviews",  "Interview Evaluator Evaluation",    run_interviews),
    ]

    for key, label, fn in tasks:
        _banner(label)
        try:
            results[key] = fn()
            statuses[key] = "PASSED"
            print(f"\n  [{key}] PASSED")
        except SystemExit as e:
            statuses[key] = f"FAILED (exit {e.code})"
            print(f"\n  [{key}] FAILED — see errors above.")
        except Exception:
            statuses[key] = "FAILED (exception)"
            print(f"\n  [{key}] FAILED with exception:")
            traceback.print_exc()

    # Job matching: always skipped, document clearly
    job_skip_note = (
        "Job matching evaluation SKIPPED. The current application implements only "
        "pairwise TF-IDF role-alignment scoring, not ranked retrieval from a "
        "candidate pool. MRR, nDCG@k, and Recall@k cannot be computed until a "
        "ranked candidate set is implemented. Schema is available at "
        "ml/evaluation/schemas/job_matching_schema.json."
    )
    results["job_matching"] = {
        "task": "job_matching",
        "status": "not_implemented",
        "note": job_skip_note,
    }
    statuses["job_matching"] = "SKIPPED (not implemented)"

    # Persist metrics
    all_passed = all(v == "PASSED" for k, v in statuses.items() if k != "job_matching")
    full_results = {
        "run_at":  datetime.now(timezone.utc).isoformat(),
        "statuses": statuses,
        **results,
    }
    with open(METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(full_results, f, indent=2)
    print(f"\n  Written: {METRICS_PATH}")

    # Generate summary.md
    _write_summary(full_results, statuses)
    print(f"  Written: {SUMMARY_PATH}")

    _banner("Evaluation Summary")
    for key, status in statuses.items():
        mark = "OK" if "PASSED" in status else ("--" if "SKIPPED" in status else "!!")
        print(f"  [{mark}] {key:20s} {status}")

    print(f"\n  All implemented evaluations passed: {all_passed}")
    sys.exit(0 if all_passed else 1)


def _write_summary(results: dict, statuses: dict) -> None:
    clf = results.get("classifier", {})
    par = results.get("parser", {})
    ats = results.get("ats_scorer", {})
    ivw = results.get("interview_evaluator", {})

    clf_m = clf.get("metrics", {})
    par_m = par.get("metrics_by_field", {})
    ats_m = ats.get("metrics", {})
    ivw_m = ivw.get("metrics", {})

    skill_ext  = par_m.get("skill_extraction", {})
    skill_norm = par_m.get("skill_normalization_fp", {})
    section_d  = par_m.get("section_detection", {})

    def pct(val):
        return f"{val * 100:.1f}%" if val is not None else "N/A"

    lines = [
        "# AI Career Copilot — Phase 3 Evaluation Summary",
        "",
        f"> **Generated:** {results.get('run_at', 'unknown')}",
        f"> **Project:** AI Career Copilot",
        "",
        "> [!WARNING]",
        "> Parser, ATS, and Interview metrics are measured on **SYNTHETIC fixtures only**.",
        "> These results do NOT validate real-world performance. Human annotation of",
        "> real (permissioned, anonymised) resumes is required for real-world claims.",
        "",
        "---",
        "",
        "## Evaluation Status",
        "",
        "| Component | Status | Data Source |",
        "|---|---|---|",
        f"| Category Classifier | {statuses.get('classifier', '?')} | Kaggle Resume CSV (real, public) |",
        f"| Resume Parser | {statuses.get('parser', '?')} | Synthetic fixtures (30 examples) |",
        f"| ATS Scorer | {statuses.get('ats_scorer', '?')} | Synthetic annotations (20 examples) |",
        f"| Interview Evaluator | {statuses.get('interviews', '?')} | Synthetic QA pairs (30 examples) |",
        f"| Job Matching | SKIPPED | Not yet implemented (schema only) |",
        "",
        "---",
        "",
        "## 1. Category Classifier",
        "",
        f"**Dataset:** Kaggle Resume Dataset — {clf.get('dataset', {}).get('unique_resumes', '?')} unique resumes, 24 categories",
        f"**Split:** 80/10/10 stratified, seed=42, locked test partition",
        f"**Near-duplicates removed:** {clf.get('dataset', {}).get('duplicates_removed', '?')}",
        "",
        "| Metric | System | Baseline (most-frequent) |",
        "|---|---|---|",
        f"| Accuracy | **{clf_m.get('accuracy', 0):.4f}** ({clf_m.get('accuracy', 0)*100:.1f}%) | {clf.get('baseline', {}).get('accuracy', 0):.4f} |",
        f"| Macro-F1 | **{clf_m.get('macro_f1', 0):.4f}** | {clf.get('baseline', {}).get('macro_f1', 0):.4f} |",
        f"| Weighted-F1 | **{clf_m.get('weighted_f1', 0):.4f}** | — |",
        "",
        "**Top misclassifications:**",
    ]

    for mc in clf.get("top_misclassifications", [])[:5]:
        lines.append(f"- {mc['true']} → {mc['pred']}: {mc['count']}")

    lines += [
        "",
        "**Class imbalance:** BPO (22) to IT/BD (120). Macro-F1 is the primary metric.",
        "",
        "> [!NOTE]",
        "> The model was trained with the same `random_state=42` split. The CSV-based",
        "> split guarantees partition separation only if the source CSV is identical",
        "> to the one used during training. If the CSV has been updated, model version",
        "> and evaluation data may not correspond exactly.",
        "",
        "---",
        "",
        "## 2. Resume Parser",
        "",
        "**Data:** 30 synthetic fixtures — diverse formats, dates, alias skills, domains, edge cases.",
        "",
        "| Field | Precision | Recall | F1 | Support |",
        "|---|---|---|---|---|",
    ]

    for field, m in par_m.items():
        if field == "skill_normalization_fp":
            continue
        lines.append(
            f"| {field} | {m.get('precision', 0):.4f} | {m.get('recall', 0):.4f} | {m.get('f1', 0):.4f} | {m.get('support', 0)} |"
        )

    yoe_mae = par.get("years_of_experience_mae")
    lines += [
        "",
        f"**Years-of-experience MAE:** {yoe_mae if yoe_mae is not None else 'N/A'} years",
        f"**Total extraction errors:** {par.get('total_errors', '?')}",
        "",
        "**Error type breakdown:**",
    ]
    for etype, cnt in par.get("error_type_counts", {}).items():
        lines.append(f"- `{etype}`: {cnt}")

    lines += [
        "",
        "> [!IMPORTANT]",
        "> All parser metrics apply to **synthetic fixtures only**. Synthetic examples",
        "> cover controlled edge cases but are not representative of the full",
        "> distribution of real-world resumes.",
        "",
        "---",
        "",
        "## 3. ATS / Readiness Scorer",
        "",
        "**Data:** 20 synthetic reviewer rubric ratings (0–10 per dimension → scaled to 0–100)",
        "",
        "> [!CAUTION]",
        "> The ATS score is a **deterministic rubric estimate** — NOT a probability of being",
        "> hired, NOT an official employer ATS score. The scorer is never calibrated against",
        "> hiring outcomes. 'Agreement with reviewer' means agreement with a simulated",
        "> document-quality rating, not employment success prediction.",
        "",
        "| Metric | Value |",
        "|---|---|",
        f"| MAE (system vs reviewer, 0–100 scale) | {ats_m.get('mae_system_vs_reviewer_scaled_100', 'N/A')} |",
        f"| RMSE | {ats_m.get('rmse_system_vs_reviewer_scaled_100', 'N/A')} |",
        f"| Spearman correlation | {ats_m.get('spearman_correlation', 'N/A')} |",
        "",
        "**Score-band agreement:**",
    ]
    for band, d in ats.get("score_band_agreement", {}).items():
        pct_v = d["agree"] / d["total"] * 100 if d.get("total") else 0
        lines.append(f"- {band}: {d.get('agree', 0)}/{d.get('total', 0)} = {pct_v:.0f}%")

    iaa = ats.get("inter_annotator_agreement", {})
    if iaa.get("n_pairs", 0) > 0:
        lines.append(f"\n**Inter-Annotator Agreement:** {iaa['n_pairs']} pairs, MAE = {iaa.get('mae_scale_0_10', 'N/A')} (0–10 scale)")

    lines += [
        "",
        "---",
        "",
        "## 4. Interview Evaluator",
        "",
        "**Implementation:** Local rule-based — keyword regex + STAR pattern detection + depth signals.",
        "**NOT** Ollama, LLM, or cloud API. Pronunciation/accent NOT assessed.",
        "",
        "| Metric | Value |",
        "|---|---|",
        f"| MAE (system vs reviewer, 0–100) | {ivw_m.get('mae_system_vs_reviewer_100', 'N/A')} |",
        f"| RMSE | {ivw_m.get('rmse_system_vs_reviewer_100', 'N/A')} |",
        f"| Spearman correlation | {ivw_m.get('spearman_correlation', 'N/A')} |",
        "",
        "**Per question-type breakdown:**",
    ]

    for qtype, tm in ivw.get("per_question_type", {}).items():
        lines.append(f"- **{qtype}**: n={tm['n']}, MAE={tm['mae']:.1f}, RMSE={tm['rmse']:.1f}")

    err = ivw.get("error_counts", {})
    lines += [
        "",
        "**Error categories:**",
        f"- System HIGH (≥70) / Reviewer LOW (<40): {err.get('high_system_low_reviewer', 0)}",
        f"- System LOW (<40) / Reviewer HIGH (≥70): {err.get('low_system_high_reviewer', 0)}",
        "",
        "---",
        "",
        "## 5. Job Matching",
        "",
        "> [!WARNING]",
        "> **Not implemented.** The current application implements only pairwise",
        "> TF-IDF role-alignment scoring (cosine similarity to a role-skill profile),",
        "> not ranked retrieval from a candidate pool. MRR, nDCG@k, and Recall@k",
        "> cannot be computed without a ranked candidate set.",
        "> Schema: `ml/evaluation/schemas/job_matching_schema.json`",
        "",
        "---",
        "",
        "## Limitations & Next Steps",
        "",
        "1. **Human annotation required** — All parser/ATS/interview conclusions are based on",
        "   synthetic data. Real-world performance claims require human-reviewed, permissioned,",
        "   anonymised resumes.",
        "2. **Classifier split provenance** — The exact train/test rows are determined by the",
        "   CSV content and `random_state=42`. A hash of the CSV should be recorded in future",
        "   runs for full reproducibility.",
        "3. **Job matching** — Implement a ranked candidate set and collect reviewer-graded",
        "   resume/JD pairs to enable MRR and nDCG@k evaluation.",
        "4. **IAA expansion** — Current annotations have limited two-reviewer coverage.",
        "   Expanding to ≥30 dual-reviewed examples will enable Cohen's kappa calculation.",
        "5. **ATS calibration** — If representative, permissioned hiring outcome data",
        "   becomes available, calibration against outcomes could be explored — currently",
        "   it is explicitly NOT performed.",
        "6. **Classifier class imbalance** — BPO (22 examples) and AUTOMOBILE (36) are",
        "   underrepresented. Augment or upsample before next model iteration.",
        "",
        "---",
        "*This report was auto-generated by `ml/evaluation/scripts/run_all.py`.*",
        "*Do not commit raw resume text or personal data to the repository.*",
    ]

    with open(SUMMARY_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


if __name__ == "__main__":
    main()
