import os
os.environ.pop("SSL_CERT_FILE", None)

import argparse
import os

import pandas as pd
import torch
import joblib

from datasets import Dataset
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from transformers import TrainingArguments, Trainer, EarlyStoppingCallback
from transformers.trainer_utils import get_last_checkpoint

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, precision_recall_fscore_support


# -----------------------------------------------
# CLI / CONFIG
# -----------------------------------------------

parser = argparse.ArgumentParser(description="Train or resume the MedAssist triage model.")
parser.add_argument("--output_dir", default="saved_model", help="Directory to save model checkpoints")
parser.add_argument("--resume_from_checkpoint", default=None,
                    help="Path to checkpoint to resume from, or 'latest' to resume from the latest checkpoint")
parser.add_argument("--epochs", type=int, default=4, help="Number of training epochs")
parser.add_argument("--batch_size", type=int, default=16, help="Training batch size")
parser.add_argument("--learning_rate", type=float, default=2e-5, help="Learning rate")
parser.add_argument("--max_length", type=int, default=128, help="Max token length")
parser.add_argument("--model_name", default="monologg/biobert_v1.1_pubmed", help="Pretrained model name")
parser.add_argument("--data_path", default="dataset/triage_dataset.csv", help="Path to training dataset")
args = parser.parse_args()

MODEL_NAME = args.model_name
DATA_PATH = args.data_path

# RTX 3050 optimized settings
BATCH_SIZE = args.batch_size
MAX_LENGTH = args.max_length
EPOCHS = args.epochs
LEARNING_RATE = args.learning_rate

# -----------------------------------------------
# CUDA Check
# -----------------------------------------------

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

if torch.cuda.is_available():
    print(f"GPU: {torch.cuda.get_device_name(0)}")
    print(f"GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB")


# -----------------------------------------------
# Load Dataset
# -----------------------------------------------

print("Loading dataset...")
df = pd.read_csv(DATA_PATH)
print(f"Total samples: {len(df)}")
print(f"Conditions: {df['label'].nunique()}")
print(df['label'].value_counts())


# -----------------------------------------------
# Encode Labels
# -----------------------------------------------

label_encoder = LabelEncoder()
df["label"] = label_encoder.fit_transform(df["label"])

os.makedirs(args.output_dir, exist_ok=True)
joblib.dump(label_encoder, os.path.join(args.output_dir, "label_encoder.pkl"))
print(f"Label encoder saved. Classes: {list(label_encoder.classes_)}")


# -----------------------------------------------
# Train / Validation / Test Split
# -----------------------------------------------

train_df, temp_df = train_test_split(
    df,
    test_size=0.15,
    stratify=df["label"],
    random_state=42
)

val_df, test_df = train_test_split(
    temp_df,
    test_size=0.5,
    stratify=temp_df["label"],
    random_state=42
)

print(f"Train: {len(train_df)} | Val: {len(val_df)} | Test: {len(test_df)}")


# -----------------------------------------------
# Convert to HuggingFace Dataset
# -----------------------------------------------

train_dataset = Dataset.from_pandas(train_df.reset_index(drop=True))
val_dataset   = Dataset.from_pandas(val_df.reset_index(drop=True))
test_dataset  = Dataset.from_pandas(test_df.reset_index(drop=True))


# -----------------------------------------------
# Tokenizer
# -----------------------------------------------

print("Loading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, use_fast=False)


def tokenize(example):
    return tokenizer(
        example["text"],
        truncation=True,
        padding="max_length",
        max_length=MAX_LENGTH
    )


print("Tokenizing datasets...")
train_dataset = train_dataset.map(tokenize, batched=True, remove_columns=["text"])
val_dataset   = val_dataset.map(tokenize, batched=True, remove_columns=["text"])
test_dataset  = test_dataset.map(tokenize, batched=True, remove_columns=["text"])


# -----------------------------------------------
# Rename label column
# -----------------------------------------------

train_dataset = train_dataset.rename_column("label", "labels")
val_dataset   = val_dataset.rename_column("label", "labels")
test_dataset  = test_dataset.rename_column("label", "labels")

train_dataset.set_format("torch")
val_dataset.set_format("torch")
test_dataset.set_format("torch")


# -----------------------------------------------
# Load Model
# -----------------------------------------------

print("Loading model...")
model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_NAME,
    num_labels=len(label_encoder.classes_)
)

