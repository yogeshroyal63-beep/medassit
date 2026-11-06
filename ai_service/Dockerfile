FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt \
    -f https://download.pytorch.org/whl/cpu/torch_stable.html

RUN pip install --no-cache-dir huggingface_hub

# Bake model into Docker image at build time so restarts are instant
ARG HF_TOKEN
ARG HF_MODEL_ID=saiyogesh/medassist-bert
ENV HF_MODEL_ID=${HF_MODEL_ID}
RUN HF_TOKEN=${HF_TOKEN} python -c "\
import os; \
from transformers import AutoModelForSequenceClassification, AutoTokenizer; \
from huggingface_hub import hf_hub_download; \
token = os.environ.get('HF_TOKEN') or None; \
mid = os.environ['HF_MODEL_ID']; \
AutoModelForSequenceClassification.from_pretrained(mid, token=token); \
AutoTokenizer.from_pretrained(mid, token=token); \
hf_hub_download(repo_id=mid, filename='label_encoder.pkl', token=token)"

COPY api/ ./api/
COPY model/ ./model/

EXPOSE 8000

CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]