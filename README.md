# AI Career Copilot

An AI-powered career acceleration platform for students — combining resume analysis, adaptive learning paths, mock interviews, and job matching in one unified application.

## Architecture

```
career-copilot/
├── src/                  # TanStack Start (React + SSR) frontend & server
│   ├── routes/           # File-based routes (auth-guarded for private pages)
│   ├── components/       # React UI components
│   ├── lib/              # Auth, ML client, session, env validation
│   ├── db/               # Drizzle ORM schema + client (Neon Postgres)
│   └── server.ts         # H3/Vinxi server entry point
└── ml/                   # FastAPI Python ML service (local)
    ├── app.py            # FastAPI application (resume analysis API)
    ├── src/              # Parser, ATS scorer, keyword engine, feature engineering
    ├── models/           # Trained scikit-learn artifacts (.joblib)
    ├── train.py          # Training script (TF-IDF + LinearSVC)
    └── requirements.txt  # Pinned Python dependencies
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TanStack Router v1, TanStack Query v5 |
| Styling | Tailwind CSS v4, Radix UI |
| SSR / Server | TanStack Start (Vite + Vinxi + H3) |
| Auth | Auth.js (GitHub OAuth + Credentials w/ Argon2id) |
| Database | Neon Postgres (serverless), Drizzle ORM |
| ML Service | FastAPI, spaCy, scikit-learn (TF-IDF + LinearSVC) |
| Build | Vite 8.3+ |

---

## Prerequisites

- **Node.js** 20+ and **npm** 10+
- **Python** 3.10+ (3.11 recommended)
- A **Neon Postgres** project (free tier works): https://console.neon.tech
- A **GitHub OAuth App** for authentication: https://github.com/settings/developers

---

## Getting Started

### 1. Clone and install Node dependencies

```bash
git clone <repo-url>
cd career-copilot
npm install
```

### 2. Configure environment variables

```bash
# Copy the template — never commit the .env file
cp .env.example .env
```

Edit `.env` and fill in all required values:

| Variable | Description | How to obtain |
|---|---|---|
| `DATABASE_URL` | Neon Postgres connection string | Neon console → Project → Connection string |
| `AUTH_SECRET` | JWT signing secret (≥ 32 chars) | `openssl rand -hex 32` |
| `AUTH_GITHUB_ID` | GitHub OAuth client ID | GitHub → Settings → Developer settings → OAuth Apps |
| `AUTH_GITHUB_SECRET` | GitHub OAuth client secret | Same as above |

> **Security:** `AUTH_SECRET` must be cryptographically random. Never reuse across environments.

### 3. Push database schema

```bash
npx drizzle-kit push
```

This creates the required tables in your Neon database.

### 4. Start the development server

```bash
npm run dev
# Frontend: http://localhost:8080
```

### 5. Set up the ML service (required for resume analysis)

```bash
cd ml

# Create a virtual environment
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # macOS/Linux

# Install Python dependencies
pip install -r requirements.txt

# Download the spaCy language model
python -m spacy download en_core_web_sm

# Optional: train the category classifier
# (pre-trained artifacts are included in ml/models/)
# python -m ml.train