model.to(device)


# -----------------------------------------------
# Metrics
# -----------------------------------------------

def compute_metrics(pred):
    labels = pred.label_ids
    preds  = pred.predictions.argmax(-1)

    precision, recall, f1, _ = precision_recall_fscore_support(
        labels, preds, average="weighted"
    )
    acc = accuracy_score(labels, preds)

    return {
        "accuracy":  acc,
        "f1":        f1,
        "precision": precision,
        "recall":    recall
    }


# -----------------------------------------------
# Training Arguments
# -----------------------------------------------

use_cuda = torch.cuda.is_available()

training_args = TrainingArguments(

    output_dir="saved_model",

    per_device_train_batch_size=BATCH_SIZE,
    per_device_eval_batch_size=BATCH_SIZE,

    num_train_epochs=EPOCHS,

    learning_rate=LEARNING_RATE,
    weight_decay=0.01,
    warmup_ratio=0.1,

    evaluation_strategy="epoch",
    save_strategy="epoch",

    load_best_model_at_end=True,
    metric_for_best_model="f1",
    greater_is_better=True,

    logging_steps=100,
    logging_dir="logs/training",

    fp16=use_cuda,
    fp16_full_eval=use_cuda,

    # Gradient accumulation — effective batch = 16 * 2 = 32
    gradient_accumulation_steps=2,

    # Save disk space
    save_total_limit=2,

    report_to="none",

    dataloader_num_workers=0,
    dataloader_pin_memory=use_cuda,
)


# -----------------------------------------------
# Trainer with Early Stopping
# -----------------------------------------------

trainer = Trainer(

    model=model,
    args=training_args,

    train_dataset=train_dataset,
    eval_dataset=val_dataset,

    compute_metrics=compute_metrics,

    callbacks=[
        EarlyStoppingCallback(early_stopping_patience=2)
    ]
)


# -----------------------------------------------
# Train
# -----------------------------------------------

print("=" * 50)
print("Starting training...")
print(f"  Model: {MODEL_NAME}")
print(f"  Conditions: {len(label_encoder.classes_)}")
print(f"  Train samples: {len(train_dataset)}")
print(f"  Batch size: {BATCH_SIZE}")
print(f"  Epochs: {EPOCHS}")
print(f"  Device: {device}")
print(f"  fp16: {use_cuda}")
print("=" * 50)

resume_checkpoint = None
if args.resume_from_checkpoint:
    if args.resume_from_checkpoint.lower() == "latest":
        resume_checkpoint = get_last_checkpoint(args.output_dir)
    else:
        resume_checkpoint = args.resume_from_checkpoint
    print(f"Resuming from checkpoint: {resume_checkpoint}")

trainer.train(resume_from_checkpoint=resume_checkpoint)


# -----------------------------------------------
# Evaluate on test set
# -----------------------------------------------

print("\nEvaluating on test set...")
results = trainer.evaluate(test_dataset)
print("Test Results:")
for k, v in results.items():
    print(f"  {k}: {v:.4f}" if isinstance(v, float) else f"  {k}: {v}")


# -----------------------------------------------
# Save Final Model
# -----------------------------------------------

final_model_dir = os.path.join(args.output_dir, "final_model")
trainer.save_model(final_model_dir)
tokenizer.save_pretrained(final_model_dir)

print("\n" + "=" * 50)
print("Training completed successfully!")
print("Model saved to: saved_model/final_model")
print(f"Conditions trained: {len(label_encoder.classes_)}")
print("=" * 50)