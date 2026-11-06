# ML (training and evaluation)

Training no longer happens on a local machine. Everything runs on Kaggle's GPU from one notebook.

| File | Purpose |
|------|---------|
| `kaggle_train_medassist.ipynb` | Regenerates the dataset, trains BioBERT / DistilBERT / PubMedBERT over several seeds, evaluates, writes `model-card.json`, optionally pushes the best model to Hugging Face |
| `generate_dataset.py` | Synthetic symptom-text generator used by the notebook |
| `results/` | Notebook outputs you commit (tables, plots, `eval_results.json`) |

## Run it
1. Kaggle -> New Notebook -> File -> Import Notebook -> choose `kaggle_train_medassist.ipynb`.
2. Settings: Accelerator = GPU, Internet = On.
3. Optional: Add Input -> `Symptom2Disease`, for an independent test set.
4. Set `QUICK = True` for a smoke test, then `False` for the full run (about an hour or two on a T4).
5. Save Version -> Save & Run All, then download the outputs.

## Put the results into the project
- `results/model-card.json` -> `backend/src/data/model-card.json` (shown at `/model-card`)
- the rest of `results/` -> `ml/results/`

## Switch the AI service to a new model
Push to a **new** Hugging Face repo (`PUSH_TO_HF = True`, secret `HF_TOKEN`), then set `HF_MODEL_ID=<repo>` on the AI service and redeploy. The old model keeps serving until you do.

## What the evaluation measures
- Accuracy on **held-out symptom combinations** (the honest number) next to a plain random split (inflated, because the generator repeats symptom sets across templates)
- A TF-IDF + Logistic Regression baseline and three transformer models, mean of several seeds
- An independent natural-language test set, if attached
- Calibration, selective prediction (accuracy when answering only confident cases), most-confused pairs
- The rule-based emergency check on hand-written phrases
- Single-query latency on CPU and GPU

The data is synthetic. None of this is clinical validation.
