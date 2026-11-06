"""
warmup.py - background model warm-up for the AI service.

On a free-tier host the container sleeps when idle. Booting it and loading a
BERT model takes tens of seconds. This module loads the model in a background
thread (kicked off at startup and by GET /warmup) and exposes the state, so the
backend can wake everything the moment a user opens the login page instead of
waiting for their first triage request.

Phases:  idle -> warming -> ready | ready_fallback
  ready           BERT model loaded and has run one dummy forward pass
  ready_fallback  model could not be loaded; rule-based fallback is active
"""

import threading
import time

_lock = threading.Lock()
_RETRY_AFTER_SECONDS = 60

_state = {
    "phase": "idle",
    "started_at": None,
    "finished_at": None,
    "load_seconds": None,
    "error": None,
}


def _snapshot():
    from model import predictor

    snap = dict(_state)
    snap["model_ready"] = bool(predictor.MODEL_READY)
    snap["inference_mode"] = "bert" if predictor.MODEL_READY else "rule-based-fallback"
    snap["model_id"] = predictor.HF_MODEL_ID
    snap["now"] = time.time()
    return snap


def _run():
    from model import predictor

    t0 = time.time()
    try:
        ok = predictor._bootstrap()
        if ok:
            # One dummy pass so the first real request does not pay for lazy init.
            predictor.predict("fever and headache for two days")
        phase = "ready" if ok else "ready_fallback"
        err = None if ok else predictor.LOAD_ERROR
    except Exception as exc:  # noqa: BLE001
        phase, err = "ready_fallback", f"{type(exc).__name__}: {exc}"[:300]

    with _lock:
        _state.update(
            phase=phase,
            finished_at=time.time(),
            load_seconds=round(time.time() - t0, 2),
            error=err,
        )


def start_warmup():
    """Start warming in the background if needed. Returns the current state immediately."""
    with _lock:
        phase = _state["phase"]
        finished = _state["finished_at"]

        retry = (
            phase == "ready_fallback"
            and finished is not None
            and time.time() - finished > _RETRY_AFTER_SECONDS
        )
        if phase == "idle" or retry:
            if retry:
                from model import predictor
                predictor.reset_for_retry()
            _state.update(phase="warming", started_at=time.time(), finished_at=None, error=None)
            threading.Thread(target=_run, name="model-warmup", daemon=True).start()

    return _snapshot()


def get_status():
    return _snapshot()


def _reset_for_tests():
    with _lock:
        _state.update(phase="idle", started_at=None, finished_at=None, load_seconds=None, error=None)
