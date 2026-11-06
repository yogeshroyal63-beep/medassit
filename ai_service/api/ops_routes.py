"""
ops_routes.py - warm-up, status and explainability endpoints.

All routes require the internal secret (same as /triage), so only the Node
backend can call them.
"""

from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from api.auth import verify_internal_secret
from api.warmup import start_warmup, get_status
from model.explain import explain

router = APIRouter()


class ExplainRequest(BaseModel):
    symptoms: str = Field(..., min_length=3, max_length=500)
    age: Optional[int] = Field(default=None, ge=0, le=120)


@router.get("/warmup", dependencies=[Depends(verify_internal_secret)])
def warmup():
    """Kick off background model loading and return immediately."""
    return start_warmup()


@router.get("/status", dependencies=[Depends(verify_internal_secret)])
def status():
    """Current warm-up phase and inference mode."""
    return get_status()


@router.post("/explain", dependencies=[Depends(verify_internal_secret)])
def explain_route(request: ExplainRequest):
    """Triage-style prediction plus word-level occlusion importance."""
    return explain(request.symptoms, age=request.age)
