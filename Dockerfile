# 🚀 Ultra-Fast Dockerfile for Render.com + Hugging Face
FROM python:3.11-slim

WORKDIR /app

# Install curl for health check
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Copy pre-built frontend
COPY frontend_dist/ ./dist/

EXPOSE 7860

# Use PORT env var (Render sets this automatically), fallback to 7860 for HF
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT:-7860} --workers 1"]