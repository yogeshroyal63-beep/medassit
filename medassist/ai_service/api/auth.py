"""
Inter-service authentication for the AI triage API.

The Node.js backend attaches X-Internal-Secret on every internal call.
Requests without a matching secret are rejected with 403.

Set AI_SERVICE_SECRET to the same value as the backend's AI_SERVICE_SECRET
environment variable. Leave blank in local dev to disable the check.
"""

import os
from fastapi import Request, HTTPException

_SECRET = os.getenv("AI_SERVICE_SECRET", "")


def verify_internal_secret(request: Request):
    """
    FastAPI dependency — validates the shared secret on every request.
    If AI_SERVICE_SECRET is not configured (local dev), the check is skipped.
    """
    if not _SECRET:
        return  # secret not configured — skip in dev
    incoming = request.headers.get("x-internal-secret", "")
    if incoming != _SECRET:
        raise HTTPException(status_code=403, detail="Forbidden — invalid internal secret")
