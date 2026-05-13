# MedAssist — Healthcare Platform

A full-stack healthcare platform with AI-powered symptom triage, appointment booking, real-time messaging, and WebRTC video consultations.

## Architecture

```
medassist_final/
├── frontend/       React 18 + Vite + Tailwind CSS
├── backend/        Node.js + Express + MongoDB (REST API + WebSocket)
└── ai_service/     Python + FastAPI + BERT triage engine
```

All three services are orchestrated via Docker Compose.

## Quick start (Docker)

```bash
cp backend/.env.example backend/.env
# Edit backend/.env — set JWT secrets, ADMIN_EMAIL, ADMIN_PASSWORD (bcrypt hash)
# Generate the admin password hash:
node backend/scripts/hash-password.js yourpassword

docker compose up --build
```

| Service    | URL                      |
|------------|--------------------------|
| Frontend   | http://localhost         |
| Backend    | http://localhost:5001    |
| AI Service | http://localhost:8000    |
| API Docs   | http://localhost:8000/docs |

## Quick start (local dev)

**Backend**
```bash
cd backend
npm install
cp .env.example .env   # fill in values
npm run dev
```

**AI Service** — train the BERT model first (see `ai_service/README.md`), then:
```bash
cd ai_service
pip install -r requirements.txt
uvicorn api.main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

## Environment variables

See `backend/.env.example` for the full list. Key variables:

| Variable              | Description                                      |
|-----------------------|--------------------------------------------------|
| `MONGO_URI`           | MongoDB connection string                        |
| `JWT_ACCESS_SECRET`   | Secret for 15-minute access tokens               |
| `JWT_REFRESH_SECRET`  | Secret for 7-day refresh tokens (different key!) |
| `ADMIN_EMAIL`         | Admin login email                                |
| `ADMIN_PASSWORD`      | **bcrypt hash** of admin password                |
| `AI_SERVICE_URL`      | URL of the FastAPI triage service                |

## Auth flow

The API uses a **dual-token system**:
- `accessToken` — short-lived (15 min), sent as `Authorization: Bearer <token>` on every request
- `refreshToken` — long-lived (7 days), sent only to `POST /api/auth/refresh` to get a new pair
- Logout blacklists the refresh token so it cannot be reused

## Running tests

```bash
cd backend
npm test
```

Tests cover: auth (register, login, refresh, logout token invalidation), triage (emergency detection, AI mock, sanitization), medications (full CRUD), records (full CRUD), appointments (booking, double-booking prevention, role guards, cancellation), and messaging (send, list conversations, thread retrieval).

## User roles

| Role      | Capabilities                                              |
|-----------|-----------------------------------------------------------|
| `patient` | Symptom check, appointments, medications, records, messages, video |
| `doctor`  | View appointments, update status, messages, video — requires admin approval |
| `admin`   | Approve/reject doctors, view audit logs, manage users     |
