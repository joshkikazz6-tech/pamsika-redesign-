# ============================================================================
# Pa_mSikA backend — API-only image (no bundled frontend).
#
# Use this if you're deploying the React frontend separately (e.g. Vercel,
# Netlify, Cloudflare Pages) and just need the FastAPI service. Point that
# separate frontend deployment's API base URL at wherever this container is
# hosted, and add its origin to ALLOWED_ORIGINS in your .env.
#
# For a single combined deploy (backend serves the built frontend from the
# same container/origin — no CORS needed), build the root-level Dockerfile
# instead: `docker build -t pamsika -f ../Dockerfile ..`
# ============================================================================
FROM python:3.11-slim

# Security: run as non-root
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend application only — no frontend_dist present, so main.py
# automatically runs in API-only mode (see app/main.py's frontend-serving
# section).
COPY . .

# Create uploads directory and set full ownership to appuser BEFORE switching user
RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run migrations then start server
CMD alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 1
