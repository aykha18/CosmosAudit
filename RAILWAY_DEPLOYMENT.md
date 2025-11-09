# Railway Deployment Guide

## Prerequisites
- Railway account
- PostgreSQL database provisioned on Railway

## Environment Variables

Set these in Railway dashboard:

```
DATABASE_URL=<your-railway-postgres-url>
NODE_ENV=production
PORT=8080
```

## Deployment Steps

1. Connect your GitHub repository to Railway
2. Add PostgreSQL database service
3. Set environment variables above
4. Deploy!

Railway will automatically:
- Install dependencies (`npm install`)
- Build the React app (`npm run build`)
- Start the server (`npm start`)

## Build Process

The deployment follows this sequence:
1. `npm install` - Installs all dependencies
2. `npm run build` - Builds React frontend to `/build` directory
3. `npm start` - Starts Express server which serves the built React app

## Notes

- The server runs on port 8080 (or PORT env variable)
- Backend serves the built React app in production mode
- Database tables are created automatically on first run
- CORS is enabled for all origins
