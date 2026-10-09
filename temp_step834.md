<USER_REQUEST>
# AI CAREER COPILOT — LOCAL ML RESUME PARSER & ANALYZER

You are working on my existing **AI Career Copilot** website.

I want you to modify the existing Resume Analyzer and build a real **local ML/NLP-powered Resume Parser and Resume Analyzer**.

I have provided screenshots of the current Resume Analyzer UI. Use those screenshots as the visual reference.

## CRITICAL REQUIREMENTS

**Do not rebuild the website from scratch.**

Preserve the existing:

* Design
* Layout
* Sidebar
* Navigation
* Colors
* Typography
* Buttons
* Cards
* Spacing
* Animations
* Responsive behavior
* Existing functionality

Only make the changes required for this task.

---

# 1. NO EXTERNAL AI API

This is a strict requirement.

We are building **our own local ML/NLP system**.

DO NOT use:

* OpenAI API
* Gemini API
* Claude API
* OpenRouter
* Any paid AI API
* Any cloud inference API
* Any external hosted AI inference service
* Any API key for resume parsing or resume analysis

The model must run locally on my computer.

---

# 2. REQUIRED TECHNOLOGY STACK

Use the following stack unless inspection of the existing project reveals a strong technical reason to change something.

## Primary ML Framework

### scikit-learn

Use **scikit-learn as the primary machine-learning framework**.

It should be used for appropriate tasks such as:

* Resume-to-role similarity
* Keyword relevance
* Keyword ranking
* Role classification
* Resume quality prediction
* ATS scoring
* Resume weakness classification
* Feature-based resume evaluation

Potential techniques include:

* TF-IDF
* Cosine similarity
* Logistic Regression
* Linear SVM
* Random Forest
* Gradient Boosting
* Multi-label classification

Do not use every algorithm unnecessarily.

Select the appropriate approach based on the dataset and task.

---

## NLP

Use **spaCy** for local NLP processing.

Use it for:

* Tokenization
* Sentence segmentation
* Named entity recognition where useful
* Section detection
* Skill extraction
* Entity extraction
* Date extraction
* Text normalization
* Resume structure detection

---

## Document Extraction

Use:

### PyMuPDF

for PDF text extraction.

### python-docx

for DOCX extraction.

Support:

* PDF
* DOCX
* DOC where practical

If legacy `.doc` files require a different local extraction method, implement a reasonable local fallback.

---

## Data Processing

Use:

* pandas
* NumPy

for:

* Dataset processing
* Cleaning
* Feature engineering
* Training
* Evaluation
* Data transformation

---

## Model Persistence

Use:

* joblib

or an appropriate local format to save trained scikit-learn models.

Do NOT retrain the model every time a user uploads a resume.

---

## Local ML Service

If the existing architecture allows it, create a separate Python ML service using:

### FastAPI

Example:

```text
Existing Website
       ↓
Existing Backend
       ↓
Local FastAPI ML Service
       ↓
scikit-learn + spaCy
       ↓
Resume Analysis
```

Possible endpoints:

```text
GET  /health
POST /parse-resume
POST /analyze-resume
```

The exact implementation should be adapted to the existing project.

---

# 3. NO TENSORFLOW INITIALLY

Do NOT use TensorFlow.

Do NOT introduce PyTorch initially either unless inspection/evaluation demonstrates that scikit-learn + spaCy is insufficient.

Keep the architecture modular so a local PyTorch/transformer model can be added later if we need better semantic understanding.

For version 1, use:

```text
scikit-learn
+
spaCy
+
PyMuPDF
+
python-docx
+
pandas
+
NumPy
+
joblib
+
FastAPI
```

---

# 4. FIRST — INSPECT THE EXISTING CODEBASE

Before making changes, inspect the entire repository.

Identify:

* Frontend framework
* Backend framework
* Database
* Authentication
* Resume upload implementation
* Resume Analyzer page
* Existing ATS score implementation
* Existing Missing Keywords implementation
* Existing Target Role implementation
* Existing Extracted Information implementation
* Existing Quick Fixes implementation
* Existing API routes
* Existing ML/model code
* Existing Python code
* Existing datasets
* Existing dependencies
* Existing environment variables
* Existing resume parser
* Existing analysis logic

