# MedAssist Healthcare Platform

A comprehensive healthcare platform with AI-powered triage, appointment management, and telemedicine features.

## Features

- **AI Triage System**: BERT-based symptom analysis and severity assessment
- **User Management**: Role-based access for patients, doctors, and admins
- **Appointment Scheduling**: Book and manage medical appointments
- **Medication Tracking**: Manage prescriptions and medication history
- **Video Consultation**: Integrated telemedicine capabilities
- **Secure Authentication**: JWT-based auth with role-based permissions

## Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS
- **Backend**: Node.js, Express, MongoDB
- **AI Service**: Python, FastAPI, Transformers
- **Deployment**: Docker, Docker Compose

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for AI service)

### Development Setup

1. Clone the repository
2. Set up environment variables (see .env.example)
3. Run with Docker Compose:

```bash
docker-compose up --build
```

Or run services individually:

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev

# AI Service
cd ai_service
pip install -r requirements.txt
uvicorn api.main:app --reload
```

## API Documentation

- Backend API: http://localhost:5001/api/docs
- AI Service: http://localhost:8000/docs

## Testing

```bash
# Backend tests
cd backend
npm test

# AI service (add tests as needed)
cd ai_service
pytest
```

## Deployment

1. Set production environment variables
2. Build and run with Docker Compose
3. Access at http://localhost

## Security Notes

- Change default JWT secrets in production
- Set admin credentials via environment variables
- Use HTTPS in production
- Regularly update dependencies

## License

MIT
