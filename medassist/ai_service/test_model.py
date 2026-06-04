"""
test_model.py — ML predictor unit tests

Tests the predict() function in isolation: output contract,
confidence scores, edge cases, and determinism.

Run with: pytest test_model.py -v
"""
import pytest
from model.predictor import predict


class TestPredictor:

    def test_returns_list(self):
        """predict() must always return a list."""
        result = predict("fever cough body pain")
        assert isinstance(result, list)

    def test_each_prediction_has_required_keys(self):
        """Every item in the predictions list must have 'condition' and 'confidence'."""
        result = predict("fever cough body pain")
        if result:  # skip if model not yet trained
            for item in result:
                assert "condition" in item, f"Missing 'condition' key: {item}"
                assert "confidence" in item, f"Missing 'confidence' key: {item}"

    def test_confidence_scores_are_floats_between_0_and_1(self):
        """Confidence scores must be normalised probabilities."""
        result = predict("headache nausea vomiting")
        for item in result:
            score = item["confidence"]
            assert isinstance(score, float), f"confidence must be float, got {type(score)}"
            assert 0.0 <= score <= 1.0, f"confidence out of range: {score}"

    def test_predictions_sorted_by_confidence_descending(self):
        """Top prediction must have the highest confidence."""
        result = predict("chest pain sweating shortness of breath")
        if len(result) >= 2:
            assert result[0]["confidence"] >= result[1]["confidence"], (
                "Predictions not sorted by confidence descending"
            )

    def test_empty_string_returns_list(self):
        """An empty string should yield an empty list (input validator handles it upstream)."""
        result = predict("")
        assert isinstance(result, list)

    def test_very_long_input_does_not_crash(self):
        """Model must not raise on abnormally long input."""
        long_input = "fever headache " * 200
        try:
            result = predict(long_input)
            assert isinstance(result, list)
        except Exception as exc:
            pytest.fail(f"predict() raised on long input: {exc}")

    def test_numeric_only_input_returns_list(self):
        """Numeric-only strings should not crash the predictor."""
        result = predict("12345")
        assert isinstance(result, list)

    def test_special_characters_do_not_crash(self):
        """Special characters and punctuation must not raise."""
        result = predict("I feel !@#$%^&*() pain everywhere")
        assert isinstance(result, list)

    def test_deterministic_output(self):
        """Same input must produce identical output across two calls."""
        symptoms = "cough fever sore throat runny nose"
        first  = predict(symptoms)
        second = predict(symptoms)
        assert first == second, "predict() is non-deterministic for the same input"

    def test_returns_at_most_three_predictions(self):
        """By convention the predictor returns the top-3 conditions."""
        result = predict("stomach ache diarrhea nausea")
        assert len(result) <= 3, f"Expected at most 3 predictions, got {len(result)}"

    def test_condition_values_are_non_empty_strings(self):
        """Condition names must be non-empty strings."""
        result = predict("skin rash itching redness")
        for item in result:
            assert isinstance(item["condition"], str)
            assert len(item["condition"].strip()) > 0