Do not assume anything.

If something already exists, reuse it rather than duplicating it.

First understand the architecture, then implement.

---

# 5. CURRENT UI

The current Resume Analyzer approximately looks like:

```text
Resume Analyzer

Upload your resume to get an instant AI-powered breakdown.

┌─────────────────────────────────────────────┐
│ 📄 Resume.docx                              │
│                                             │
│ [Analyze Resume] [Change File]              │
└─────────────────────────────────────────────┘
```

After analysis:

```text
┌──────────────────────┐  ┌───────────────────┐
│ ATS Score            │  │ Missing Keywords  │
│                      │  │                   │
│ 87/100               │  │ + Docker          │
│                      │  │ + CI/CD           │
└──────────────────────┘  └───────────────────┘

┌──────────────────────┐  ┌───────────────────┐
│ Extracted Information│  │ Quick Fixes        │
│                      │  │                   │
│ Skills               │  │ □ Add summary     │
│ Education            │  │ □ Add metrics     │
│ Experience           │  │ □ Add Docker      │
└──────────────────────┘  └───────────────────┘
```

Modify this flow as described below.

---

# 6. NEW USER FLOW

The new flow must be:

```text
User opens Resume Analyzer
        ↓
No resume
        ↓
Upload resume
        ↓
Resume selected
        ↓
Ask:
"Which role are you looking for?"
        ↓
User enters role
        ↓
Submit
        ↓
Show:
Analyze Resume + Change File
        ↓
User clicks Analyze Resume
        ↓
Extract resume text
        ↓
Parse resume locally
        ↓
Generate structured resume data
        ↓
Run local ML/NLP analysis
        ↓
Generate:
ATS Score
Suggested Keywords
Quick Fixes
Role Alignment
        ↓
Display results
```

---

# 7. RESUME UPLOAD

Keep the existing upload design.

The user must be able to upload a resume from their local computer.

Supported formats:

```text
PDF
DOCX
DOC
```

Validate:

* File extension
* MIME type
* File size
* File readability

Handle errors gracefully.

---

# 8. GOOGLE DRIVE

If Google Drive upload already exists or can be integrated cleanly, preserve/support it.

The user should be able to choose:

```text
Upload from Device
Choose from Google Drive
```

Both sources must feed into the same processing pipeline.

However:

**Do not use Google Drive as an excuse to introduce an external AI API.**

Google Drive is only a file source.

If Google Drive OAuth credentials are not configured, do not fake it.

Build the integration structure and clearly document the required Google configuration.

---

# 9. AFTER RESUME UPLOAD — ASK FOR ROLE

Immediately after the resume is successfully selected, display:

# "Which role are you looking for?"

This is the most important UI change.

It should appear before the Analyze Resume button.

Example:

```text
Resume Analyzer

Upload your resume to get an instant AI-powered breakdown.

┌──────────────────────────────────────────────┐
│ 📄 AI_Career_Copilot_Resume.docx             │
│ 102.9 KB                                     │
│                                              │
│ Which role are you looking for?              │
│                                              │
│ [ Backend Developer                         ]│
│                                              │
│                    [Submit]                  │
└──────────────────────────────────────────────┘
```

Use the existing card/design style.

Do not create a completely new page.

---

# 10. TARGET ROLE INPUT

Allow the user to enter any role.

Examples:

```text
Software Engineer
Backend Developer
Frontend Developer
Data Scientist
Machine Learning Engineer
Cloud Engineer
DevOps Engineer
Data Analyst
Product Manager
```

These should only be suggestions.

The user must be able to enter:

```text
Any custom job role
```

Do not restrict the user to a fixed list.

---

# 11. SUBMIT BEHAVIOR

Before Submit:

```text
Which role are you looking for?

[ Backend Developer ]

[Submit]
```

Do NOT show:

```text
Analyze Resume
Change File
```

