import os


def _show_model_source():
    """
    The BERT model is no longer trained or stored locally. It is loaded from the
    Hugging Face Hub (HF_MODEL_ID, default saiyogesh/medassist-bert) and trained on
    Kaggle using ml/kaggle_train_medassist.ipynb. If it cannot be loaded, the
    service stays up in rule-based fallback mode.
    """
    model_id = os.getenv("HF_MODEL_ID", "saiyogesh/medassist-bert")
    print(f"Model source: Hugging Face Hub -> {model_id}")
    if not os.getenv("HF_TOKEN"):
        print("HF_TOKEN is not set. That is fine for a public model; set it for a private one.\n")


if __name__ == "__main__":
    _show_model_source()
    os.system("uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload")
