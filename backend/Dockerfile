# Multi-stage build for BeeYield Backend
FROM python:3.11-slim AS builder

WORKDIR /app

# Install build dependencies and apply security patches
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies to /install
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --upgrade "pip>=26.0" "setuptools>=84.0.0" "wheel>=0.48.0" && \
    pip install --prefix=/install --no-warn-script-location --upgrade "setuptools>=84.0.0" "wheel>=0.48.0" "msgpack>=1.1.0" -r requirements.txt

# Production stage
FROM python:3.11-slim

WORKDIR /app

# Install runtime dependencies, apply security patches, and upgrade base python tooling
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
        libpq5 && \
    rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Ensure patched runtime libraries, then purge build and packaging tools (pip, setuptools, wheel)
# This completely eliminates all pip CVEs (#341, #342, #343, #344, #345, #392), setuptools CVEs, and wheel CVEs from the runtime image
RUN pip install --upgrade --no-cache-dir "msgpack>=1.1.0" && \
    pip uninstall -y pip setuptools wheel && \
    rm -rf /usr/local/lib/python3.11/site-packages/pip* \
           /usr/local/lib/python3.11/site-packages/setuptools* \
           /usr/local/lib/python3.11/site-packages/wheel* \
           /usr/local/bin/pip* \
           /root/.cache

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/', timeout=5)"

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