After Submit:

```text
Target Role: Backend Developer

[Analyze Resume] [Change File]
```

The selected role must be stored in application state.

It must be passed to the backend and ultimately to the local ML pipeline.

---

# 12. ROLE MUST CONTROL THE ANALYSIS

The selected target role is a fundamental model input.

For example:

```text
Resume
+
Backend Developer
```

must produce different analysis from:

```text
Resume
+
Data Scientist
```

The model should evaluate:

> How suitable is this resume for the role selected by the user?

Do not perform generic resume analysis when a target role has been provided.

---

# 13. LOCAL RESUME PARSER

Build a proper local resume parsing pipeline.

Architecture:

```text
Resume File
     ↓
PDF/DOC/DOCX Extraction
     ↓
Raw Resume Text
     ↓
Text Cleaning
     ↓
spaCy NLP
     ↓
Section Detection
     ↓
Entity/Skill Extraction
     ↓
Structured Resume JSON
```

The parser should extract:

## Personal Information

* Name
* Email
* Phone
* Location
* LinkedIn
* GitHub
* Portfolio

## Summary

* Professional summary

## Skills

* Programming languages
* Frameworks
* Libraries
* Databases
* Cloud
* Tools
* Technical skills
* Soft skills

## Education

* Institution
* Degree
* Field
* Start date
* End date
* GPA/CGPA if available

## Experience

* Company
* Job title
* Location
* Start date
* End date
* Responsibilities
* Achievements
* Technologies

## Projects

* Project name
* Description
* Technologies
* Role
* Links
* Achievements

## Certifications

* Certification
* Issuing organization
* Date
* Credential

## Other

Detect where possible:

* Awards
* Publications
* Leadership
* Volunteer experience
* Languages
* Achievements

Do not invent information.

If something cannot be found:

```text
null
```

or:

```text
[]
```

---

# 14. STRUCTURED RESUME DATA

Create a clean data structure.

Example:

```json
{
  "candidate": {
    "name": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "github": "",
    "portfolio": ""
  },

  "summary": "",

  "skills": {
    "technical": [],
    "programmingLanguages": [],
    "frameworks": [],
    "databases": [],
    "cloud": [],
    "tools": [],
    "softSkills": []
  },

  "education": [],

  "experience": [],

  "projects": [],

  "certifications": [],

  "achievements": []
}
```

Use proper TypeScript types/interfaces on the frontend/backend if appropriate.

---

# 15. BUILD OUR LOCAL ML SYSTEM

The ML system must be part of this project.

We are NOT simply using hardcoded rules.

The pipeline should look like:

```text
Structured Resume
       +
Target Role
       ↓
Feature Engineering
       ↓
scikit-learn ML/NLP
       ↓
Analysis
```

Use meaningful features derived from the resume.

Possible features include:

### Resume features

* Number of skills
* Number of technical skills
* Number of projects
* Number of experiences
* Number of certifications
* Education completeness
* Summary presence
* Contact completeness
* Resume length
* Section completeness
* Number of measurable achievements
* Number of action verbs
* Keyword coverage

### Role features

* Expected skills
* Expected keywords
* Role category
* Role-specific terms

### Matching features

* TF-IDF similarity
* Skill overlap
* Keyword overlap
* Role-resume similarity
* Experience relevance
* Project relevance

---

# 16. SUGGESTED KEYWORDS

Change:

```text
Missing Keywords
```

to:

# Suggested Keywords

This terminology must be used throughout the UI.

Do not call them "Missing Keywords."

The purpose is:

> Suggest keywords that could strengthen the resume for the selected target role.

Example:

```text
Suggested Keywords

+ REST APIs
+ Docker
+ System Design
+ CI/CD
+ PostgreSQL
```

These are examples only.

**DO NOT hardcode them.**

The actual suggestions must be generated by our local ML/NLP system.

---

# 17. SUGGESTED KEYWORD PIPELINE

Build:

```text
Target Role
      ↓
Role Knowledge / Training Data
      ↓
Expected Skills & Keywords
      +
Parsed Resume
      ↓
TF-IDF / Similarity / ML Ranking
      ↓
Relevant Suggestions
```

