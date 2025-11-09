# AuditGPT Database Schema

## Entity Relationship Diagram

```
┌─────────────────────────────────┐
│          LEADS                  │
├─────────────────────────────────┤
│ id (PK)          INTEGER        │
│ email            TEXT UNIQUE    │
│ name             TEXT           │
│ company          TEXT           │
│ role             TEXT           │
│ phone            TEXT           │
│ created_at       DATETIME       │
└─────────────────────────────────┘
              │
              │ 1:N
              │
              ▼
┌─────────────────────────────────┐
│       ASSESSMENTS               │
├─────────────────────────────────┤
│ id (PK)          INTEGER        │
│ lead_id (FK)     INTEGER        │
│ score            INTEGER        │
│ readiness_level  TEXT           │
│ created_at       DATETIME       │
└─────────────────────────────────┘
              │
              │ 1:N
              │
              ▼
┌─────────────────────────────────┐
│    ASSESSMENT_RESPONSES         │
├─────────────────────────────────┤
│ id (PK)          INTEGER        │
│ assessment_id(FK) INTEGER       │
│ question_id      TEXT           │
│ answer           TEXT           │
│ created_at       DATETIME       │
└─────────────────────────────────┘
```

## Sample Data Flow

### 1. User Submits Lead Form
```
INSERT INTO leads (email, name, company, role, phone)
VALUES ('test@auditgpt.com', 'Test User', 'Test DeFi', 'CTO', '+1234567890');

→ Returns: leadId = 1
```

### 2. User Completes Assessment
```
INSERT INTO assessments (lead_id, score, readiness_level)
VALUES (1, 68, 'co_creator_qualified');

→ Returns: assessmentId = 1
```

### 3. System Saves All Responses
```
INSERT INTO assessment_responses (assessment_id, question_id, answer)
VALUES 
  (1, 'q1', '"4-10 contracts"'),
  (1, 'q2', '"Yes, minor issues"'),
  (1, 'q3', '"Peer review"'),
  ... (7 more)
  (1, 'q10', '"Yes, after testing"');

→ 10 rows inserted
```

## Current Database State

### leads (1 row)
```
id | email              | name      | company        | role                      | phone        | created_at
1  | test@auditgpt.com  | Test User | Test DeFi      | Smart Contract Developer  | +1234567890  | 2025-11-08 01:03:26
```

### assessments (1 row)
```
id | lead_id | score | readiness_level        | created_at
1  | 1       | 68    | co_creator_qualified   | 2025-11-08 01:03:47
```

### assessment_responses (10 rows)
```
id | assessment_id | question_id | answer                  | created_at
1  | 1             | q1          | "4-10 contracts"        | 2025-11-08 01:03:47
2  | 1             | q2          | "Yes, minor issues"     | 2025-11-08 01:03:47
3  | 1             | q3          | "Peer review"           | 2025-11-08 01:03:47
4  | 1             | q4          | 6                       | 2025-11-08 01:03:47
5  | 1             | q5          | "$5,000 - $20,000"      | 2025-11-08 01:03:47
6  | 1             | q6          | "Within days"           | 2025-11-08 01:03:47
7  | 1             | q7          | "Ethereum"              | 2025-11-08 01:03:47
8  | 1             | q8          | 7                       | 2025-11-08 01:03:47
9  | 1             | q9          | "All of the above"      | 2025-11-08 01:03:47
10 | 1             | q10         | "Yes, after testing"    | 2025-11-08 01:03:47
```

## Useful Queries

### Get all leads with their assessment scores
```sql
SELECT 
  l.name,
  l.email,
  l.company,
  a.score,
  a.readiness_level,
  a.created_at as assessment_date
FROM leads l
LEFT JOIN assessments a ON l.id = a.lead_id
ORDER BY a.created_at DESC;
```

### Get assessment with all responses
```sql
SELECT 
  a.id as assessment_id,
  a.score,
  a.readiness_level,
  r.question_id,
  r.answer
FROM assessments a
JOIN assessment_responses r ON a.id = r.assessment_id
WHERE a.id = 1
ORDER BY r.id;
```

### Get conversion funnel stats
```sql
SELECT 
  (SELECT COUNT(*) FROM leads) as total_leads,
  (SELECT COUNT(*) FROM assessments) as completed_assessments,
  ROUND(
    (SELECT COUNT(*) FROM assessments) * 100.0 / 
    (SELECT COUNT(*) FROM leads), 2
  ) as completion_rate_percent;
```

### Get readiness level distribution
```sql
SELECT 
  readiness_level,
  COUNT(*) as count,
  ROUND(AVG(score), 1) as avg_score,
  MIN(score) as min_score,
  MAX(score) as max_score
FROM assessments
GROUP BY readiness_level
ORDER BY avg_score DESC;
```

### Get most common answers per question
```sql
SELECT 
  question_id,
  answer,
  COUNT(*) as frequency
FROM assessment_responses
GROUP BY question_id, answer
ORDER BY question_id, frequency DESC;
```

## Database File

**Location**: `auditgpt-landing/backend/auditgpt.db`
**Size**: ~20KB (with 1 complete assessment)
**Format**: SQLite 3

## Backup & Export

### Backup database
```bash
cd auditgpt-landing/backend
cp auditgpt.db auditgpt_backup_$(date +%Y%m%d).db
```

### Export to CSV
```bash
sqlite3 auditgpt.db -header -csv "SELECT * FROM leads;" > leads.csv
sqlite3 auditgpt.db -header -csv "SELECT * FROM assessments;" > assessments.csv
```

### Export to JSON (via API)
```bash
curl http://localhost:5000/api/leads > leads.json
curl http://localhost:5000/api/stats > stats.json
```

## Migration to Production

For production, consider migrating to PostgreSQL:

```sql
-- PostgreSQL equivalent schema
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  role VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assessments (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL REFERENCES leads(id),
  score INTEGER NOT NULL,
  readiness_level VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assessment_responses (
  id SERIAL PRIMARY KEY,
  assessment_id INTEGER NOT NULL REFERENCES assessments(id),
  question_id VARCHAR(50) NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assessments_lead_id ON assessments(lead_id);
CREATE INDEX idx_responses_assessment_id ON assessment_responses(assessment_id);
```

## Data Integrity

✅ **Constraints Enforced**:
- Email uniqueness (UNIQUE)
- Required fields (NOT NULL)
- Foreign key relationships
- Auto-incrementing IDs
- Automatic timestamps

✅ **Tested Scenarios**:
- Duplicate email prevention
- Orphaned record prevention
- Concurrent inserts
- Transaction rollback
