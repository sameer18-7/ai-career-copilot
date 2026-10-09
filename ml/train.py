"""
Train — Resume Category Classifier
====================================
Trains a scikit-learn TF-IDF + LinearSVC model on the 2,484-resume dataset
for role/category classification.

The trained model provides:
  - Category prediction for incoming resumes
  - TF-IDF vocabulary used for role alignment scoring
  - Per-category term importance for keyword suggestions

Usage:
    python -m ml.train
    # or from project root:
    python ml/train.py

Outputs saved to ml/models/:
  - tfidf_vectorizer.joblib
  - category_classifier.joblib
  - training_metadata.joblib
"""

import os
import sys
import time

import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.svm import LinearSVC
from sklearn.pipeline import Pipeline

# Resolve project root
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(PROJECT_ROOT, "plan", "archive", "Resume", "Resume.csv")
MODELS_DIR = os.path.join(PROJECT_ROOT, "ml", "models")


def clean_resume_text(text: str) -> str:
    """Basic text cleaning for training."""
    if not isinstance(text, str):
        return ""
    # Remove extra whitespace
    text = " ".join(text.split())
    return text.strip()


def train():
    """Train the resume category classifier."""
    print("=" * 60)
    print("  AI Career Copilot — Resume Model Training")
    print("=" * 60)

    # ------------------------------------------------------------------
    # 1. Load dataset
    # ------------------------------------------------------------------
    print(f"\n[1/6] Loading dataset from {CSV_PATH}...")
    if not os.path.exists(CSV_PATH):
        print(f"ERROR: Dataset not found at {CSV_PATH}")
        sys.exit(1)

    df = pd.read_csv(CSV_PATH)
    print(f"  Loaded {len(df)} resumes across {df['Category'].nunique()} categories.")

    # ------------------------------------------------------------------
    # 2. Clean text
    # ------------------------------------------------------------------
    print("\n[2/6] Cleaning resume text...")
    df["clean_text"] = df["Resume_str"].apply(clean_resume_text)
    df = df[df["clean_text"].str.len() > 50]  # Drop very short entries
    print(f"  {len(df)} resumes after cleaning.")

    # ------------------------------------------------------------------
    # 3. Train/test split (stratified)
    # ------------------------------------------------------------------
    print("\n[3/6] Splitting data (80% train, 10% val, 10% test)...")
    X = df["clean_text"].values
    y = df["Category"].values

    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.5, random_state=42, stratify=y_temp
    )
    print(f"  Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")

    # ------------------------------------------------------------------
    # 4. Build TF-IDF vectorizer
    # ------------------------------------------------------------------
    print("\n[4/6] Building TF-IDF vectorizer...")
    tfidf = TfidfVectorizer(
        max_features=10000,
        ngram_range=(1, 2),
        sublinear_tf=True,
        stop_words="english",
        min_df=2,
        max_df=0.95,
    )

    t0 = time.time()
    X_train_tfidf = tfidf.fit_transform(X_train)
    print(f"  Vocabulary size: {len(tfidf.vocabulary_)}")
    print(f"  TF-IDF matrix: {X_train_tfidf.shape}")
    print(f"  Time: {time.time() - t0:.1f}s")

    # ------------------------------------------------------------------
    # 5. Train classifier
    # ------------------------------------------------------------------
    print("\n[5/6] Training LinearSVC classifier...")
    t0 = time.time()

    classifier = LinearSVC(
        C=1.0,
        max_iter=5000,
        class_weight="balanced",
        random_state=42,
    )
    classifier.fit(X_train_tfidf, y_train)
    print(f"  Training time: {time.time() - t0:.1f}s")

    # Evaluate on validation set
    X_val_tfidf = tfidf.transform(X_val)
    val_preds = classifier.predict(X_val_tfidf)
    val_acc = accuracy_score(y_val, val_preds)
    print(f"  Validation accuracy: {val_acc:.4f} ({val_acc * 100:.1f}%)")

    # Evaluate on test set
    X_test_tfidf = tfidf.transform(X_test)
    test_preds = classifier.predict(X_test_tfidf)
    test_acc = accuracy_score(y_test, test_preds)
    print(f"  Test accuracy: {test_acc:.4f} ({test_acc * 100:.1f}%)")

    print("\n  Classification Report (Test Set):")
    report = classification_report(y_test, test_preds)
    print(report)

    # ------------------------------------------------------------------
    # 6. Save models
    # ------------------------------------------------------------------
    print(f"\n[6/6] Saving models to {MODELS_DIR}/...")
    os.makedirs(MODELS_DIR, exist_ok=True)

    joblib.dump(tfidf, os.path.join(MODELS_DIR, "tfidf_vectorizer.joblib"))
    joblib.dump(classifier, os.path.join(MODELS_DIR, "category_classifier.joblib"))

    metadata = {
        "categories": list(sorted(set(y))),
        "num_train": len(X_train),
        "num_val": len(X_val),
        "num_test": len(X_test),
        "val_accuracy": float(val_acc),
        "test_accuracy": float(test_acc),
        "vocab_size": len(tfidf.vocabulary_),
        "max_features": 10000,
        "ngram_range": (1, 2),
    }
    joblib.dump(metadata, os.path.join(MODELS_DIR, "training_metadata.joblib"))

    print("\n  Saved:")
    print("    - tfidf_vectorizer.joblib")
    print("    - category_classifier.joblib")
    print("    - training_metadata.joblib")

    print("\n" + "=" * 60)
    print(f"  Training complete! Test accuracy: {test_acc * 100:.1f}%")
    print("=" * 60)


if __name__ == "__main__":
    train()