The system should rank suggestions.

Do not simply return every keyword associated with the role.

Example:

```text
Target:
Backend Developer

Resume:
Python
SQL
Git
React

Possible suggestions:
REST APIs
Docker
PostgreSQL
Redis
CI/CD
Testing
System Design
```

The final ranking must come from the actual local analysis system.

---

# 18. QUICK FIXES

The Quick Fixes section must also be generated from our local ML/NLP system.

Pipeline:

```text
Parsed Resume
      +
Target Role
      ↓
Feature Analysis
      ↓
ML Model
      ↓
Weakness Detection
      ↓
Quick Fixes
```

The model should identify areas where the resume could be improved.

Examples:

```text
Quick Fixes

• Add measurable results to your internship experience.
• Strengthen the professional summary for the selected role.
• Add relevant backend technologies.
• Improve project descriptions.
• Add testing experience where relevant.
```

These are examples only.

Actual recommendations must be generated from the user's resume and target role.

---

# 19. QUICK FIXES MUST BE TEXT ONLY

The current UI uses checkboxes.

Remove the checkbox functionality.

Do NOT add:

* Apply Fix
* Edit
* Rewrite
* Delete
* Checkbox interaction
* Automatic resume modification

For now, Quick Fixes are informational text only.

Example:

```text
Quick Fixes

┌────────────────────────────────────────────┐
│ Add measurable achievements to experience. │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ Strengthen your summary for this target    │
│ role.                                      │
└────────────────────────────────────────────┘
```

Maintain the existing card styling.

---

# 20. ATS SCORE

The ATS score must be generated from actual analysis.

Do NOT hardcode:

```text
87/100
```

That is only an example.

Build an explainable scoring system using actual features.

For example:

```text
Resume structure
+
Keyword alignment
+
Role relevance
+
Skill alignment
+
Experience relevance
+
Section completeness
+
Readability
```

Possible output:

```json
{
  "atsScore": 87,
  "components": {
    "formatting": 94,
    "keywordAlignment": 83,
    "readability": 89,
    "sectionCompleteness": 76
  }
}
```

The values must come from actual computation/model output.

Do not randomly generate scores.

---

# 21. TARGET ROLE CARD

Keep the existing Target Role section in the results.

Display the role selected by the user.

Example:

```text
Target Role

Backend Developer
```

Do not silently replace the user's selected role.

---

# 22. EXTRACTED INFORMATION

Keep the existing Extracted Information section.

Populate it using the local resume parser.

Example:

```text
Extracted Information

Skills
Python · SQL · Git · React

Education
B.Tech, Computer Science

Experience
Product Intern — Nova Labs

Certifications
AWS Cloud Practitioner
```

These are examples only.

Actual information must come from the uploaded resume.

If something is not detected:

```text
Not detected
```

Do not invent information.

---

# 23. STATE MANAGEMENT

Implement explicit application states:

```text
NO_RESUME
      ↓
RESUME_SELECTED
      ↓
WAITING_FOR_ROLE
      ↓
ROLE_SUBMITTED
      ↓
READY_TO_ANALYZE
      ↓
PARSING_RESUME
      ↓
RUNNING_LOCAL_ML
      ↓
ANALYSIS_COMPLETE
      ↓
ERROR
```

---

# 24. STATE: NO RESUME

Display the upload UI.

Hide:

* ATS Score
* Suggested Keywords
* Target Role analysis
* Extracted Information
* Quick Fixes
* Resume-specific recommendations

Do not display fake data.

---

# 25. STATE: RESUME SELECTED

Show:

```text
Resume.pdf

Which role are you looking for?

[ Backend Developer ]

[Submit]
```

Do NOT show:

```text
Analyze Resume
Change File
```

yet.

---

# 26. STATE: ROLE SUBMITTED

Show:

```text
Resume.pdf

Target Role:
Backend Developer

[Analyze Resume]
[Change File]
```

---

# 27. STATE: PARSING

