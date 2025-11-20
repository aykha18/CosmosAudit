# Railway Deployment Guide

## Overview

CosmoAudit consists of three services that need to be deployed:
1. **Frontend + Backend** (Node.js/Express + React) - Main web application
2. **Agent Service** (Python/FastAPI) - AI-powered audit engine
3. **PostgreSQL Database** - Data persistence

## Prerequisites
- Railway account
- PostgreSQL database provisioned on Railway

## Service 1: Frontend + Backend (Node.js)

### Environment Variables

Set these in Railway dashboard for the main service:

```
DATABASE_URL=<your-railway-postgres-url>
NODE_ENV=production
PORT=8080
AGENT_SERVICE_URL=<agent-service-url>  # e.g., https://cosmoaudit-agent.up.railway.app
```

### Deployment Steps

1. Connect your GitHub repository to Railway
2. Railway will automatically detect this as a Node.js project
3. Set environment variables above
4. Deploy!

Railway will automatically:
- Install dependencies (`npm install`)
- Build the React app (`npm run build`)
- Start the server (`npm start`)

## Service 2: Agent Service (Python)

### Environment Variables

Create a **separate service** in Railway for the agent service:

```
OPENAI_API_KEY=<your-openai-api-key>
ARTIFACTS_DIR=/app/artifacts
LOG_LEVEL=INFO
```

### Deployment Steps for Agent Service

1. In Railway dashboard, click **"New Service"** → **"GitHub"**
2. Select the same repository
3. **Important**: Override the build command and set custom configuration:
   - **Build Command**: `docker build -t agent .`
   - **Start Command**: `docker run -p 8000:8000 agent`
   - Or use the Dockerfile in the root directory

4. Set the environment variables above
5. Deploy the agent service

### Alternative: Manual Docker Deployment

If Railway doesn't auto-detect the Dockerfile:

```bash
# Railway will use the Dockerfile in the root
# Make sure these environment variables are set in Railway:
OPENAI_API_KEY=your-key-here
ARTIFACTS_DIR=/app/artifacts
LOG_LEVEL=INFO
```

## Service 3: PostgreSQL Database

1. Add PostgreSQL service in Railway dashboard
2. Copy the `DATABASE_URL` to both services

## Network Configuration

- **Main Service** (Frontend/Backend): Runs on port 8080
- **Agent Service**: Runs on port 8000
- Make sure the main service can reach the agent service via `AGENT_SERVICE_URL`

## Troubleshooting

### "Application failed to respond"

1. **Check deploy logs** in Railway dashboard
2. **Verify environment variables** are set correctly
3. **Check service connectivity** between main app and agent service
4. **Verify Docker build** works locally first

### Agent Service Issues

1. **Missing dependencies**: Check if all Python packages installed
2. **Import errors**: Verify PYTHONPATH is set correctly
3. **API key**: Ensure OPENAI_API_KEY is set (agent works without it but AI features disabled)

### Health Checks

- Main service: `GET /health`
- Agent service: `GET /health` (on port 8000)

## Build Process

### Main Service (Node.js)
1. `npm install` - Installs all dependencies
2. `npm run build` - Builds React frontend to `/build` directory
3. `npm start` - Starts Express server which serves the built React app

### Agent Service (Python)
1. `pip install -r requirements.txt` - Installs Python dependencies
2. `python agent_service/start.py` - Starts FastAPI server

## Notes

- The main server runs on port 8080 (or PORT env variable)
- Agent service runs on port 8000
- Backend serves the built React app in production mode
- Database tables are created automatically on first run
- CORS is enabled for all origins
- Agent service requires OpenAI API key for AI features (optional)
