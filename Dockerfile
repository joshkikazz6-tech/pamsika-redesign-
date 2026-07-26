# ============================================================================
# Pa_mSikA — single-service production image
#
# Stage 1 builds the React/Vite frontend into static assets.
# Stage 2 installs the Python backend and copies the built frontend in, so
# FastAPI serves both the API (/api/v1/...) and the SPA from one process —
# matching the existing single-service Render deployment model.
#
# Build:  docker build -t pamsika .
# Run:    docker run -p 8000:8000 --env-file .env pamsika
# ============================================================================

# ── Stage 1: frontend build ─────────────────────────────────────────────────
FROM node:20-slim AS frontend-build

WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install --no-audit --no-fund

COPY frontend/ ./
RUN npm run build

# ── Stage 2: backend runtime ─────────────────────────────────────────────────
FROM python:3.11-slim

# Security: run as non-root
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps first (layer caching)
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend application
COPY backend/ .

# Copy the built frontend from stage 1 — main.py serves this directory
# (override with FRONTEND_DIST_DIR env var if you deploy it elsewhere).
COPY --from=frontend-build /frontend/dist /app/frontend_dist

# Create uploads directory and set full ownership to appuser BEFORE switching user
RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run migrations then start server
CMD alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 1