When Analyze Resume is clicked:

```text
Reading your resume...
```

Then:

```text
Extracting resume information...
```

Then:

```text
Running local ML analysis...
```

Do not show final results yet.

---

# 28. STATE: ANALYSIS COMPLETE

Only after the parser and ML system successfully finish:

Show:

```text
ATS Score
Suggested Keywords
Target Role
Extracted Information
Quick Fixes
```

All information must come from actual processing.

---

# 29. CHANGE FILE

When Change File is clicked:

Clear:

* Current resume
* Parsed resume
* Target role
* ATS score
* Suggested keywords
* Quick fixes
* Previous analysis

Return to:

```text
Upload Resume
```

Then ask again:

```text
Which role are you looking for?
```

Do not mix results from different resumes.

---

# 30. RE-ANALYZE

If the existing application has a Re-analyze button, keep it.

It should use:

```text
Current Resume
+
Current Target Role
```

and run the local ML pipeline again.

Refresh:

* ATS score
* Suggested Keywords
* Quick Fixes
* Role alignment

No re-upload should be required.

---

# 31. LOCAL ML TRAINING PIPELINE

Create a proper training pipeline.

Structure approximately:

```text
ml/
│
├── data/
│   ├── raw/
│   └── processed/
│
├── models/
│
├── src/
│   ├── preprocessing.py
│   ├── feature_engineering.py
│   ├── resume_parser.py
│   ├── keyword_engine.py
│   ├── weakness_detector.py
│   ├── ats_scorer.py
│   └── inference.py
│
├── train.py
├── evaluate.py
├── predict.py
├── requirements.txt
└── README.md
```

Adapt this structure to the actual project.

---

# 32. TRAINING DATA

First inspect the repository for existing datasets.

If a suitable dataset exists:

**Use it.**

Understand:

* Columns
* Labels
* Features
* Data quality
* Training examples

If no dataset exists:

Do NOT pretend that a production-quality supervised model can be trained from nothing.

Instead:

1. Create the dataset schema.
2. Create sample development data only for testing.
3. Build the preprocessing pipeline.
4. Build the training pipeline.
5. Build evaluation.
6. Make the dataset easy to expand.
7. Clearly document the limitation.

Potential dataset structure:

```text
resume_text
target_role
skills
experience
education
projects
keywords
weaknesses
ats_score
```

Do not claim that a tiny sample dataset is an accurate production model.

---

# 33. TRAINING VS INFERENCE

Keep training and inference completely separate.

Training:

```text
Dataset
 ↓
Preprocessing
 ↓
Feature Engineering
 ↓
Train scikit-learn model
 ↓
Evaluate
 ↓
Save model
```

Inference:

```text
Resume
 ↓
Preprocessing
 ↓
Feature Engineering
 ↓
Load saved model
 ↓
Prediction
```

The application must NOT retrain the model every time a user uploads a resume.

---

# 34. MODEL EVALUATION

Create an evaluation script.

Depending on the task, report:

* Accuracy
* Precision
* Recall
* F1
* Similarity metrics
* Ranking metrics where appropriate

Do not fabricate evaluation results.

If the dataset is insufficient, state that clearly.

---

# 35. ROLE KNOWLEDGE

Create a maintainable local role/skill knowledge base.

It can contain relationships such as:

```text
Backend Developer
    ↓
Python
REST APIs
SQL
PostgreSQL
Docker
CI/CD
Testing
Authentication
Caching
System Design
```

and:

```text
Data Scientist
    ↓
Python
Pandas
NumPy
Statistics
Machine Learning
SQL
Data Visualization
Scikit-learn
```

This is not meant to replace ML.

It should provide structured role information/features that the ML system can learn from and compare against.

Keep it editable and expandable.

---

# 36. LOCAL API

If using FastAPI, create endpoints similar to:

```text
GET /health
POST /parse-resume
POST /analyze-resume
```

Example request:

```json
{
  "targetRole": "Backend Developer",
  "resume": {
    "skills": [],
    "experience": [],
    "education": [],
    "projects": [],
    "certifications": []
  }
}
```

