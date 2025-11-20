from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import time
from typing import Dict, Any
from datetime import datetime, timedelta
import asyncio
from collections import defaultdict

try:
    # Try relative imports (when run as module)
    from .schemas import AuditRequest, AuditResult
    from .agent_core import AgentRunner
    from .config import Config
except ImportError:
    # Fall back to absolute imports (when run as script)
    from schemas import AuditRequest, AuditResult
    from agent_core import AgentRunner
    from config import Config

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

# Configure logging
logging.basicConfig(
    level=getattr(logging, Config.LOG_LEVEL.upper(), logging.INFO),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="CosmoAudit Agent Service",
    description="AI-powered smart contract security audit service",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting (simple in-memory implementation)
rate_limit_store: Dict[str, list] = defaultdict(list)
RATE_LIMIT_REQUESTS = 10  # requests
RATE_LIMIT_WINDOW = 60  # seconds


async def rate_limit_middleware(request: Request, call_next):
    """Simple rate limiting middleware."""
    client_ip = request.client.host if request.client else "unknown"

    # Clean old requests
    now = time.time()
    rate_limit_store[client_ip] = [
        timestamp for timestamp in rate_limit_store[client_ip]
        if now - timestamp < RATE_LIMIT_WINDOW
    ]

    # Check rate limit
    if len(rate_limit_store[client_ip]) >= RATE_LIMIT_REQUESTS:
        return JSONResponse(
            status_code=429,
            content={"error": "Rate limit exceeded. Try again later."}
        )

    # Add current request
    rate_limit_store[client_ip].append(now)

    response = await call_next(request)
    return response


@app.middleware("http")
async def add_rate_limiting(request: Request, call_next):
    return await rate_limit_middleware(request, call_next)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests."""
    start_time = time.time()

    logger.info(f"Request: {request.method} {request.url} from {request.client.host if request.client else 'unknown'}")

    response = await call_next(request)

    process_time = time.time() - start_time
    logger.info(f"Response: {response.status_code} in {process_time:.3f}s")

    return response


# Dependency to get AgentRunner instance
def get_agent_runner() -> AgentRunner:
    """Dependency injection for AgentRunner."""
    return AgentRunner()


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "cosmoaudit-agent"
    }


@app.post("/api/v1/audit", response_model=AuditResult)
async def run_audit(
    request: AuditRequest,
    agent_runner: AgentRunner = Depends(get_agent_runner)
) -> AuditResult:
    """
    Run a comprehensive smart contract security audit.

    This endpoint accepts an audit request for either repository analysis
    or direct contract file analysis, orchestrates the analysis workflow,
    and returns the results including findings, explanations, and a report URL.
    """
    try:
        if request.analysis_type == "repo":
            logger.info(f"Starting repository audit: {request.repo_url}")
            # Validate repository request
            if not request.contract_paths:
                raise HTTPException(
                    status_code=400,
                    detail="At least one contract path must be specified for repository analysis"
                )
        elif request.analysis_type == "files":
            logger.info(f"Starting file-based audit with {len(request.contract_files or [])} contracts")
            # Validate file request
            if not request.contract_files:
                raise HTTPException(
                    status_code=400,
                    detail="At least one contract file must be provided for file analysis"
                )
        else:
            raise HTTPException(
                status_code=400,
                detail="Invalid analysis_type. Must be 'repo' or 'files'"
            )

        # Run the audit
        start_time = time.time()
        result = await asyncio.get_event_loop().run_in_executor(
            None,  # Use default executor
            agent_runner.run_audit,
            request
        )
        duration = time.time() - start_time

        logger.info(f"Audit completed in {duration:.2f}s with {result.summary.findings_count} findings")

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Audit failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Audit execution failed: {str(e)}"
        )


@app.get("/api/v1/audit/{run_id}")
async def get_audit_status(run_id: str):
    """
    Get the status of a running or completed audit.

    Note: This is a placeholder for future implementation with audit tracking.
    """
    # For now, return a placeholder response
    # In production, this would query a database or cache for audit status
    return {
        "run_id": run_id,
        "status": "unknown",
        "message": "Audit status tracking not yet implemented"
    }


@app.on_event("startup")
async def startup_event():
    """Application startup tasks."""
    logger.info("CosmoAudit Agent Service starting up")
    logger.info(f"Artifacts directory: {Config.ARTIFACTS_DIR}")
    logger.info(f"Log level: {Config.LOG_LEVEL}")


@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown tasks."""
    logger.info("CosmoAudit Agent Service shutting down")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )