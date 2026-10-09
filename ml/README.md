# AI Career Copilot — Local ML Service

This directory contains the completely local, self-contained ML pipeline for the AI Career Copilot. No external APIs (like OpenAI, Gemini, etc.) are used.

## Architecture

* **Text Extraction**: Uses `PyMuPDF` for PDFs and `python-docx` for DOCX files.
* **NLP Parsing**: Uses `spaCy` (`en_core_web_sm`) and regex for structured extraction (skills, experience, education, etc.).
* **Feature Engineering**: Calculates TF-IDF vectors, cosine similarity for role alignment, and resume quality metrics (skill density, action verbs, etc.).
* **Category Prediction**: A scikit-learn `LinearSVC` model trained on 2,484 resumes classifies resumes into 24 distinct job categories.
* **API Service**: A `FastAPI` service wrapper that provides endpoints for the frontend.

## Setup

1. Make sure you have Python 3.13 installed.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   python -m spacy download en_core_web_sm
   ```

## Training the Model

Before running the service, you must train the category prediction model on the dataset:

```bash
python ml/train.py
```

This will read the dataset from `../plan/archive/Resume/Resume.csv` and generate model artifacts in the `ml/models/` directory.

To evaluate the model's accuracy on the test set:
```bash
python ml/evaluate.py
```

## Running the API Service

Start the local FastAPI service on port 8000:
```bash
python -m uvicorn ml.app:app --host 0.0.0.0 --port 8000 --reload
```

## Endpoints

* `GET /health` — Check if the service is running and models are loaded.
* `POST /parse-resume` — Upload a file and get the structured JSON (extract only).
* `POST /analyze-resume` — Upload a file + target role, get full ATS score, keywords, quick fixes, and parsed data.