Example response:

```json
{
  "atsScore": 82,
  "suggestedKeywords": [],
  "quickFixes": [],
  "roleAlignment": 78,
  "strengths": [],
  "weaknesses": []
}
```

Do not hardcode the response.

---

# 37. HEALTH CHECK

Create a local health endpoint.

Example:

```text
GET /health
```

Response:

```json
{
  "status": "ok",
  "modelLoaded": true
}
```

The frontend/backend should be able to determine whether the local ML service is running.

---

# 38. ERROR HANDLING

Handle:

* Invalid file
* Unsupported file
* File too large
* Corrupted file
* Empty resume
* Text extraction failure
* Parser failure
* ML service unavailable
* Model missing
* Model loading failure
* Model inference failure
* Invalid ML output
* Network error
* Database error

Do not display fake results when something fails.

---

# 39. LOCAL SETUP

Make the system easy to run on my computer.

Document:

### Install dependencies

```text
pip install -r requirements.txt
```

### Train model

```text
python train.py
```

### Start ML service

```text
uvicorn ...
```

### Start existing website

Use the project's existing start command.

Create appropriate scripts where useful.

Document everything in:

```text
ml/README.md
```

or the project's existing documentation.

---

# 40. NO API KEY

The final local ML system must work without:

```text
OPENAI_API_KEY
GEMINI_API_KEY
ANTHROPIC_API_KEY
```

or any equivalent external AI credential.

No external AI inference.

---

# 41. FUTURE PYTORCH SUPPORT

Do not use PyTorch initially.

However, design the ML service so that we can later add:

```text
Local transformer
+
PyTorch
```

for better semantic understanding.

For example:

```text
Version 1:
scikit-learn + spaCy

Version 2:
scikit-learn + spaCy + local transformer/PyTorch
```

Do not add this complexity unless needed.

---

# 42. UI DESIGN

Use the existing screenshot as the design reference.

Do not:

* Redesign the sidebar
* Change the entire dashboard
* Change colors unnecessarily
* Replace the current visual identity
* Create unnecessary pages

The new target-role question should fit naturally into the current Resume Analyzer card.

---

# 43. QUICK FIXES UI

Change the existing checkbox-based UI to text-only cards.

Current:

```text
☐ Add a professional summary
☐ Quantify achievements
☐ Add Docker
```

New:

```text
Quick Fixes

• Add measurable achievements to your experience.
• Strengthen your summary for the selected role.
• Add relevant technical skills.
```

Keep the same visual hierarchy and card style.

---

# 44. SUGGESTED KEYWORDS UI

Change:

```text
Missing Keywords
```

to:

```text
Suggested Keywords
```

Use the existing pill/chip styling if present.

Example:

```text
Suggested Keywords

+ Docker
+ REST APIs
+ CI/CD
+ PostgreSQL
```

Again, these are examples only.

Actual results must come from the local ML system.

---

# 45. DO NOT DISPLAY RESULTS TOO EARLY

Before:

```text
Resume uploaded
+
Target role submitted
+
Analyze Resume clicked
+
Resume parsed
+
ML analysis completed
```

DO NOT display:

* ATS score
* Suggested Keywords
* Quick Fixes
* Resume-specific analysis
* Resume-specific charts
* Fake values
* Sample values

---

# 46. DO NOT MODIFY UNRELATED FEATURES

Do not change:

* Dashboard
* Job Matches
* Learning Path
* Interview Coach
* Analytics
* Settings
* Authentication

unless technically necessary for this implementation.

---

# 47. TESTING

After implementation, test the entire system.

### Test 1 — No resume

Expected:

```text
Upload Resume
```

No analysis.

### Test 2 — Resume uploaded

Expected:

```text
Which role are you looking for?
```

No Analyze button yet.

### Test 3 — Role submitted

Enter:

```text
Backend Developer
```

Expected:

```text
Analyze Resume
Change File
```

### Test 4 — Analyze

Expected:

```text
Extracting...
Parsing...
Running local ML model...
```

