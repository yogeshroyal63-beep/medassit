"""
download_model.py — Cold-start model downloader for MedAssist AI service.

Downloads a pretrained BioBERT checkpoint from HuggingFace Hub when no
locally fine-tuned model is present. This lets new contributors run the
full stack without training from scratch.

Usage:
    python ai_service/scripts/download_model.py
    python ai_service/scripts/download_model.py --force   # re-download even if present

The script writes the model files to ai_service/saved_model/ which is
.gitignored. The production fine-tuned weights are never committed.
"""

import argparse
import os
import sys

SAVE_DIR = os.path.join(os.path.dirname(__file__), "..", "saved_model")

# Pretrained checkpoint to use as a cold-start fallback.
# This is a lightweight BioBERT model suitable for medical text classification.
PRETRAINED_MODEL = "dmis-lab/biobert-base-cased-v1.2"


def download(force: bool = False) -> None:
    try:
        from transformers import AutoTokenizer, AutoModel
    except ImportError:
        print("ERROR: 'transformers' package not found. Run: pip install transformers torch", file=sys.stderr)
        sys.exit(1)

    abs_save = os.path.abspath(SAVE_DIR)

    if not force and os.path.isdir(abs_save) and os.listdir(abs_save):
        print(f"Model already exists at {abs_save}. Use --force to re-download.")
        return

    print(f"Downloading pretrained checkpoint: {PRETRAINED_MODEL}")
    print(f"Destination: {abs_save}")
    print("This may take a few minutes on first run …\n")

    os.makedirs(abs_save, exist_ok=True)

    tokenizer = AutoTokenizer.from_pretrained(PRETRAINED_MODEL)
    model = AutoModel.from_pretrained(PRETRAINED_MODEL)

    tokenizer.save_pretrained(abs_save)
    model.save_pretrained(abs_save)

    print(f"\nDone. Model files saved to {abs_save}")
    print("NOTE: This is the base pretrained checkpoint, not the fine-tuned production model.")
    print("      Run ai_service/training/train_bert.py to fine-tune on the symptom dataset.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Download pretrained BioBERT checkpoint")
    parser.add_argument("--force", action="store_true", help="Re-download even if model already exists")
    args = parser.parse_args()
    download(force=args.force)
