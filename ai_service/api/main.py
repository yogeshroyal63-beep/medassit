import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router

app = FastAPI(
    title="MedAssist AI Triage Engine",
    description="AI-powered healthcare triage classifier — BERT + Rule-based hybrid",
    version="2.0"
)

allowed_origins = [
    os.getenv("BACKEND_URL", "http://localhost:5001"),
    "http://localhost:5001",
    os.getenv("FRONTEND_URL", "http://localhost:5173"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin for origin in allowed_origins if origin],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def root():
    return {
        "service": "MedAssist AI Triage Engine",
        "version": "2.0",
        "status":  "running",
        "docs":    "/docs"
    }


@app.get("/health")
def health_check():
    from model.predictor import MODEL_READY
    return {
        "status":         "ok",
        "service":        "MedAssist AI",
        "version":        "2.0",
        "model_ready":    MODEL_READY,
        "inference_mode": "bert" if MODEL_READY else "rule-based-fallback",
    }
