# 🏥 MedAssist AI — Medical Triage Engine

![Python](https://img.shields.io/badge/Python-3.10+-blue?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green?style=for-the-badge&logo=fastapi)
![BERT](https://img.shields.io/badge/Model-BERT-orange?style=for-the-badge&logo=huggingface)
![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-red?style=for-the-badge&logo=pytorch)
![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)

> An AI-powered medical symptom triage system that combines a fine-tuned **BERT classifier** with a **rule-based hybrid engine** to assess symptoms, detect emergencies, and guide patients to the right care — in real time.

---

## ✨ Features

- 🧠 **BERT-based Symptom Classifier** — Fine-tuned transformer model predicts the most likely medical condition from plain-text symptom descriptions with confidence scores
- 🚨 **Emergency Detection Engine** — Instantly flags 40+ emergency keywords and dangerous symptom combinations (e.g. chest pain + sweating = cardiac alert)
- 💊 **Medicine Query Engine** — Answers questions about medications, dosage, side effects, and interactions
- 🧬 **Intent Detection** — Classifies user intent: symptom query, medicine query, follow-up, greeting, or mental health crisis
- 🔤 **Spell Correction** — Handles medical typos before inference
- 🩺 **Severity Scoring** — Returns severity level (mild / moderate / severe / critical) with age-aware boosting
- 🏥 **Specialty Mapping** — Recommends the right doctor specialty (primary + secondary)
- 🆘 **Mental Health Crisis Handling** — Detects self-harm/suicidal language and responds with Indian helplines
- 📋 **Structured Care Advice** — Returns action steps, urgency level, and home care guidance
- ⚡ **FastAPI REST Backend** — Production-ready API with full Swagger docs at `/docs`

---

## 🏗️ Architecture

```
User Input (symptoms text)
        │
        ▼
┌─────────────────────────────┐
│     Input Validator         │  ← Rejects empty / nonsense input
└────────────┬────────────────┘
             ▼
┌─────────────────────────────┐
│      Spell Corrector        │  ← Fixes medical typos
└────────────┬────────────────┘
             ▼
┌─────────────────────────────┐
│      Intent Detector        │  ← greeting / medicine / crisis / symptom
└────────────┬────────────────┘
             ▼
┌─────────────────────────────┐
│   Emergency Rules Engine    │  ← Rule-based, instant emergency flag
└────────────┬────────────────┘
             ▼
┌─────────────────────────────┐
│    BERT ML Predictor        │  ← Fine-tuned transformer, top-3 predictions
└────────────┬────────────────┘
             ▼
┌─────────────────────────────┐
│  Severity + Specialty +     │
│  Care Advice Engine         │  ← Age-aware severity, doctor specialty
└────────────┬────────────────┘
             ▼
        Structured JSON Response
```

---

## 📁 Project Structure

```
medassist-ai/
├── api/
│   ├── main.py          # FastAPI app setup + CORS
│   ├── routes.py        # All API endpoints
│   └── schemas.py       # Pydantic request/response models
├── model/
│   ├── triage_engine.py     # Main orchestration logic
│   ├── predictor.py         # BERT inference
│   ├── emergency_rules.py   # 40+ emergency keyword + combo rules
│   ├── intent_detector.py   # Intent classification
│   ├── severity_rules.py    # Severity scoring + care advice
│   ├── specialty_mapper.py  # Doctor specialty mapping
│   ├── medicine_engine.py   # Medicine database + query handler
│   ├── spell_corrector.py   # Typo correction
│   ├── input_validator.py   # Input sanitization
│   └── logging_system.py    # Prediction logging
├── training/
│   └── train_bert.py        # BERT fine-tuning script
├── generate_dataset.py      # Dataset generation script
├── test_model.py            # Model testing
├── test_triage.py           # Triage engine testing
└── requirements.txt
```

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/yogeshroyal63-beep/medassist-ai.git
cd medassist-ai
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Download the trained model

The model weights are too large for GitHub. Download them from the link below and place the `saved_model/` folder in the project root.

> 📦 **[Download saved_model from Google Drive](#)** ← *(replace with your link)*

Your folder structure should look like:
```
medassist-ai/
└── saved_model/
    ├── final_model/
    └── label_encoder.pkl
```

### 4. Run the API

```bash
uvicorn api.main:app --reload
```

API will be live at: `http://localhost:8000`
Swagger docs at: `http://localhost:8000/docs`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/triage` | Main symptom triage — returns prediction, severity, advice |
| `GET` | `/conditions` | List all supported medical conditions |
| `GET` | `/medicines` | Browse medicine database |
| `GET` | `/medicine/{name}` | Get detailed info on a specific medicine |
| `GET` | `/emergency` | Get emergency contact numbers |
| `POST` | `/feedback` | Submit feedback on a prediction |
| `GET` | `/health` | Health check |

---

## 🧪 Example Request

**POST** `/triage`

```json
{
  "symptoms": "I have fever and severe headache since 2 days",
  "age": 35
}
```

**Response:**

```json
{
  "status": "success",
  "predictions": [
    { "condition": "Viral Fever", "confidence": 0.8712 },
    { "condition": "Dengue", "confidence": 0.0921 },
    { "condition": "Malaria", "confidence": 0.0367 }
  ],
  "top_condition": "Viral Fever",
  "severity": "moderate",
  "specialty": {
    "primary": "General Physician",
    "secondary": "Internal Medicine"
  },
  "advice": {
    "action": "Visit a doctor within 24 hours",
    "urgency": "Prompt attention needed",
    "home_care": "Rest, stay hydrated, monitor temperature"
  },
  "age_considered": true,
  "disclaimer": "This AI assistant provides triage guidance only and does not replace professional medical advice."
}
```

---

## 🛡️ Safety Features

- **Emergency override** — Rule-based emergency detection runs before ML, ensuring critical cases are never missed regardless of model confidence
- **Low confidence fallback** — Responses below 25% confidence are rejected and the user is prompted for more detail
- **Mental health crisis routing** — Suicidal or self-harm language is detected and immediately routed to helplines, never to the ML model
- **Medical disclaimer** — Every response includes a disclaimer reminding users this is not a substitute for professional advice

---

## 🧠 Model Details

- **Base model:** `bert-base-uncased`
- **Task:** Multi-class sequence classification
- **Fine-tuned on:** Custom generated medical symptom dataset
- **Input:** Plain text symptom description (max 128 tokens)
- **Output:** Top-3 condition predictions with confidence scores

---

## 🔌 Integration

This engine is designed to be consumed by a React + Node.js frontend. CORS is pre-configured for:
- `http://localhost:3000` (React)
- `http://localhost:5173` (Vite)
- `http://localhost:5000` (Node.js backend)

---

## ⚠️ Disclaimer

This system is intended for **educational and research purposes only**. It does not replace professional medical diagnosis or advice. Always consult a qualified healthcare provider for medical decisions.
#   m e d a s s i s t - a i  
 
## Bug #3 — BERT Model Missing (IMPORTANT)

The AI service expects a fine-tuned BioBERT model at `saved_model/final_model/`.
This directory is absent from the submission — only `label_encoder.pkl` is present.

**To fix before deployment:**
```bash
cd ai_service
python training/train_bert.py
```
This will generate `saved_model/final_model/` with the trained model weights.

Until the model is present, the predictor falls back to a keyword-based rule engine.
The fallback is clearly labelled in `model/predictor.py` as `_fallback_predictions()`.
