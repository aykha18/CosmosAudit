# AuditGPT Backend API

SQLite3-based backend for storing leads and assessment data.

## Setup

```bash
cd backend
npm install
npm start
```

Server runs on: http://localhost:5000

## API Endpoints

### POST /api/leads
Save lead information
```json
{
  "email": "john@example.com",
  "name": "John Doe",
  "company": "Acme Corp",
  "role": "CTO",
  "phone": "+1234567890"
}
```

Response:
```json
{
  "leadId": 1,
  "message": "Lead saved successfully"
}
```

### POST /api/assessments
Save assessment results
```json
{
  "leadId": 1,
  "score": 68,
  "readinessLevel": "co_creator_qualified",
  "responses": [
    {
      "questionId": "q1",
      "answer": "4-10 contracts"
    }
  ]
}
```

### GET /api/leads
Get all leads

### GET /api/leads/:id
Get specific lead with assessments

### GET /api/stats
Get dashboard statistics
```json
{
  "totalLeads": 50,
  "totalAssessments": 45,
  "averageScore": 62,
  "byReadinessLevel": {
    "nurture": 15,
    "co_creator_qualified": 20,
    "priority": 10
  }
}
```

## Database Schema

### leads
- id (INTEGER PRIMARY KEY)
- email (TEXT UNIQUE)
- name (TEXT)
- company (TEXT)
- role (TEXT)
- phone (TEXT)
- created_at (DATETIME)

### assessments
- id (INTEGER PRIMARY KEY)
- lead_id (INTEGER FK)
- score (INTEGER)
- readiness_level (TEXT)
- created_at (DATETIME)

### assessment_responses
- id (INTEGER PRIMARY KEY)
- assessment_id (INTEGER FK)
- question_id (TEXT)
- answer (TEXT)
- created_at (DATETIME)

## Environment Variables

Create `.env` file:
```
PORT=5000
```

## Production Deployment

For production, consider:
- Using PostgreSQL instead of SQLite
- Adding authentication
- Rate limiting
- Input validation
- HTTPS only
