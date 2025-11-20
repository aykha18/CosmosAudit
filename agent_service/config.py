import os
import logging
from typing import Optional
import re


class Config:
    # Required environment variables
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    # Optional environment variables with defaults
    VECTOR_DB_URL: Optional[str] = os.getenv("VECTOR_DB_URL")
    ARTIFACTS_DIR: str = os.getenv("ARTIFACTS_DIR", "./artifacts")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    # Derived configurations
    LOG_LEVEL_VALUE: int = getattr(logging, LOG_LEVEL.upper(), logging.INFO)

    @classmethod
    def validate(cls) -> None:
        """Validate required configuration on startup."""
        if not cls.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY environment variable is required")

        # Validate log level
        if not hasattr(logging, cls.LOG_LEVEL.upper()):
            raise ValueError(f"Invalid LOG_LEVEL: {cls.LOG_LEVEL}")

        # Ensure artifacts directory is valid
        if not cls.ARTIFACTS_DIR:
            raise ValueError("ARTIFACTS_DIR cannot be empty")

    @staticmethod
    def redact_secrets(text: str) -> str:
        """
        Redact sensitive information from text for logging.
        Masks API keys, private keys, and other secrets.
        """
        if not text:
            return text

        # Redact OpenAI API key (starts with sk- followed by many chars)
        text = re.sub(r'sk-[a-zA-Z0-9_-]{20,}', 'sk-***REDACTED***', text)

        # Redact generic hex strings that look like private keys (64+ chars)
        text = re.sub(r'\b[a-fA-F0-9]{64,}\b', '***REDACTED***', text)

        # Redact common secret patterns
        text = re.sub(r'(?i)(api[_-]?key|secret|token|password)[\'"]?\s*[:=]\s*[\'"]([^\'"]+)[\'"]',
                      r'\1: "***REDACTED***"', text)

        return text

    @staticmethod
    def setup_logging() -> None:
        """Configure logging for the agent service."""
        logging.basicConfig(
            level=Config.LOG_LEVEL_VALUE,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.StreamHandler(),
                logging.FileHandler(os.path.join(Config.ARTIFACTS_DIR, 'agent.log'), mode='a')
            ]
        )

        # Ensure artifacts directory exists
        os.makedirs(Config.ARTIFACTS_DIR, exist_ok=True)


# Validate configuration on import (skip in test environment)
import sys
if "pytest" not in sys.modules:
    Config.validate()