### Test 5 — Results

Expected:

```text
ATS Score
Suggested Keywords
Target Role
Extracted Information
Quick Fixes
```

### Test 6 — Different role

Analyze same resume as:

```text
Backend Developer
```

and:

```text
Data Scientist
```

Results should differ.

### Test 7 — Different resume

Results should change according to the new resume.

### Test 8 — Change File

Old results must disappear.

### Test 9 — ML service stopped

Application should show a useful error instead of fake results.

### Test 10 — Invalid resume

Application should show a useful error.

---

# 48. FINAL ACCEPTANCE CRITERIA

The implementation is complete only if:

* [ ] Existing design is preserved.
* [ ] Resume upload works.
* [ ] PDF works.
* [ ] DOCX works.
* [ ] DOC works where practical.
* [ ] Google Drive architecture is supported if configured.
* [ ] Target-role question appears immediately after resume upload.
* [ ] Question says exactly: **"Which role are you looking for?"**
* [ ] User can enter any custom role.
* [ ] Submit button appears before Analyze Resume.
* [ ] Analyze Resume is hidden until role submission.
* [ ] Change File is hidden until role submission.
* [ ] Target role is stored.
* [ ] Target role is passed to the ML pipeline.
* [ ] Resume is parsed locally.
* [ ] spaCy is used for NLP where appropriate.
* [ ] scikit-learn is used as the primary ML framework.
* [ ] pandas/NumPy are used for data processing where appropriate.
* [ ] PyMuPDF is used for PDF extraction.
* [ ] python-docx is used for DOCX extraction.
* [ ] joblib is used for local model persistence.
* [ ] FastAPI is used for the local ML service if appropriate.
* [ ] No external AI API is required.
* [ ] No AI API key is required.
* [ ] Model runs locally.
* [ ] Training and inference are separate.
* [ ] "Missing Keywords" is changed to **"Suggested Keywords"**.
* [ ] Suggested Keywords are generated by the local ML/NLP system.
* [ ] Quick Fixes are generated by the local ML/NLP system.
* [ ] Quick Fixes are text-only.
* [ ] Checkbox functionality is removed.
* [ ] ATS score is based on actual analysis.
* [ ] Extracted Information comes from the local parser.
* [ ] No fake/sample analysis is displayed.
* [ ] Results remain hidden until analysis completes.
* [ ] Different roles can produce different results.
* [ ] Different resumes can produce different results.
* [ ] Change File clears previous analysis.
* [ ] Re-analyze uses the current resume and target role.
* [ ] ML service has a health check.
* [ ] Errors are handled gracefully.
* [ ] ML setup is documented.
* [ ] Training process is documented.
* [ ] Model evaluation is documented.

---

# 49. VERY IMPORTANT — DO NOT TAKE SHORTCUTS

Do not simply create a UI that *looks* like an ML system.

I want the actual architecture:

```text
                         USER
                           ↓
                     Resume Upload
                           ↓
                  Target Role Input
                           ↓
                         Submit
                           ↓
                   Analyze Resume
                           ↓
                  Document Extraction
                           ↓
                    spaCy NLP Parser
                           ↓
                Structured Resume Data
                           ↓
              Feature Engineering
                           ↓
                 scikit-learn Model
                           ↓
        ┌──────────────────┼─────────────────┐
        ↓                  ↓                 ↓
    ATS Score       Suggested Keywords    Quick Fixes
        ↓                  ↓                 ↓
        └──────────────────┼─────────────────┘
                           ↓
                    Existing UI
```

The model must actually process the resume.

The target role must actually influence the analysis.

Suggested Keywords must actually be generated from the analysis.

Quick Fixes must actually be generated from detected resume weaknesses.

ATS Score must actually be calculated from the resume/role features.

---

# 50. FINAL INSTRUCTION

**Before writing code, inspect the existing project.**

After inspection:

