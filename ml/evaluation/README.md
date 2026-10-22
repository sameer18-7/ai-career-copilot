# AI Career Copilot — Evaluation Framework (Phase 3)

Reproducible evaluation infrastructure for all AI Career Copilot ML
components: resume parsing, category classification, ATS/readiness scoring,
and interview-answer evaluation.

---

## Directory Layout

```
ml/evaluation/
├── README.md                 <- this file
├── config/
│   └── eval_config.json      <- harness settings (seeds, thresholds, k values)
├── schemas/                  <- JSON Schema definitions for annotation records
│   ├── parsing_schema.json
│   ├── classification_schema.json
│   ├── ats_scoring_schema.json
│   ├── job_matching_schema.json
│   └── interview_schema.json
├── annotations/              <- human-reviewed ground truth (kept out of git if PII)
│   ├── parser_annotations.jsonl        <- 30 synthetic resume annotations
│   ├── ats_annotations.jsonl           <- 20 synthetic ATS rubric ratings
│   └── interview_annotations.jsonl     <- 30 QA pairs with rubric scores
├── fixtures/                 <- synthetic resume texts for controlled testing
│   └── synthetic_resumes.jsonl
├── scripts/                  <- evaluation entry points
│   ├── evaluate_parser.py
│   ├── evaluate_classifier.py
│   ├── evaluate_ats.py
│   ├── evaluate_interviews.py
│   └── run_all.py
└── reports/                  <- generated outputs (gitignored if large / PII)
    ├── summary.md            <- human-readable summary (auto-generated)
    ├── metrics.json          <- machine-readable aggregated metrics
    ├── parser_metrics.csv
    ├── category_metrics.csv
    ├── confusion_matrix.csv
    ├── ats_agreement.csv
    ├── interview_metrics.csv
    └── error_analysis.csv
```

---

## Quick Start

```bash
# From the project root -- run all evaluations
python ml/evaluation/scripts/run_all.py

# Individual tasks
python ml/evaluation/scripts/evaluate_classifier.py
python ml/evaluation/scripts/evaluate_parser.py
python ml/evaluation/scripts/evaluate_ats.py
python ml/evaluation/scripts/evaluate_interviews.py
```

All scripts write their outputs to `ml/evaluation/reports/`.

---

## Implemented vs. Pending

| Component | Status | Notes |
|---|---|---|
| **Category classifier** | Evaluated | Reproducible test split from CSV; full metrics + confusion matrix |
| **Resume parser** | Evaluated | Synthetic fixtures; field-level P/R/F1 + error categories |
| **ATS scorer** | Evaluated | Synthetic rubric ratings; MAE, RMSE, Spearman |
| **Interview evaluator** | Evaluated | Synthetic QA pairs; agreement + error counts |
| **Job matching** | Schema only | Role-alignment score is pairwise; no ranked candidate set implemented |
| **Human annotation** | Pending | All current baselines use synthetic fixtures; conclusions are labelled accordingly |

---

## Data Provenance and Privacy

| Data | Source | PII? | Notes |
|---|---|---|---|
| `plan/archive/Resume/Resume.csv` | Kaggle "Resume Dataset" (public) | Low - anonymised public dataset | Used for classifier train/test only |
| `fixtures/synthetic_resumes.jsonl` | Synthetically authored | None | Controlled edge cases; cannot represent real-world distribution |
| `annotations/parser_annotations.jsonl` | Synthetically authored | None | 30 examples; covers structural diversity |
| `annotations/ats_annotations.jsonl` | Synthetically authored | None | 20 examples; simulated reviewer scores |
| `annotations/interview_annotations.jsonl` | Synthetically authored | None | 30 QA pairs; two simulated reviewer score series |

LIMITATION: No real human-reviewed annotations exist yet. All evaluation
conclusions for the parser, ATS scorer, and interview evaluator are limited
to performance on synthetic fixtures. Real-world performance validation
requires human annotators reviewing real (permissioned, anonymised) resumes.

---

## Dataset Splits

### Classifier (plan/archive/Resume/Resume.csv -- 2,484 total, 2,481 after dedup)

| Partition | Count | Method |
|---|---|---|
| Train | ~1986 | 80%; stratified, random_state=42 |
| Validation | ~248 | 10%; stratified |
| Test | ~249 | 10%; stratified; LOCKED |

Split is reproduced with the same seed from `train.py` and `evaluate.py`.
The test partition is never used for model training or weight tuning.

Known limitation: The model was trained then saved; only the CSV split
using random_state=42 guarantees separation. If the CSV is re-shuffled or
de-duplicated differently, the split will differ. The 2 near-duplicate resumes
are documented below.

Near-duplicates in dataset: 2 exact-text duplicates removed before split
to prevent leakage (handled in evaluate_classifier.py).

---

## Adding Human Annotations

1. Copy the relevant schema from `schemas/`.
2. Create a JSONL file in `annotations/` where each line is one annotation record.
3. All records must have a stable `example_id`, a `dataset_version`, and `status: "reviewed"`.
4. Run the relevant evaluation script; it will detect the annotation file and use it.

Do NOT include raw resume text or personal contact details in annotation files
that are committed to the repository.

---

## Reproducibility

All scripts:
- Pin RANDOM_SEED = 42 globally.
- Record their configuration in `metrics.json` alongside metric results.
- Record the Python version, spaCy model version, and scikit-learn version.
- Exit with a non-zero code and print a clear error if required data or model files are absent.
- Never silently skip a sub-evaluation and report overall success.
