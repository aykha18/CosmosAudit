# Start AuditGPT Landing Page

## Quick Start (Both Frontend + Backend)

### Terminal 1 - Backend
```bash
cd auditgpt-landing/backend
npm install
npm start
```

Backend runs on: http://localhost:5000

### Terminal 2 - Frontend
```bash
cd auditgpt-landing
npm start
```

Frontend runs on: http://localhost:3000

## What's Fixed

✅ **NaN Score Issue** - Fixed by properly importing questions array
✅ **SQLite3 Backend** - Saves all lead and assessment data
✅ **API Integration** - Frontend connects to backend automatically

## Database Location

Data is saved in: `auditgpt-landing/backend/auditgpt.db`

## View Saved Data

### Option 1: API Endpoints
```bash
# Get all leads
curl http://localhost:5000/api/leads

# Get stats
curl http://localhost:5000/api/stats
```

### Option 2: SQLite Browser
```bash
cd auditgpt-landing/backend
sqlite3 auditgpt.db

# SQL queries
SELECT * FROM leads;
SELECT * FROM assessments;
SELECT * FROM assessment_responses;
```

### Option 3: DB Browser for SQLite
Download: https://sqlitebrowser.org/
Open: `auditgpt-landing/backend/auditgpt.db`

## Testing the Flow

1. Open http://localhost:3000
2. Click "Take Free Security Assessment"
3. Fill in lead form (saved to DB)
4. Answer 10 questions
5. See results with proper score (not NaN)
6. Data is saved in SQLite

## Check Saved Data

```bash
curl http://localhost:5000/api/stats
```

Should return:
```json
{
  "totalLeads": 1,
  "totalAssessments": 1,
  "averageScore": 68,
  "byReadinessLevel": {
    "co_creator_qualified": 1
  }
}
```

## Troubleshooting

### Backend won't start
```bash
cd auditgpt-landing/backend
rm -rf node_modules package-lock.json
npm install
npm start
```

### Frontend can't connect to backend
Check `.env` file in `auditgpt-landing/`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### Port already in use
```bash
# Kill process on port 5000
npx kill-port 5000

# Or use different port
PORT=5001 npm start
```
