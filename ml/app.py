"""
FastAPI Local ML Service
=========================
Serves the resume parser and analyzer as a local REST API.

Endpoints:
    GET  /health          — Service health check
    POST /parse-resume    — Parse resume file into structured JSON
    POST /analyze-resume  — Full pipeline: parse + analyze + score

Security controls implemented:
    - File extension + MIME type validation (allow-list)
    - Maximum file size enforcement (server-side)
    - No stack traces in error responses
    - Sanitised error messages (no internal paths / filenames)
    - Restricted CORS origins (env-configurable; defaults to localhost only)
    - Resource limits: page count, text length

Usage:
    python -m uvicorn ml.app:app --host 127.0.0.1 --port 8000 --reload
"""

import logging
import os
import traceback

import joblib
from fastapi import FastAPI, File, Form, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .src.document_extractor import extract_text
from .src.resume_parser import parse_resume, flatten_skills
from .src.keyword_engine import suggest_keywords
from .src.ats_scorer import compute_ats_score, generate_quick_fixes
from .src.feature_engineering import compute_role_alignment

# ---------------------------------------------------------------------------
# Logging — never log resume text or PII
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
logger = logging.getLogger("ml_service")

# ---------------------------------------------------------------------------
# Configuration — via environment variables
# ---------------------------------------------------------------------------

# Max upload size: 10 MB (same limit as the frontend)
MAX_UPLOAD_BYTES: int = int(os.environ.get("ML_MAX_UPLOAD_BYTES", 10 * 1024 * 1024))

# Max extracted text length to prevent resource exhaustion
MAX_TEXT_LENGTH: int = int(os.environ.get("ML_MAX_TEXT_LENGTH", 200_000))

# Max pages to process from PDF
MAX_PDF_PAGES: int = int(os.environ.get("ML_MAX_PDF_PAGES", 50))

# Allowed CORS origins (comma-separated). Defaults to localhost only.
_cors_raw = os.environ.get(
    "ML_ALLOWED_ORIGINS",
    "http://localhost:8080,http://127.0.0.1:8080,http://localhost:3000",
)
ALLOWED_ORIGINS: list[str] = [o.strip() for o in _cors_raw.split(",") if o.strip()]

# Allowed file extensions and MIME types (allow-list; reject everything else)
ALLOWED_EXTENSIONS: frozenset[str] = frozenset({".pdf", ".docx", ".doc"})
ALLOWED_MIME_TYPES: frozenset[str] = frozenset({
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    # Browsers sometimes report these for DOCX/DOC
    "application/octet-stream",
    # multipart/form-data fields may have no content-type
    "",
})

# Max target_role length to prevent abuse
MAX_ROLE_LENGTH: int = 200

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(
    title="AI Career Copilot — ML Service",
    description="Local ML-powered resume parser and analyzer",
    version="1.0.0",
    # Disable docs in production via env (optional)
    docs_url=None if os.environ.get("ML_DISABLE_DOCS") else "/docs",
    redoc_url=None if os.environ.get("ML_DISABLE_DOCS") else "/redoc",
)

# CORS — explicitly allow only configured origins; no wildcard with credentials.
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,  # ML service does not use auth cookies
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Accept"],
)

# ---------------------------------------------------------------------------
# Global error handler — never expose stack traces or internal paths
# ---------------------------------------------------------------------------

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    # Log the full error server-side for debugging
    logger.error("Unhandled exception in %s: %s", request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred. Please try again."},
    )

# ---------------------------------------------------------------------------
# Load trained models (lazy, once)
# ---------------------------------------------------------------------------

MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
_tfidf = None
_classifier = None
_metadata = None


def _load_models() -> bool:
    global _tfidf, _classifier, _metadata
    if _tfidf is not None:
        return True

    tfidf_path = os.path.join(MODELS_DIR, "tfidf_vectorizer.joblib")
    clf_path = os.path.join(MODELS_DIR, "category_classifier.joblib")
    meta_path = os.path.join(MODELS_DIR, "training_metadata.joblib")

    if not os.path.exists(tfidf_path):
        logger.warning("Model artifacts not found at %s. Run ml/train.py first.", MODELS_DIR)
        return False

    try:
        _tfidf = joblib.load(tfidf_path)
        _classifier = joblib.load(clf_path)
        _metadata = joblib.load(meta_path)
        logger.info(
            "Models loaded. Accuracy: %.1f%%",
            (_metadata.get("test_accuracy", 0) * 100) if _metadata else 0,
        )
        return True
    except Exception as exc:
        # Log full error to the server log; don't surface it to callers.
        logger.error("Failed to load models: %s", exc)
        return False


# ---------------------------------------------------------------------------
# Validation helpers
# ---------------------------------------------------------------------------

def _validate_upload(file: UploadFile, file_bytes: bytes) -> None:
    """
    Layered validation: extension, MIME type, size.
    Raises HTTPException(400) for any invalid file.

    Note: browser-supplied content_type is untrusted.  Extension check +
    magic-byte check in the extractor provide the actual format enforcement.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")

    import os as _os
    ext = _os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Please upload a PDF, DOCX or DOC.",
        )

    # MIME type from browser — treat as a hint only, not a trust boundary.
    mime = (file.content_type or "").lower().split(";")[0].strip()
    if mime and mime not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail="File MIME type does not match an accepted document format.",
        )

    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file.")

    if len(file_bytes) > MAX_UPLOAD_BYTES:
        limit_mb = MAX_UPLOAD_BYTES // (1024 * 1024)
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds the {limit_mb} MB limit.",
        )


def _validate_role(target_role: str) -> str:
    """Sanitise and bound the target role string."""
    role = target_role.strip()[:MAX_ROLE_LENGTH]
    if not role:
        return "Software Engineer"
    return role


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
    try:
        file_bytes = await file.read()
        _validate_upload(file, file_bytes)

        raw_text = extract_text(file_bytes, file.filename or "upload")

        # Enforce text length limit
        if len(raw_text) > MAX_TEXT_LENGTH:
            raw_text = raw_text[:MAX_TEXT_LENGTH]

        parsed = parse_resume(raw_text)

        return {
            "success": True,
            "rawText": raw_text[:500],  # Preview only — no full text in response
            "parsed": parsed,
        }
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception:
        logger.error("parse_resume_endpoint failed", exc_info=True)
        raise HTTPException(status_code=500, detail="Resume parsing failed.")


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
    try:
        file_bytes = await file.read()
        _validate_upload(file, file_bytes)
        target_role = _validate_role(target_role)

        # Step 1: Extract text (extractor enforces format via extension + magic bytes)
        raw_text = extract_text(file_bytes, file.filename or "upload")

        # Enforce text length limit
        if len(raw_text) > MAX_TEXT_LENGTH:
            raw_text = raw_text[:MAX_TEXT_LENGTH]

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
                logger.warning("Category prediction failed", exc_info=True)

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

    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception:
        logger.error("analyze_resume_endpoint failed", exc_info=True)
        raise HTTPException(status_code=500, detail="Resume analysis failed.")
