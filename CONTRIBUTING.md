# Contributing to MedAssist

## Local Setup

### Prerequisites
- Node.js ≥ 18
- Python ≥ 3.10
- Docker + Docker Compose (for the full stack)
- MongoDB 7 and Redis 7 (or use the Compose services)

### Quick start

```bash
# 1. Clone and install
git clone <repo-url>
cd medassist

# 2. Backend
cd backend
cp .env.example .env        # fill in secrets
npm install
npm run dev                 # nodemon on port 5001

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev                 # Vite on port 5173

# 4. AI service (new terminal)
cd ai_service
pip install -r requirements.txt
python scripts/download_model.py   # cold-start pretrained checkpoint
python run.py                      # FastAPI on port 8000
```

### Full stack via Docker Compose

```bash
cp backend/.env.example backend/.env   # fill in secrets
docker compose up --build
# Frontend: http://localhost
# Backend API: http://localhost:5001/api
# AI service: internal only (http://ai-service:8000)
```

## Architecture

```
medassist/
├── frontend/          React + Vite (feature-slice structure)
│   └── src/
│       ├── app/       Router, providers
│       ├── features/  One folder per domain (auth, patient, doctors …)
│       └── shared/    Reusable components, hooks, utils, shadcn primitives
├── backend/           Node.js + Express + MongoDB
│   └── src/
│       ├── modules/   Feature modules (auth, doctors, appointments …)
│       ├── middleware/ JWT auth, RBAC, rate-limiting, validation
│       └── utils/     JWT helpers, logger, token blacklist
└── ai_service/        Python FastAPI — BioBERT triage, spell correction
    ├── api/           Routes, schemas, auth
    ├── model/         Triage engine, medicine lookup, severity rules
    └── training/      Dataset generation + fine-tuning script
```

### Key design decisions

- **Feature-slice frontend**: each `features/<name>/` folder owns its pages, components, and service layer. Cross-feature UI primitives live in `shared/components/ui/`.
- **Fail-closed token blacklist**: Redis errors cause the blacklist to deny tokens (safer for healthcare).
- **Dual JWT**: short-lived access tokens (15 m) + long-lived refresh tokens (7 d). Stored in `localStorage` — see `shared/utils/api.js`.
- **Socket.io auth**: JWT is required in the Socket.io handshake `auth.token` field. The server verifies the token and confirms the user is a participant in the appointment's room before admitting them.
- **Video**: 1:1 WebRTC only. `VideoConsultation.jsx` connects to `peers[0]`. Group calls are not supported — this is intentional, not a bug.
- **AI service**: internal FastAPI service. Not exposed to the internet — the backend proxies triage requests and authenticates them with a shared secret (`AI_SERVICE_SECRET`).

## Branch naming

| Type       | Pattern                    |
|------------|----------------------------|
| Feature    | `feat/<short-description>` |
| Bug fix    | `fix/<short-description>`  |
| Chore/docs | `chore/<short-description>`|

## Running tests

```bash
# Backend (Jest)
cd backend && npm test
cd backend && npm run test:coverage

# Frontend (Vitest + RTL)
cd frontend && npm test

# AI service (pytest)
cd ai_service && pytest
```

## Code style

- **Backend**: ESLint (`.eslintrc.js`). Run `npm run lint` before committing.
- **Frontend**: ESLint + Prettier (`eslint.config.js`). Run `npm run lint`.
- **Python**: PEP 8. No linter enforced yet — keep lines under 100 chars.

## Adding a new backend module

1. Create `backend/src/modules/<name>/` with `model.js`, `service.js`, `controller.js`, `routes.js`, `validator.js`.
2. Register the router in `backend/src/app.js`.
3. Add at least one test file in `backend/tests/<name>.test.js`.
