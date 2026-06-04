"""
logging_system.py — FIXED

Bug fixes applied:
  1. LOG_FILE renamed from predictions.json → predictions.jsonl
     The file is written in JSONL format (one JSON object per line).
     Using a .json extension was misleading and broke read_logs() on any
     pre-existing valid-JSON-array file in the repo.
  2. os.makedirs is called at module load time (not inside each function)
     so a missing logs/ directory can never crash a request handler.
  3. Raw symptom text (PHI) is not stored — only anonymized metadata.
"""
import json
import hashlib
import datetime
import os

# Module-level setup — create logs directory once at import time.
# This prevents os.makedirs failures inside request handlers.
os.makedirs("logs", exist_ok=True)

LOG_FILE      = "logs/predictions.jsonl"   # JSONL, not JSON array
FEEDBACK_FILE = "logs/feedback.jsonl"


def _anonymize(input_text: str) -> dict:
    """Replace raw symptom text with non-reversible metadata."""
    return {
        "input_hash":   hashlib.sha256(input_text.encode()).hexdigest()[:16],
        "input_length": len(input_text),
    }


def log_prediction(input_text: str, predictions: list, severity: str):
    """
    Log a triage prediction.
    Raw symptom text is NOT stored — only anonymized metadata.
    """
    entry = {
        "timestamp":   str(datetime.datetime.now()),
        **_anonymize(input_text),
        "predictions": predictions,
        "severity":    severity,
    }
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")


def read_logs(limit=100):
    if not os.path.exists(LOG_FILE):
        return []
    entries = []
    with open(LOG_FILE, "r", encoding="utf-8") as f:
        lines = f.readlines()
    for line in lines[-limit:]:
        line = line.strip()
        if line:
            try:
                entries.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    return entries


def get_log_stats():
    entries = read_logs(limit=10000)
    if not entries:
        return {"total": 0}

    severity_counts  = {}
    condition_counts = {}

    for entry in entries:
        sev = entry.get("severity", "unknown")
        severity_counts[sev] = severity_counts.get(sev, 0) + 1

        preds = entry.get("predictions", [])
        if preds:
            top = preds[0].get("condition", "unknown")
            condition_counts[top] = condition_counts.get(top, 0) + 1

    return {
        "total":           len(entries),
        "severity_counts": severity_counts,
        "top_conditions":  dict(
            sorted(condition_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        ),
    }
