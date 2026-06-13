import os
from typing import Dict, List, Optional

import joblib
import numpy as np
import torch
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
from transformers import AutoModelForSequenceClassification, AutoTokenizer

BASE_DIR = os.path.dirname(__file__)
MODEL_DIR = "saiyogesh/medassist-bert"
DEFAULT_SECRET = "medassist_internal_CHANGE_IN_PRODUCTION"


class TriageRequest(BaseModel):
    symptoms: str
    age: Optional[int] = None


app = FastAPI(
    title="MedAssist AI Triage Service",
    version="1.0",
    description="Lightweight AI triage API serving symptom classification from a saved BERT model.",
)


def load_model():
    token = os.getenv("HF_TOKEN")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR, use_fast=False, token=token)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR, token=token)
    model.eval()
    return tokenizer, model


def load_label_encoder():
    from huggingface_hub import hf_hub_download
    token = os.getenv("HF_TOKEN")
    path = hf_hub_download(repo_id="saiyogesh/medassist-bert", filename="label_encoder.pkl", token=token)
    return joblib.load(path)


tokenizer, model = load_model()
label_encoder = load_label_encoder()
label_classes = list(getattr(label_encoder, "classes_", []))


def validate_secret(secret: Optional[str]) -> str:
    expected = os.getenv("AI_SERVICE_SECRET", DEFAULT_SECRET)
    if secret != expected:
        raise HTTPException(status_code=401, detail="Invalid internal secret")
    return secret


def build_predictions(symptoms: str) -> List[Dict[str, object]]:
    inputs = tokenizer(
        symptoms,
        truncation=True,
        padding="max_length",
        max_length=512,
        return_tensors="pt",
    )

    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits[0]
        probabilities = torch.softmax(logits, dim=-1).cpu().numpy()

    ranking = np.argsort(probabilities)[::-1][:3]
    predictions = []

    for idx in ranking:
        condition = label_encoder.inverse_transform([int(idx)])[0]
        predictions.append(
            {
                "condition": condition,
                "confidence": float(round(float(probabilities[idx]), 4)),
            }
        )

    return predictions


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": True,
        "available_labels": len(label_classes),
    }


@app.post("/triage")
def triage(
    request: TriageRequest,
    x_internal_secret: Optional[str] = Header(None, alias="x-internal-secret"),
):
    validate_secret(x_internal_secret)

    symptoms = request.symptoms.strip()
    if not symptoms:
        raise HTTPException(status_code=400, detail="Symptoms are required")

    predictions = build_predictions(symptoms)
    if not predictions:
        raise HTTPException(status_code=500, detail="No predictions available from model")

    top_condition = predictions[0]["condition"]
    severity = "moderate"
    advice = "This is automated triage information only. Please consult a qualified healthcare professional for medical advice."
    disclaimer = "This service does not provide a medical diagnosis and is intended for informational purposes only."

    return {
        "status": "success",
        "top_condition": top_condition,
        "severity": severity,
        "predictions": predictions,
        "advice": advice,
        "disclaimer": disclaimer,
    }