"""
evaluate_classifier.py
======================
Evaluates the TF-IDF + LinearSVC resume-category classifier on the
LOCKED test split (10% stratified, random_state=42) from the Kaggle
Resume dataset.

Outputs:
  ml/evaluation/reports/category_metrics.csv
  ml/evaluation/reports/confusion_matrix.csv
  ml/evaluation/reports/metrics.json  (classifier section)

IMPORTANT: This script NEVER retrains the model.
           Test partition is LOCKED; it is NOT used for tuning.
           Near-duplicate resumes (2) are removed before splitting.

Usage (from project root):
    python ml/evaluation/scripts/evaluate_classifier.py
"""

import json
import os
import sys
import csv
import platform
from datetime import datetime, timezone

# ---------------------------------------------------------------------------
# Path setup
# ---------------------------------------------------------------------------

SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "..", ".."))
sys.path.insert(0, PROJECT_ROOT)

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
)
from sklearn.model_selection import train_test_split

RANDOM_SEED = 42

CSV_PATH    = os.path.join(PROJECT_ROOT, "plan", "archive", "Resume", "Resume.csv")
MODELS_DIR  = os.path.join(PROJECT_ROOT, "ml", "models")
REPORTS_DIR = os.path.join(PROJECT_ROOT, "ml", "evaluation", "reports")
CONFIG_PATH = os.path.join(PROJECT_ROOT, "ml", "evaluation", "config", "eval_config.json")

os.makedirs(REPORTS_DIR, exist_ok=True)


def _load_config() -> dict:
    with open(CONFIG_PATH, encoding="utf-8") as f:
        return json.load(f)


def _require(path: str, label: str) -> None:
    if not os.path.exists(path):
        print(f"\n[ERROR] Required file not found: {path}")
        print(f"        ({label})")
        sys.exit(1)


def _get_env_info() -> dict:
    try:
        import sklearn
        sklearn_version = sklearn.__version__
    except Exception:
        sklearn_version = "unknown"
    return {
        "python_version": platform.python_version(),
        "sklearn_version": sklearn_version,
        "platform": platform.system(),
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
        "random_seed": RANDOM_SEED,
    }


