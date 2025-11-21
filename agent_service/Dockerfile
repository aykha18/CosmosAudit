# Dockerfile for CosmoAudit Agent Service
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd --create-home --shell /bin/bash app \
    && mkdir -p /app \
    && chown -R app:app /app

# Switch to non-root user
USER app

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --user -r requirements.txt

# Copy application code
COPY . .

# Create artifacts directory
RUN mkdir -p artifacts

# Set environment variables
ENV PYTHONPATH=/app
ENV ARTIFACTS_DIR=/app/artifacts
ENV LOG_LEVEL=INFO

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start the application
CMD ["python", "start.py"]