# falkordb-demo backend. Build context is the repo root (see docker-compose.yml).
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /srv

# Dependencies first, so code changes do not reinstall them. graphrag-sdk needs hnswlib, which
# ships only as source, so a C++ compiler is installed for this step and removed in the same layer.
COPY requirements.txt .
RUN apt-get update \
    && apt-get install -y --no-install-recommends g++ \
    && pip install -r requirements.txt \
    && apt-get purge -y g++ \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

COPY app/__init__.py app/__main__.py ./app/
COPY app/backend ./app/backend
COPY data ./data

# /srv/models holds the embedding model; creating it here makes the volume owned by "demo".
RUN useradd --create-home demo && mkdir -p /srv/models && chown -R demo /srv
USER demo

EXPOSE 8000
CMD ["python", "-m", "app", "--host", "0.0.0.0", "--port", "8000"]
