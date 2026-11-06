"""
predictor.py
============
Loads the fine-tuned BioBERT triage model from the Hugging Face Hub and runs
symptom classification.

If the model cannot be loaded the service stays up and answers with a simple
keyword fallback, so callers always get the same response shape. The
`MODEL_READY` flag tells the API which mode is active.

Changes in this version
-----------------------
* The model id is configurable: set HF_MODEL_ID (default: saiyogesh/medassist-bert).
* Loading is guarded by a lock. A request that arrives while the model is still
  loading now waits for it instead of silently receiving the keyword fallback.
* `reset_for_retry()` lets the warm-up manager try again after a failed load.
* `class_probabilities()` returns the probability of one class for many texts
  (used by the explainability endpoint).
"""

import os
import threading

import joblib

HF_MODEL_ID = os.getenv("HF_MODEL_ID", "saiyogesh/medassist-bert")

os.environ.setdefault("TRANSFORMERS_NO_TORCHVISION", "1")

# -- Module-level state --------------------------------------------------------
tokenizer = None
model = None
label_encoder = None
_load_attempted = False
MODEL_READY = False
_load_lock = threading.Lock()
LOAD_ERROR = None


def _bootstrap():
    """Load the BERT model once. Thread-safe. Sets MODEL_READY on success."""
    global tokenizer, model, label_encoder, _load_attempted, MODEL_READY, LOAD_ERROR

    with _load_lock:
        if _load_attempted:
            return MODEL_READY
        _load_attempted = True

        try:
            import torch
            from transformers import AutoTokenizer, AutoModelForSequenceClassification
            from huggingface_hub import hf_hub_download

            device = "cuda" if torch.cuda.is_available() else "cpu"
            hf_token = os.environ.get("HF_TOKEN") or None

            print(f"[Predictor] Loading {HF_MODEL_ID} on {device} ...")

            tok = AutoTokenizer.from_pretrained(HF_MODEL_ID, token=hf_token)
            mdl = AutoModelForSequenceClassification.from_pretrained(HF_MODEL_ID, token=hf_token)

            pkl_path = hf_hub_download(repo_id=HF_MODEL_ID, filename="label_encoder.pkl", token=hf_token)
            enc = joblib.load(pkl_path)

            mdl.to(device)
            mdl.eval()

            tokenizer, model, label_encoder = tok, mdl, enc
            MODEL_READY = True
            LOAD_ERROR = None
            print("[Predictor] BERT model loaded successfully.")
            return True

        except Exception as exc:  # noqa: BLE001 - any failure falls back to rules
            LOAD_ERROR = f"{type(exc).__name__}: {exc}"[:300]
            print(f"[Predictor] Failed to load BERT model: {LOAD_ERROR} -> using rule-based fallback.")
            return False


def reset_for_retry():
    """Allow _bootstrap() to try again (used after a failed load)."""
    global _load_attempted
    with _load_lock:
        if not MODEL_READY:
            _load_attempted = False


def _fallback_predictions(symptoms: str) -> list:
    """
    Simple keyword-based fallback used when the BERT model is not available.
    Returns the same structure as the BERT predictor so downstream code is unchanged.
    """
    text = (symptoms or "").lower()

    if any(w in text for w in ["cough", "cold", "fever", "sore throat", "throat"]):
        top = "ViralFever"
    elif any(w in text for w in ["stomach", "vomit", "nausea", "diarrhea", "abdomen"]):
        top = "Gastritis"
    elif any(w in text for w in ["headache", "migraine", "dizziness", "head pain"]):
        top = "Migraine"
    elif any(w in text for w in ["rash", "itch", "skin", "allergy", "hives"]):
        top = "Allergy"
    elif any(w in text for w in ["back pain", "joint", "muscle", "sprain"]):
        top = "MuscleStrain"
    elif any(w in text for w in ["urine", "burning", "uti", "bladder"]):
        top = "UrinaryInfection"
    else:
        top = "Flu"

    return [
        {"condition": top,          "confidence": 0.40},
        {"condition": "CommonCold", "confidence": 0.35},
        {"condition": "Flu",        "confidence": 0.25},
    ]


def predict(symptoms: str) -> list:
    """
    Run inference on symptom text.
    Uses BERT when available, keyword fallback otherwise.
    Returns a list of {condition, confidence} dicts (top 3).
    """
    if not _bootstrap():
        return _fallback_predictions(symptoms)

    import torch
    import torch.nn.functional as F

    device = next(model.parameters()).device

    inputs = tokenizer(
        symptoms,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=128,
    )
    inputs = {k: v.to(device) for k, v in inputs.items()}

    with torch.no_grad():
        logits = model(**inputs).logits

    probs = F.softmax(logits, dim=1)
    top_probs, top_indices = torch.topk(probs, min(3, probs.shape[1]))

    return [
        {
            "condition":  label_encoder.inverse_transform([idx.item()])[0],
            "confidence": round(prob.item(), 4),
        }
        for prob, idx in zip(top_probs[0], top_indices[0])
    ]


def class_probabilities(texts: list, condition: str) -> list:
    """
    Probability of `condition` for each text in `texts`.
    BERT mode: one batched forward pass. Fallback mode: the keyword predictor's
    confidence for that condition (0.0 if it is not in its top 3).
    """
    if not _bootstrap():
        out = []
        for t in texts:
            conf = 0.0
            for p in _fallback_predictions(t):
                if p["condition"] == condition:
                    conf = p["confidence"]
                    break
            out.append(conf)
        return out

    import torch
    import torch.nn.functional as F

    device = next(model.parameters()).device
    idx = int(label_encoder.transform([condition])[0])

    inputs = tokenizer(
        list(texts),
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=128,
    )
    inputs = {k: v.to(device) for k, v in inputs.items()}

    with torch.no_grad():
        probs = F.softmax(model(**inputs).logits, dim=1)[:, idx]

    return [float(p) for p in probs.cpu().tolist()]
