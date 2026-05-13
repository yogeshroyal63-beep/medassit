import json
import datetime
import os
import time
from collections import defaultdict

from fastapi import APIRouter, Depends, Query, Request, HTTPException
from pydantic import BaseModel
from typing import Optional

from api.schemas import SymptomRequest
from api.auth import verify_internal_secret
from model.triage_engine import triage
from model.medicine_engine import MEDICINE_DB, search_medicines
from model.emergency_rules import EMERGENCY_NUMBERS
from model.severity_rules import SEVERITY_MAP
from model.specialty_mapper import SPECIALTY_MAP

# Ensure logs directory exists at startup (not inside request handlers).
# logging_system.py also does this, but having it here guards the feedback file too.
os.makedirs("logs", exist_ok=True)

# Simple in-memory rate limiter for feedback endpoint
_feedback_calls = defaultdict(list)
_FEEDBACK_LIMIT = 10   # max requests
_FEEDBACK_WINDOW = 60  # per 60 seconds


def _check_feedback_rate_limit(client_ip: str) -> bool:
    now = time.time()
    # Clean up stale timestamps for this IP
    _feedback_calls[client_ip] = [t for t in _feedback_calls[client_ip] if now - t < _FEEDBACK_WINDOW]
    if len(_feedback_calls[client_ip]) >= _FEEDBACK_LIMIT:
        return False
    _feedback_calls[client_ip].append(now)
    return True


def _sweep_feedback_rate_limiter():
    """
    Evict IPs whose most recent request is older than the window.
    Prevents unbounded growth under sustained traffic from many unique IPs.
    FIXED: the previous implementation never removed old IPs from the dict.
    """
    now = time.time()
    stale_ips = [ip for ip, calls in _feedback_calls.items() if not calls or now - max(calls) > _FEEDBACK_WINDOW]
    for ip in stale_ips:
        del _feedback_calls[ip]


# Schedule periodic sweep every 5 minutes using a repeating background thread.
import threading

def _start_sweep_timer():
    """Restart the sweep timer after each execution so it repeats indefinitely."""
    _sweep_feedback_rate_limiter()
    t = threading.Timer(300, _start_sweep_timer)
    t.daemon = True
    t.start()

_initial_sweep_timer = threading.Timer(300, _start_sweep_timer)
_initial_sweep_timer.daemon = True
_initial_sweep_timer.start()

router = APIRouter()


# -----------------------------------------------
# POST /triage — Main triage endpoint
# -----------------------------------------------

@router.post("/triage", dependencies=[Depends(verify_internal_secret)])
def run_triage(request: SymptomRequest):
    """
    Main symptom triage endpoint.
    Accepts symptoms text and optional age.
    Returns predictions, severity, specialty, and care advice.
    """
    result = triage(request.symptoms, age=request.age)
    return result


# -----------------------------------------------
# GET /conditions — List all supported conditions
# -----------------------------------------------

@router.get("/conditions")
def get_conditions():
    """
    Returns all conditions the AI can classify,
    with their severity and recommended specialty.
    """
    conditions = []
    for condition, severity in SEVERITY_MAP.items():
        specialty_data = SPECIALTY_MAP.get(condition, ("General Physician", None))
        conditions.append({
            "condition": condition,
            "severity":  severity,
            "specialty": specialty_data[0],
        })

    return {
        "total":      len(conditions),
        "conditions": sorted(conditions, key=lambda x: x["condition"])
    }


# -----------------------------------------------
# GET /medicines — Medicine database
# -----------------------------------------------

@router.get("/medicines")
def get_medicines(search: str = Query(default=None)):
    """
    Returns medicine database.
    Optional search parameter for partial name match.
    """
    if search:
        matches = search_medicines(search.lower())
        result = {
            name.lower().replace(" ", "_"): MEDICINE_DB[name.lower().replace(" ", "_")]
            for name in matches
            if name.lower().replace(" ", "_") in MEDICINE_DB
        }
        return {
            "query":   search,
            "results": len(result),
            "medicines": result
        }

    return {
        "total":     len(MEDICINE_DB),
        "medicines": list(MEDICINE_DB.keys())
    }


# -----------------------------------------------
# GET /medicine/{name} — Single medicine lookup
# -----------------------------------------------

@router.get("/medicine/{name}")
def get_medicine(name: str):
    """
    Get detailed info about a specific medicine.
    """
    name_key = name.lower().replace(" ", "_").replace("-", "_")
    med = MEDICINE_DB.get(name_key)

    if not med:
        return {
            "found":   False,
            "message": f"Medicine '{name}' not found in database.",
            "suggestion": "Try searching with /medicines?search=name"
        }

    return {
        "found":    True,
        "medicine": name_key.replace("_", " ").title(),
        **med
    }


# -----------------------------------------------
# POST /feedback — Log user feedback
# -----------------------------------------------

class FeedbackRequest(BaseModel):
    symptoms: str
    predicted_condition: str
    correct_condition: Optional[str] = None
    helpful: Optional[bool] = None


@router.post("/feedback")
def submit_feedback(request: FeedbackRequest, http_request: Request):
    """
    Log user feedback on predictions for future improvement.
    Accepts body (not query params) to keep symptoms out of server logs.
    """
    client_ip = http_request.client.host if http_request.client else "unknown"
    if not _check_feedback_rate_limit(client_ip):
        raise HTTPException(status_code=429, detail="Too many feedback submissions. Please try again later.")
    entry = {
        "timestamp":           str(datetime.datetime.now()),
        "symptoms":            request.symptoms,
        "predicted_condition": request.predicted_condition,
        "correct_condition":   request.correct_condition,
        "helpful":             request.helpful,
    }

    with open("logs/feedback.jsonl", "a") as f:
        f.write(json.dumps(entry) + "\n")

    return {
        "status":  "received",
        "message": "Thank you for your feedback. It helps improve the system."
    }


# -----------------------------------------------
# GET /emergency — Emergency numbers
# -----------------------------------------------

@router.get("/emergency")
def get_emergency_numbers():
    """
    Returns emergency contact numbers.
    """
    return {
        "emergency_numbers": EMERGENCY_NUMBERS,
        "message": "In case of emergency, call these numbers immediately."
    }