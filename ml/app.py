"""
FastAPI Local ML Service
=========================
Serves the resume parser and analyzer as a local REST API.

Endpoints:
    GET  /health          — Service health check
    POST /parse-resume    — Parse resume file into structured JSON
    POST /analyze-resume  — Full pipeline: parse + analyze + score

Usage:
    python -m uvicorn ml.app:app --host 0.0.0.0 --port 8000 --reload
"""

import os
import traceback

import joblib
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .src.document_extractor import extract_text
from .src.resume_parser import parse_resume, flatten_skills
from .src.keyword_engine import suggest_keywords
from .src.ats_scorer import compute_ats_score, generate_quick_fixes
from .src.feature_engineering import compute_role_alignment

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(
    title="AI Career Copilot — ML Service",
    description="Local ML-powered resume parser and analyzer",
    version="1.0.0",
)

# CORS — allow the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://127.0.0.1:8080", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Load trained models (lazy)
# ---------------------------------------------------------------------------

MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
_tfidf = None
_classifier = None
_metadata = None


def _load_models():
    global _tfidf, _classifier, _metadata
    if _tfidf is not None:
        return True

    tfidf_path = os.path.join(MODELS_DIR, "tfidf_vectorizer.joblib")
    clf_path = os.path.join(MODELS_DIR, "category_classifier.joblib")
    meta_path = os.path.join(MODELS_DIR, "training_metadata.joblib")

    if not os.path.exists(tfidf_path):
        return False

    try:
        _tfidf = joblib.load(tfidf_path)
        _classifier = joblib.load(clf_path)
        _metadata = joblib.load(meta_path)
        return True
    except Exception as e:
        print(f"[ML Service] Error loading models: {e}")
        return False


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/health")
async def health():
    models_loaded = _load_models()
    return {
        "status": "ok",
        "modelLoaded": models_loaded,
        "categories": _metadata.get("categories", []) if _metadata else [],
        "testAccuracy": _metadata.get("test_accuracy", 0) if _metadata else 0,
    }


# ---------------------------------------------------------------------------
# Parse resume
# ---------------------------------------------------------------------------

@app.post("/parse-resume")
async def parse_resume_endpoint(file: UploadFile = File(...)):
    """Parse a resume file and return structured JSON."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided.")

    try:
        file_bytes = await file.read()
        if len(file_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty file.")

        raw_text = extract_text(file_bytes, file.filename)
        parsed = parse_resume(raw_text)

        return {
            "success": True,
            "rawText": raw_text[:500],  # Preview only
            "parsed": parsed,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Parsing failed: {str(e)}")


# ---------------------------------------------------------------------------
# Full analysis
# ---------------------------------------------------------------------------

@app.post("/analyze-resume")
async def analyze_resume_endpoint(
    file: UploadFile = File(...),
    target_role: str = Form("Software Engineer"),
):
    """
    Full resume analysis pipeline:
      1. Extract text from document
      2. Parse into structured data
      3. Compute ATS score with sub-scores
      4. Generate suggested keywords
      5. Generate quick fixes
      6. Predict resume category
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided.")

    try:
        file_bytes = await file.read()
        if len(file_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty file.")

        # Step 1: Extract text
        raw_text = extract_text(file_bytes, file.filename)

        # Step 2: Parse resume
        parsed = parse_resume(raw_text)

        # Step 3: ATS score
        ats_result = compute_ats_score(parsed, raw_text, target_role)

        # Step 4: Suggested keywords
        keywords = suggest_keywords(parsed, target_role, raw_text, max_keywords=8)

        # Step 5: Quick fixes
        fixes = generate_quick_fixes(parsed, raw_text, target_role, max_fixes=6)

        # Step 6: Category prediction (if model loaded)
        predicted_category = None
        _load_models()
        if _tfidf is not None and _classifier is not None:
            try:
                vec = _tfidf.transform([raw_text])
                predicted_category = _classifier.predict(vec)[0]
            except Exception:
                pass

        # Step 7: Role alignment score
        role_alignment = compute_role_alignment(raw_text, target_role, _tfidf)

        # Build skills flat list
        skills_dict = parsed.get("skills", {})
        if isinstance(skills_dict, dict):
            flat_skills = flatten_skills(skills_dict)
        else:
            flat_skills = skills_dict if isinstance(skills_dict, list) else []

        # Build response matching frontend ResumeAnalysisData shape
        candidate = parsed.get("candidate", {})
        education = parsed.get("education", [])
        experience = parsed.get("experience", [])
        projects = parsed.get("projects", [])
        certifications = parsed.get("certifications", [])

        return {
            "success": True,
            "candidate": {
                "name": candidate.get("name", ""),
                "email": candidate.get("email", ""),
                "phone": candidate.get("phone", ""),
                "location": candidate.get("location", ""),
                "linkedin": candidate.get("linkedin", ""),
                "github": candidate.get("github", ""),
            },
            "targetRole": target_role,
            "atsScore": ats_result["atsScore"],
            "atsSubScores": ats_result["atsSubScores"],
            "skills": flat_skills,
            "education": [
                {
                    "degree": e.get("degree", ""),
                    "institution": e.get("institution", ""),
                    "year": e.get("year", ""),
                }
                for e in education
            ],
            "experience": [
                {
                    "title": e.get("title", ""),
                    "company": e.get("company", ""),
                    "duration": e.get("duration", ""),
                    "description": e.get("description", ""),
                }
                for e in experience
            ],
            "projects": [
                {
                    "name": p.get("name", ""),
                    "description": p.get("description", ""),
                    "technologies": p.get("technologies", []),
                }
                for p in projects
            ],
            "certifications": [
                {
                    "name": c.get("name", ""),
                    "issuer": c.get("issuer", ""),
                    "year": c.get("date", ""),
                }
                for c in certifications
            ],
            "suggestedKeywords": keywords,
            "quickFixes": fixes,
            "predictedCategory": predicted_category,
            "roleAlignment": round(role_alignment * 100, 1),
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
