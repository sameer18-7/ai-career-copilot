# AI Career Copilot — Phase 3 Evaluation Summary

> **Generated:** 2026-10-22T19:30:24.520195+00:00
> **Project:** AI Career Copilot

> [!WARNING]
> Parser, ATS, and Interview metrics are measured on **SYNTHETIC fixtures only**.
> These results do NOT validate real-world performance. Human annotation of
> real (permissioned, anonymised) resumes is required for real-world claims.

---

## Evaluation Status

| Component | Status | Data Source |
|---|---|---|
| Category Classifier | PASSED | Kaggle Resume CSV (real, public) |
| Resume Parser | PASSED | Synthetic fixtures (30 examples) |
| ATS Scorer | PASSED | Synthetic annotations (20 examples) |
| Interview Evaluator | PASSED | Synthetic QA pairs (30 examples) |
| Job Matching | SKIPPED | Not yet implemented (schema only) |

---

## 1. Category Classifier

**Dataset:** Kaggle Resume Dataset — 2481 unique resumes, 24 categories
**Split:** 80/10/10 stratified, seed=42, locked test partition
**Near-duplicates removed:** 2

| Metric | System | Baseline (most-frequent) |
|---|---|---|
| Accuracy | **0.7349** (73.5%) | 0.0482 |
| Macro-F1 | **0.6949** | 0.0038 |
| Weighted-F1 | **0.7238** | — |

**Top misclassifications:**
- ARTS → TEACHER: 3
- SALES → BUSINESS-DEVELOPMENT: 3
- AGRICULTURE → ENGINEERING: 2
- BANKING → PUBLIC-RELATIONS: 2
- CONSULTANT → BUSINESS-DEVELOPMENT: 2

**Class imbalance:** BPO (22) to IT/BD (120). Macro-F1 is the primary metric.

> [!NOTE]
> The model was trained with the same `random_state=42` split. The CSV-based
> split guarantees partition separation only if the source CSV is identical
> to the one used during training. If the CSV has been updated, model version
> and evaluation data may not correspond exactly.

---

## 2. Resume Parser

**Data:** 30 synthetic fixtures — diverse formats, dates, alias skills, domains, edge cases.

| Field | Precision | Recall | F1 | Support |
|---|---|---|---|---|
| name | 0.6400 | 1.0000 | 0.7805 | 16 |
| email | 1.0000 | 1.0000 | 1.0000 | 27 |
| phone | 1.0000 | 1.0000 | 1.0000 | 7 |
| linkedin | 1.0000 | 1.0000 | 1.0000 | 6 |
| github | 1.0000 | 1.0000 | 1.0000 | 3 |
| portfolio | 1.0000 | 1.0000 | 1.0000 | 1 |
| skill_extraction | 0.5864 | 0.9847 | 0.7350 | 131 |
| section_detection | 1.0000 | 1.0000 | 1.0000 | 95 |

**Years-of-experience MAE:** 0.0 years
**Total extraction errors:** 18

**Error type breakdown:**
- `wrong_value`: 3
- `false_positive`: 9
- `false_positive_should_not_appear`: 4
- `missed_entity`: 2

> [!IMPORTANT]
> All parser metrics apply to **synthetic fixtures only**. Synthetic examples
> cover controlled edge cases but are not representative of the full
> distribution of real-world resumes.

---

## 3. ATS / Readiness Scorer

**Data:** 20 synthetic reviewer rubric ratings (0–10 per dimension → scaled to 0–100)

> [!CAUTION]
> The ATS score is a **deterministic rubric estimate** — NOT a probability of being
> hired, NOT an official employer ATS score. The scorer is never calibrated against
> hiring outcomes. 'Agreement with reviewer' means agreement with a simulated
> document-quality rating, not employment success prediction.

| Metric | Value |
|---|---|
| MAE (system vs reviewer, 0–100 scale) | 24.5 |
| RMSE | 28.75 |
| Spearman correlation | 0.7684 |

**Score-band agreement:**
- 0-29: 3/5 = 60%
- 30-59: 1/11 = 9%
- 60-79: 1/4 = 25%
- 80-100: 0/0 = 0%

**Inter-Annotator Agreement:** 1 pairs, MAE = 0.0 (0–10 scale)

---

## 4. Interview Evaluator

**Implementation:** Local rule-based — keyword regex + STAR pattern detection + depth signals.
**NOT** Ollama, LLM, or cloud API. Pronunciation/accent NOT assessed.

| Metric | Value |
|---|---|
| MAE (system vs reviewer, 0–100) | N/A |
| RMSE | N/A |
| Spearman correlation | N/A |

**Per question-type breakdown:**

**Error categories:**
- System HIGH (≥70) / Reviewer LOW (<40): 0
- System LOW (<40) / Reviewer HIGH (≥70): 0

---

## 5. Job Matching

> [!WARNING]
> **Not implemented.** The current application implements only pairwise
> TF-IDF role-alignment scoring (cosine similarity to a role-skill profile),
> not ranked retrieval from a candidate pool. MRR, nDCG@k, and Recall@k
> cannot be computed without a ranked candidate set.
> Schema: `ml/evaluation/schemas/job_matching_schema.json`

---

## Limitations & Next Steps

1. **Human annotation required** — All parser/ATS/interview conclusions are based on
   synthetic data. Real-world performance claims require human-reviewed, permissioned,
   anonymised resumes.
2. **Classifier split provenance** — The exact train/test rows are determined by the
   CSV content and `random_state=42`. A hash of the CSV should be recorded in future
   runs for full reproducibility.
3. **Job matching** — Implement a ranked candidate set and collect reviewer-graded
   resume/JD pairs to enable MRR and nDCG@k evaluation.
4. **IAA expansion** — Current annotations have limited two-reviewer coverage.
   Expanding to ≥30 dual-reviewed examples will enable Cohen's kappa calculation.
5. **ATS calibration** — If representative, permissioned hiring outcome data
   becomes available, calibration against outcomes could be explored — currently
   it is explicitly NOT performed.
6. **Classifier class imbalance** — BPO (22 examples) and AUTOMOBILE (36) are
   underrepresented. Augment or upsample before next model iteration.

---
*This report was auto-generated by `ml/evaluation/scripts/run_all.py`.*
*Do not commit raw resume text or personal data to the repository.*