"""
predictor.py
============
Loads the fine-tuned BioBERT model for symptom classification.

If the model has not been trained yet (saved_model/final_model/ is absent),
the module falls back to a rule-based keyword predictor so the service
remains fully functional. The `MODEL_READY` flag lets the API surface
this status to callers.
"""

import os
import joblib

MODEL_PATH         = "saved_model/final_model"
LABEL_ENCODER_PATH = "saved_model/label_encoder.pkl"

os.environ.setdefault("TRANSFORMERS_NO_TORCHVISION", "1")

# ── Module-level state ────────────────────────────────────────────────────────
tokenizer          = None
model              = None
label_encoder      = None
_load_attempted    = False
MODEL_READY        = False          # exposed to routes.py for /health endpoint


def _bootstrap():
    """Try to load the BERT model once. Sets MODEL_READY on success."""
    global tokenizer, model, label_encoder, _load_attempted, MODEL_READY

    if _load_attempted:
        return MODEL_READY
    _load_attempted = True

    if not os.path.isdir(MODEL_PATH):
        print(
            f"[Predictor] '{MODEL_PATH}' not found — running in rule-based fallback mode. "
            "Train the model and restart to enable BERT inference."
        )
        return False

    try:
        import torch
        import torch.nn.functional as F
        from transformers import AutoTokenizer, AutoModelForSequenceClassification

        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"[Predictor] Loading BERT model on {device} …")

        tokenizer    = AutoTokenizer.from_pretrained(MODEL_PATH)
        model        = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
        label_encoder = joblib.load(LABEL_ENCODER_PATH)
        model.to(device)
        model.eval()
        MODEL_READY = True
        print("[Predictor] BERT model loaded successfully.")
        return True

    except Exception as exc:
        print(f"[Predictor] Failed to load BERT model: {exc} — using rule-based fallback.")
        return False


def _fallback_predictions(symptoms: str) -> list:
    """
    Simple keyword-based fallback used when the BERT model is not available.
    Returns the same structure as the BERT predictor so downstream code is unchanged.

    FIXED: condition names now use CamelCase to match SEVERITY_MAP keys in
    severity_rules.py (e.g. "ViralFever" not "Viral Fever").  The mismatch
    previously caused get_severity() to always return "unknown" for every
    fallback result.
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
        {"condition": top,                        "confidence": 0.40},
        {"condition": "CommonCold",               "confidence": 0.35},
        {"condition": "Flu",                      "confidence": 0.25},
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
