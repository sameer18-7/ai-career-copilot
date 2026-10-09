"""
Evaluate — Model Evaluation
============================
Evaluates the trained category classifier on the test set
and prints detailed metrics.

Usage:
    python -m ml.evaluate
    # or from project root:
    python ml/evaluate.py
"""

import os
import sys

import joblib
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
)
from sklearn.model_selection import train_test_split

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(PROJECT_ROOT, "plan", "archive", "Resume", "Resume.csv")
MODELS_DIR = os.path.join(PROJECT_ROOT, "ml", "models")


def evaluate():
    print("=" * 60)
    print("  AI Career Copilot — Model Evaluation")
    print("=" * 60)

    # Load models
    tfidf_path = os.path.join(MODELS_DIR, "tfidf_vectorizer.joblib")
    clf_path = os.path.join(MODELS_DIR, "category_classifier.joblib")
    meta_path = os.path.join(MODELS_DIR, "training_metadata.joblib")

    for path in [tfidf_path, clf_path, meta_path]:
        if not os.path.exists(path):
            print(f"ERROR: Model file not found: {path}")
            print("Run 'python ml/train.py' first.")
            sys.exit(1)

    tfidf = joblib.load(tfidf_path)
    classifier = joblib.load(clf_path)
    metadata = joblib.load(meta_path)

    print(f"\nTraining metadata:")
    print(f"  Categories: {len(metadata['categories'])}")
    print(f"  Train size: {metadata['num_train']}")
    print(f"  Val accuracy: {metadata['val_accuracy']:.4f}")
    print(f"  Test accuracy: {metadata['test_accuracy']:.4f}")

    # Reproduce test split
    print(f"\nLoading dataset...")
    df = pd.read_csv(CSV_PATH)
    df["clean_text"] = df["Resume_str"].apply(lambda t: " ".join(str(t).split()))
    df = df[df["clean_text"].str.len() > 50]

    X = df["clean_text"].values
    y = df["Category"].values

    _, X_temp, _, y_temp = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    _, X_test, _, y_test = train_test_split(
        X_temp, y_temp, test_size=0.5, random_state=42, stratify=y_temp
    )

    print(f"  Test set: {len(X_test)} resumes")

    # Predict
    X_test_tfidf = tfidf.transform(X_test)
    predictions = classifier.predict(X_test_tfidf)

    # Metrics
    acc = accuracy_score(y_test, predictions)
    print(f"\n  Test Accuracy: {acc:.4f} ({acc * 100:.1f}%)")

    print("\n  Classification Report:")
    print(classification_report(y_test, predictions))

    # Confusion matrix summary (top misclassifications)
    cm = confusion_matrix(y_test, predictions, labels=metadata["categories"])
    print("  Top 5 misclassified pairs:")
    categories = metadata["categories"]
    misclass = []
    for i in range(len(categories)):
        for j in range(len(categories)):
            if i != j and cm[i][j] > 0:
                misclass.append((categories[i], categories[j], cm[i][j]))
    misclass.sort(key=lambda x: x[2], reverse=True)
    for true_cat, pred_cat, count in misclass[:5]:
        print(f"    {true_cat} -> {pred_cat}: {count}")

    print("\n" + "=" * 60)


if __name__ == "__main__":
    evaluate()
