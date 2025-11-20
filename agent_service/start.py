#!/usr/bin/env python3
"""
Simple startup script for the agent service.
"""
import sys
import os
sys.path.insert(0, '.')

from app import app
import uvicorn

if __name__ == "__main__":
    print("Starting CosmoAudit Agent Service...")
    print(f"Current working directory: {os.getcwd()}")
    print(f"Python path: {sys.path}")
    print("App imported successfully")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")