def run() -> dict:
    cfg = _load_config()["classifier"]

    print("=" * 60)
    print("  AI Career Copilot — Category Classifier Evaluation")
    print("=" * 60)

    # ------------------------------------------------------------------
    # 1. Verify model artifacts exist
    # ------------------------------------------------------------------
    tfidf_path = os.path.join(MODELS_DIR, "tfidf_vectorizer.joblib")
    clf_path   = os.path.join(MODELS_DIR, "category_classifier.joblib")
    meta_path  = os.path.join(MODELS_DIR, "training_metadata.joblib")

    _require(tfidf_path, "TF-IDF vectorizer")
    _require(clf_path,   "LinearSVC classifier")
    _require(meta_path,  "training_metadata")
    _require(CSV_PATH,   "Resume dataset CSV")

    tfidf      = joblib.load(tfidf_path)
    classifier = joblib.load(clf_path)
    metadata   = joblib.load(meta_path)

    print(f"\n[1/5] Loaded model artifacts.")
    print(f"      Saved categories: {len(metadata['categories'])}")
    print(f"      Vocab size:       {metadata['vocab_size']:,}")

    # ------------------------------------------------------------------
    # 2. Load and prepare dataset (identical pipeline to train.py)
    # ------------------------------------------------------------------
    print(f"\n[2/5] Loading dataset: {CSV_PATH}")
    df = pd.read_csv(CSV_PATH)
    df["clean_text"] = df["Resume_str"].apply(lambda t: " ".join(str(t).split()))
    df = df[df["clean_text"].str.len() > cfg["min_text_length"]].copy()

    # Deduplication: remove exact-text duplicates to prevent split leakage
    before_dedup = len(df)
    df = df.drop_duplicates(subset=[cfg["dedup_column"]])
    removed_dups = before_dedup - len(df)
    print(f"      Loaded {before_dedup} resumes; removed {removed_dups} exact duplicates.")
    print(f"      Unique resumes: {len(df)}")

    X = df["clean_text"].values
    y = df["Category"].values

    # ------------------------------------------------------------------
    # 3. Reproduce the EXACT locked test split (same seed as train.py)
    # ------------------------------------------------------------------
    print(f"\n[3/5] Reproducing locked test split (stratified, seed={RANDOM_SEED}).")
    X_trainval, X_temp, y_trainval, y_temp = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_SEED, stratify=y
    )
    _, X_test, _, y_test = train_test_split(
        X_temp, y_temp, test_size=0.5, random_state=RANDOM_SEED, stratify=y_temp
    )
    print(f"      Test set: {len(X_test)} resumes")

    # ------------------------------------------------------------------
    # 4. Build baseline (most-frequent class)
    # ------------------------------------------------------------------
    from collections import Counter
    most_frequent_class = Counter(y_trainval).most_common(1)[0][0]
    baseline_preds = [most_frequent_class] * len(y_test)
    baseline_acc   = accuracy_score(y_test, baseline_preds)
    baseline_macro_f1 = f1_score(y_test, baseline_preds, average="macro", zero_division=0)

    print(f"\n[4/5] Baseline (most-frequent='{most_frequent_class}'):")
    print(f"      Baseline accuracy: {baseline_acc:.4f}")
    print(f"      Baseline macro-F1: {baseline_macro_f1:.4f}")

    # ------------------------------------------------------------------
    # 5. Evaluate existing model
    # ------------------------------------------------------------------
    print(f"\n[5/5] Evaluating classifier on test set...")
    X_test_tfidf = tfidf.transform(X_test)
    predictions  = classifier.predict(X_test_tfidf)

    acc           = accuracy_score(y_test, predictions)
    macro_f1      = f1_score(y_test, predictions, average="macro", zero_division=0)
    weighted_f1   = f1_score(y_test, predictions, average="weighted", zero_division=0)

    categories = sorted(set(y))
    report_dict = classification_report(
        y_test, predictions, labels=categories, output_dict=True, zero_division=0
    )

    print(f"\n  Test Accuracy:   {acc:.4f} ({acc*100:.1f}%)")
    print(f"  Macro F1:        {macro_f1:.4f}")
    print(f"  Weighted F1:     {weighted_f1:.4f}")
    print(f"\n  Classification Report:")
    print(classification_report(y_test, predictions, labels=categories, zero_division=0))

    # Confusion matrix
    cm = confusion_matrix(y_test, predictions, labels=categories)

    # Top misclassifications
    misclass = []
    for i, true_cat in enumerate(categories):
        for j, pred_cat in enumerate(categories):
            if i != j and cm[i][j] > 0:
                misclass.append((true_cat, pred_cat, int(cm[i][j])))
    misclass.sort(key=lambda x: x[2], reverse=True)
    print(f"\n  Top 5 misclassified pairs:")
    for true_cat, pred_cat, count in misclass[:5]:
        print(f"    {true_cat} -> {pred_cat}: {count}")

    # ------------------------------------------------------------------
    # 6. Write reports
    # ------------------------------------------------------------------
    # Per-class metrics CSV
    per_class_rows = []
    for cat in categories:
        r = report_dict.get(cat, {})
        per_class_rows.append({
            "category":  cat,
            "precision": round(r.get("precision", 0), 4),
            "recall":    round(r.get("recall", 0), 4),
            "f1_score":  round(r.get("f1-score", 0), 4),
            "support":   int(r.get("support", 0)),
        })
    csv_path = os.path.join(REPORTS_DIR, "category_metrics.csv")
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["category","precision","recall","f1_score","support"])
        writer.writeheader()
        writer.writerows(per_class_rows)
    print(f"\n  Written: {csv_path}")

    # Confusion matrix CSV
    cm_path = os.path.join(REPORTS_DIR, "confusion_matrix.csv")
    with open(cm_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["true\\pred"] + categories)
        for i, cat in enumerate(categories):
            writer.writerow([cat] + [int(v) for v in cm[i]])
    print(f"  Written: {cm_path}")

    result = {
        "task": "category_classifier",
        "dataset": {
            "path": CSV_PATH,
            "total_rows": before_dedup,
            "duplicates_removed": removed_dups,
            "unique_resumes": int(len(df)),
            "test_set_size": int(len(X_test)),
            "num_categories": len(categories),
            "split_method": "stratified 80/10/10",
            "split_seed": RANDOM_SEED,
            "leakage_note": "2 exact-text duplicates removed before split.",
            "known_limitation": "The current model was trained with the same seed. The CSV-based split guarantees separation only if the CSV content is identical to what was used during training.py. If the source CSV was updated, model version and evaluation data may not correspond.",
        },
        "baseline": {
            "strategy": cfg["baseline_strategy"],
            "most_frequent_class": most_frequent_class,
            "accuracy": round(float(baseline_acc), 4),
            "macro_f1": round(float(baseline_macro_f1), 4),
        },
        "metrics": {
            "accuracy":    round(float(acc), 4),
            "macro_f1":    round(float(macro_f1), 4),
            "weighted_f1": round(float(weighted_f1), 4),
        },
        "class_imbalance_note": "Classes range from 22 (BPO) to 120 (IT, BD). Macro-F1 is preferred over accuracy.",
        "top_misclassifications": [
            {"true": t, "pred": p, "count": c} for t, p, c in misclass[:10]
        ],
        "env": _get_env_info(),
    }
    return result


if __name__ == "__main__":
    result = run()
    # Write/merge into metrics.json
    metrics_path = os.path.join(REPORTS_DIR, "metrics.json")
    existing = {}
    if os.path.exists(metrics_path):
        with open(metrics_path, encoding="utf-8") as f:
            existing = json.load(f)
    existing["classifier"] = result
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(existing, f, indent=2)
    print(f"\n  Written: {metrics_path}")
    print("\n" + "=" * 60)
    print(f"  Classifier evaluation complete.")
    print(f"  Accuracy:   {result['metrics']['accuracy']:.4f}")
    print(f"  Macro-F1:   {result['metrics']['macro_f1']:.4f}")
    print(f"  Weighted-F1:{result['metrics']['weighted_f1']:.4f}")
    print("=" * 60)
