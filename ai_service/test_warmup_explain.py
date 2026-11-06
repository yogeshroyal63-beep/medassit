"""
Tests for warm-up, status and explain endpoints.

Runs without torch/transformers/GPU: the predictor falls back to rules, and the
occlusion logic is tested with a fake probability function.
"""
import os
import time

os.environ["MEDASSIST_EAGER_LOAD"] = "0"
os.environ.pop("AI_SERVICE_SECRET", None)

import pytest
from fastapi.testclient import TestClient

from api.main import app
from api import warmup
from model.explain import occlusion_importance, explain


@pytest.fixture(autouse=True)
def _fresh_state():
    warmup._reset_for_tests()
    yield


client = TestClient(app)


def test_occlusion_ranks_the_decisive_word_first():
    words = ["sneezing", "and", "runny", "nose"]

    def fake_probs(texts):
        # probability of the class is high only while "runny" is present
        return [0.9 if "runny" in t else 0.2 for t in texts]

    base, raw, norm = occlusion_importance(words, fake_probs)
    assert base == pytest.approx(0.9)
    assert norm[2] == pytest.approx(1.0)
    assert norm[0] == 0.0 and norm[1] == 0.0 and norm[3] == 0.0
    assert raw[2] == pytest.approx(0.7)


def test_occlusion_all_zero_when_nothing_matters():
    base, raw, norm = occlusion_importance(["a", "b"], lambda ts: [0.5 for _ in ts])
    assert raw == [0.0, 0.0] and norm == [0.0, 0.0]


def test_warmup_returns_immediately_and_reaches_a_ready_phase():
    t0 = time.time()
    r = client.get("/warmup")
    assert r.status_code == 200
    assert time.time() - t0 < 2
    assert r.json()["phase"] in ("warming", "ready", "ready_fallback")

    for _ in range(100):
        s = client.get("/status").json()
        if s["phase"] in ("ready", "ready_fallback"):
            break
        time.sleep(0.1)
    assert s["phase"] in ("ready", "ready_fallback")
    assert s["inference_mode"] in ("bert", "rule-based-fallback")
    assert "model_id" in s


def test_warmup_is_idempotent():
    a = client.get("/warmup").json()
    b = client.get("/warmup").json()
    assert a["started_at"] == b["started_at"] or b["phase"] != "idle"


def test_explain_success_shape_in_fallback_mode():
    r = client.post("/explain", json={"symptoms": "I have a bad cough and a sore throat for two days"})
    assert r.status_code == 200
    d = r.json()
    assert d["status"] == "success"
    assert d["tokens"] and all({"word", "importance", "drop"} <= set(t) for t in d["tokens"])
    assert 0.0 <= max(t["importance"] for t in d["tokens"]) <= 1.0
    assert d["predictions"][0]["condition"] == d["top_condition"]
    assert d["occlusion_passes"] == len(d["tokens"]) + 1


def test_explain_emergency_bypasses_classifier():
    d = client.post("/explain", json={"symptoms": "I have chest pain and sweating"}).json()
    assert d["status"] == "emergency"
    assert d["mode"] == "rules"
    assert d["predictions"] == []
    assert any(t["importance"] == 1.0 for t in d["tokens"])
    assert "chest pain" in d["matched_rules"]


def test_explain_rejects_too_short_and_too_long():
    assert client.post("/explain", json={"symptoms": "hi"}).status_code == 422
    assert client.post("/explain", json={"symptoms": "x" * 501}).status_code == 422


def test_explain_invalid_input_is_reported_not_crashed():
    d = explain("<script>alert(1)</script>")
    assert d["status"] in ("invalid_input", "success", "emergency", "low_confidence")


def test_secret_is_enforced_when_configured(monkeypatch):
    import api.auth as auth
    monkeypatch.setattr(auth, "_SECRET", "s3cret")
    assert client.get("/warmup").status_code == 403
    assert client.get("/warmup", headers={"x-internal-secret": "s3cret"}).status_code == 200


def test_existing_health_and_triage_still_work():
    assert client.get("/health").json()["status"] == "ok"
    r = client.post("/triage", json={"symptoms": "fever and headache since two days", "age": 30})
    assert r.status_code == 200 and "status" in r.json()
