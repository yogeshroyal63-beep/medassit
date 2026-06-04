import os
import sys


def _warn_if_model_missing():
    """
    Warn (but do NOT exit) if the trained model files are absent.
    The service is designed to run in rule-based fallback mode without a model —
    exiting here defeats that design.  A warning is sufficient.
    """
    base = os.path.dirname(os.path.abspath(__file__))
    model_dir = os.path.join(base, "saved_model", "final_model")
    encoder_path = os.path.join(base, "saved_model", "label_encoder.pkl")

    missing = []
    if not os.path.isdir(model_dir):
        missing.append(model_dir)
    if not os.path.isfile(encoder_path):
        missing.append(encoder_path)

    if missing:
        print("WARNING: Trained BERT model files not found. Starting in rule-based fallback mode.\n")
        print("To enable BERT inference, place the trained model here:")
        for path in missing:
            print(f"  - {path}")
        print()


if __name__ == "__main__":
    _warn_if_model_missing()   # warn only — do NOT sys.exit
    os.system("uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload")
