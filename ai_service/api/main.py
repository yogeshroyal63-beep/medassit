import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router
from api.ops_routes import router as ops_router
from api.warmup import start_warmup


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Start loading the model in the background as soon as the container boots,
    # so it overlaps with the warm-up request that woke the container.
    # Set MEDASSIST_EAGER_LOAD=0 to disable (tests, CI).
    if os.getenv("MEDASSIST_EAGER_LOAD", "1") == "1":
        start_warmup()
    yield


app = FastAPI(
    title="MedAssist AI Triage Engine",
    description="AI-powered healthcare triage classifier — BERT + Rule-based hybrid",
    version="2.0",
    lifespan=lifespan,
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
app.include_router(ops_router)


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