1. Explain the current architecture briefly.
2. Identify what can be reused.
3. Identify what needs to be added.
4. Build the local ML/NLP pipeline.
5. Build the resume parser.
6. Build the training/evaluation pipeline.
7. Build local inference.
8. Connect the ML system to the existing backend.
9. Update the Resume Analyzer UI.
10. Test the complete flow.
11. Fix errors.
12. Document how I can run and retrain the local model.

If the project does not contain enough training data for a strong supervised model, **do not fake it**. Build a legitimate baseline using appropriate NLP/similarity techniques, create the training-data structure, and clearly document how additional data can improve the model.

The final result must be a **real local Resume Parser + ML Resume Analyzer**, not an API wrapper and not a UI mockup.

Use **scikit-learn as the primary ML framework**.
Use **spaCy for NLP**.
Use **PyMuPDF/python-docx for document extraction**.
Use **FastAPI for the local ML service where appropriate**.

No external AI API keys.

I already have a large collection of resumes — thousands of resume files — along with a dataset that we can use for training our local ML/NLP system.

The resume archive is located at:

D:\My Projects\Career CoPILOT\plan\archive

I also have a dataset available in the project. **Inspect the project and this archive before designing the ML pipeline.**

Do NOT create a tiny artificial/sample dataset if the existing data can be used.

Your first task should be to:

1. Inspect the dataset structure and determine what information/labels it contains.
2. Inspect the resume archive and determine the file formats, approximate number of resumes, and quality/consistency of the documents.
3. Determine how the dataset maps to the actual resume files, if there is a mapping.
4. Identify whether the dataset contains job roles, skills, categories, labels, scores, or other useful information.
5. Check for duplicate resumes and duplicate/near-duplicate records.
6. Check for missing, corrupted, or unreadable files.
7. Analyze the distribution of resume categories/roles.
8. Determine which parts of the data can be used for:
   - Resume parsing
   - Role classification
   - Skill extraction
   - Suggested keyword generation
   - Resume-to-role similarity
   - Weakness detection
   - ATS scoring
9. Build a proper preprocessing and training pipeline around the real dataset.
10. Split the data into training, validation, and test sets appropriately and avoid data leakage.

The archive is large, so DO NOT load every resume into memory at once unnecessarily. Build an efficient batch/streaming preprocessing pipeline.

Create a processed dataset/cache so that resumes do not need to be parsed from scratch every time the model is trained.

Use the actual dataset to train/evaluate our local models wherever the available labels support it.

If some desired output — such as ATS score or Quick Fix labels — does NOT have corresponding ground-truth labels in the dataset, do NOT invent labels and claim they are supervised ML results.

Instead, design an appropriate explainable baseline using available data/features and clearly separate:

- Supervised ML
- NLP extraction
- Similarity/ranking
- Rule-based feature detection

The goal is to build a **genuine local Resume Intelligence system trained/evaluated using our available real-world resume data**, not a hardcoded demo.

Use:

- scikit-learn as the primary ML framework
- spaCy for NLP
- pandas/NumPy for data processing
- PyMuPDF for PDF extraction
- python-docx for DOCX extraction
- joblib for model persistence
- FastAPI for the local ML service where appropriate

Do not use external AI APIs or API keys.

Before implementing the model, give me a short **Data Audit** showing what you discovered in the dataset and resume archive, then proceed with the implementation based on those findings.



</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-09-12T16:12:21+05:30.

The user's current state is as follows:
Active Document: d:\My Projects\Career CoPILOT\.gitignore (LANGUAGE_UNSPECIFIED)
Cursor is on line: 1
Other open documents:
- d:\My Projects\Career CoPILOT\.gitignore (LANGUAGE_UNSPECIFIED)
- d:\My Projects\Career CoPILOT\src\lib\session.ts (LANGUAGE_TYPESCRIPT)
- d:\My Projects\Career CoPILOT\src\lib\auth.ts (LANGUAGE_TYPESCRIPT)
- d:\My Projects\Career CoPILOT\.env (LANGUAGE_UNSPECIFIED)
- d:\My Projects\Career CoPILOT\src\routes\__root.tsx (LANGUAGE_TSX)
No browser pages are currently open.
</ADDITIONAL_METADATA>