# Start the ML service
uvicorn ml.app:app --host 127.0.0.1 --port 8000 --reload
# ML API: http://localhost:8000
```

---

## Authentication

The application uses **Auth.js** with:

- **GitHub OAuth** (recommended for users)
- **Credentials provider** (email + password with Argon2id hashing)

### Admin provisioning

There are **no hardcoded admin credentials**. To promote a user to admin:

```bash
npx tsx scripts/set-admin-role.ts <email>
```

The user must already have logged in at least once. They must log out and back in for the role change to take effect.

---

## Database Schema

Key tables (Drizzle + Neon Postgres):

- `user` — Users with `passwordHash` (Argon2id), `role` (user/admin)
- `account` — OAuth account links (Auth.js adapter)
- `session` — Active sessions (Auth.js adapter)
- `verificationToken` — Email verification tokens

---

## ML Service

### Model Artifacts

Pre-trained artifacts are in `ml/models/`:
- `tfidf_vectorizer.joblib` — TF-IDF vectorizer trained on the resume dataset
- `category_classifier.joblib` — LinearSVC resume category classifier
- `training_metadata.joblib` — Training metadata (accuracy, categories, vocab size)

Built with: `scikit-learn==1.4.1.post1`, `numpy==1.26.4`, `joblib==1.3.2`

### Retraining

```bash
# Requires the dataset at: plan/archive/Resume/Resume.csv
python -m ml.train
```

### ML Service Security

- File uploads are validated by extension (allow-list: `.pdf`, `.docx`, `.doc`)
- Server-side size limit: 10 MB (configurable via `ML_MAX_UPLOAD_BYTES`)
- CORS restricted to known origins only (configurable via `ML_ALLOWED_ORIGINS`)
- No stack traces in error responses
- Model artifacts loaded only from the local `ml/models/` directory

---

## Available Scripts

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 8080) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

### Database

| Command | Description |
|---------|-------------|
| `npx drizzle-kit push` | Push schema to database |
| `npx drizzle-kit studio` | Open Drizzle Studio (DB explorer) |
| `npx drizzle-kit generate` | Generate SQL migrations |

### Admin

| Command | Description |
|---------|-------------|
| `npx tsx scripts/set-admin-role.ts <email>` | Promote a user to admin |

### ML Service

| Command | Description |
|---------|-------------|
| `uvicorn ml.app:app --host 127.0.0.1 --port 8000 --reload` | Start ML service |
| `python -m ml.train` | Retrain category classifier |
| `python -m spacy download en_core_web_sm` | Download NLP model |

---

## Testing

### ML Service Tests

```bash
cd <project_root>
pip install -r ml/requirements-dev.txt
pytest ml/tests/ -v
```

Tests cover: file upload validation, size limits, extension allow-listing, error response safety (no stack traces), and injection resistance.

---

## Security

- **No hardcoded credentials** anywhere in the codebase
- **Passwords** hashed with Argon2id (OWASP-recommended parameters)
- **Route guards** on all private pages (server-side, not just frontend)
- **CSRF protection** on all server functions (TanStack Start middleware)
- **`.env` is gitignored** — use `.env.example` as a template
- **File uploads** validated by extension, MIME type, and size
- **Session storage** scoped by user ID; cleared on logout

### Credential Rotation (Required)

The following credentials were previously committed to Git history and **must be rotated** even after removing them from the codebase:

| Credential | Provider | Action Required |
|---|---|---|
| `DATABASE_URL` password | Neon Postgres | Reset the role password in Neon console |
| `AUTH_GITHUB_SECRET` | GitHub OAuth | Regenerate in GitHub → Settings → Developer settings |
| `AUTH_SECRET` | N/A | Already replaced; generate a new value with `openssl rand -hex 32` |

> **Important:** Rotating the values in `.env` alone is not sufficient. The secrets must be regenerated at the provider level.

See [Git History Cleanup](#git-history-cleanup) below for guidance on cleaning the exposed secrets from history.

### Git History Cleanup

Credentials were committed in commit `9764ce1`. Until the history is rewritten:

1. **Treat all previously committed secrets as compromised** (rotate them now)
2. To clean history, use `git-filter-repo` (preferred over `git filter-branch`):
   ```bash
   pip install git-filter-repo
   git filter-repo --path .env --invert-paths --force
   # Then force-push with team coordination: git push --force-with-lease
   ```
3. All collaborators must re-clone after history rewrite
4. If the repository was ever public or pushed to a remote, assume the secrets are already compromised

---

## Environment Variables Reference

See [`.env.example`](.env.example) for the complete reference with descriptions.

---

## License

MIT
