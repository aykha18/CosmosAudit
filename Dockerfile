# Multi-stage build for CosmoAudit Agent Service
# Stage 1: Builder stage for Python dependencies
FROM python:3.11-slim as builder

# Install system dependencies for building Python packages
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Runtime stage
FROM python:3.11-slim

# Install runtime system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash app \
    && mkdir -p /app \
    && chown -R app:app /app

# Switch to non-root user
USER app

# Copy Python packages from builder stage
COPY --from=builder /root/.local /home/app/.local

# Add local Python packages to PATH
ENV PATH=/home/app/.local/bin:$PATH

# Copy application code
COPY agent_service/ ./agent_service/

# Set working directory to agent_service
WORKDIR /app/agent_service

# Set Python path to include parent directory for relative imports
ENV PYTHONPATH=/app

# Create artifacts directory
RUN mkdir -p /app/artifacts

# Set default environment variables (can be overridden)
ENV OPENAI_API_KEY=""
ENV ARTIFACTS_DIR="/app/artifacts"
ENV LOG_LEVEL="INFO"

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start the application
CMD ["python", "start.py"]