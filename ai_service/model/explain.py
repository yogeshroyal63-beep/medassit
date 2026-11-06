"""
explain.py - word-level explanations for triage predictions.

Method: occlusion. Remove one word at a time and measure how much the
probability of the predicted condition drops. A bigger drop means that word
mattered more to the prediction. It is model-agnostic, needs no gradients, and
costs one batched forward pass (len(words) + 1 texts).

This explains what the classifier reacted to. It does not prove medical
causation, and it is shown as such in the UI.
"""

import re
import time

from model import predictor
from model.emergency_rules import (
    EMERGENCY_KEYWORDS,
    EMERGENCY_COMBINATIONS,
    check_emergency,
)
from model.input_validator import validate_input
from model.severity_rules import get_severity
from model.specialty_mapper import get_specialty_full

MAX_WORDS = 40


def occlusion_importance(words, prob_fn):
    """
    words:   list[str]
    prob_fn: callable(list[str]) -> list[float]  probability of the reference
             class for each text (original text first, then one text per word
             with that word removed)

    Returns (base_prob, raw_drops, normalized) where raw_drops[i] is the
    probability lost when word i is removed (clipped at 0) and normalized is
    raw_drops scaled to 0..1 by the largest drop.
    """
    texts = [" ".join(words)] + [" ".join(words[:i] + words[i + 1:]) for i in range(len(words))]
    probs = prob_fn(texts)
    base = float(probs[0])
    raw = [max(0.0, base - float(p)) for p in probs[1:]]
    peak = max(raw) if raw else 0.0
    norm = [(r / peak) if peak > 0 else 0.0 for r in raw]
    return base, raw, norm


def _word_spans(text):
    return [(m.group(0), m.start(), m.end()) for m in re.finditer(r"\S+", text)]


def _matched_emergency_phrases(lower_text):
    phrases = [kw for kw in EMERGENCY_KEYWORDS if kw in lower_text]
    for a, b in EMERGENCY_COMBINATIONS:
        if a in lower_text and b in lower_text:
            phrases.extend([a, b])
    return phrases


def _emergency_tokens(cleaned):
    lower = cleaned.lower()
    phrases = _matched_emergency_phrases(lower)
    spans = []
    for ph in phrases:
        spans.extend((m.start(), m.end()) for m in re.finditer(re.escape(ph), lower))
    tokens = []
    for word, start, end in _word_spans(cleaned):
        hit = any(start < e and end > s for s, e in spans)
        tokens.append({"word": word, "importance": 1.0 if hit else 0.0, "drop": None})
    return tokens, sorted(set(phrases))


def explain(text, age=None):
    t0 = time.time()

    ok, cleaned = validate_input(text)
    if not ok:
        return {"status": "invalid_input", "message": cleaned, "tokens": [], "predictions": []}

    if check_emergency(cleaned):
        tokens, phrases = _emergency_tokens(cleaned)
        return {
            "status": "emergency",
            "mode": "rules",
            "message": "Emergency pattern detected by the rule engine. The classifier is bypassed on purpose.",
            "matched_rules": phrases,
            "tokens": tokens,
            "predictions": [],
            "latency_ms": round((time.time() - t0) * 1000, 1),
        }

    predictions = predictor.predict(cleaned)
    if not predictions:
        return {"status": "low_confidence", "tokens": [], "predictions": []}

    top = predictions[0]
    words = cleaned.split()[:MAX_WORDS]
    base, raw, norm = occlusion_importance(
        words, lambda texts: predictor.class_probabilities(texts, top["condition"])
    )

    tokens = [
        {"word": w, "importance": round(n, 3), "drop": round(r, 4)}
        for w, r, n in zip(words, raw, norm)
    ]

    parsed_age = None
    try:
        parsed_age = int(age) if age is not None else None
    except (TypeError, ValueError):
        parsed_age = None

    specialty = get_specialty_full(top["condition"])

    return {
        "status": "success",
        "mode": "bert" if predictor.MODEL_READY else "rules",
        "top_condition": top["condition"],
        "confidence": top["confidence"],
        "low_confidence": top["confidence"] < 0.5,
        "severity": get_severity(top["condition"], age=parsed_age),
        "specialty": {"primary": specialty["primary"], "secondary": specialty["secondary"]},
        "predictions": predictions,
        "tokens": tokens,
        "occlusion_passes": len(words) + 1,
        "latency_ms": round((time.time() - t0) * 1000, 1),
    }
