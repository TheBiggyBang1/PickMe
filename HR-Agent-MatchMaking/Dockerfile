# syntax=docker/dockerfile:1.4
FROM python:3.11-slim

WORKDIR /app

COPY src/backend/requirements.txt .
# Pin a compatible huggingface_hub before installing sentence-transformers
# to avoid API incompatibilities (cached_download import errors).
# Use BuildKit cache mount for pip to speed repeated builds.
RUN --mount=type=cache,target=/root/.cache/pip \
	# Preinstall CPU torch + compatible huggingface-hub and sentence-transformers
	# to ensure deterministic, compatible versions inside the image (this makes the
	# build slower but avoids fragile runtime installs and mismatched hub APIs).
	pip install --no-cache-dir --prefer-binary torch --index-url https://download.pytorch.org/whl/cpu && \
	pip install --no-cache-dir "huggingface-hub==0.13.4" "sentence-transformers==2.2.2"
RUN --mount=type=cache,target=/root/.cache/pip \
	pip install --no-cache-dir -r requirements.txt

COPY src/ /app/src/
COPY models/ /app/models/

ENV PYTHONPATH=/app

CMD ["uvicorn", "src.backend.api.app:app", "--host", "0.0.0.0", "--port", "8000"]
