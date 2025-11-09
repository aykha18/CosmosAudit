const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize SQLite database
const db = new sqlite3.Database(path.join(__dirname, 'auditgpt.db'), (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Create tables
function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      company TEXT,
      role TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER NOT NULL,
      score INTEGER NOT NULL,
      readiness_level TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS assessment_responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      assessment_id INTEGER NOT NULL,
      question_id TEXT NOT NULL,
      answer TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assessment_id) REFERENCES assessments(id)
    )
  `);

  console.log('Database tables initialized');
}

// API Routes

// Save lead
app.post('/api/leads', (req, res) => {
  const { email, name, company, role, phone } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'Email and name are required' });
  }

  const sql = `INSERT INTO leads (email, name, company, role, phone) VALUES (?, ?, ?, ?, ?)`;
  
  db.run(sql, [email, name, company, role, phone], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        // Lead already exists, return existing ID
        db.get('SELECT id FROM leads WHERE email = ?', [email], (err, row) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          return res.json({ leadId: row.id, message: 'Lead already exists' });
        });
      } else {
        return res.status(500).json({ error: 'Failed to save lead' });
      }
    } else {
      res.json({ leadId: this.lastID, message: 'Lead saved successfully' });
    }
  });
});

// Save assessment
app.post('/api/assessments', (req, res) => {
  const { leadId, score, readinessLevel, responses } = req.body;

  if (!leadId || score === undefined || !readinessLevel || !responses) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Insert assessment
  const assessmentSql = `INSERT INTO assessments (lead_id, score, readiness_level) VALUES (?, ?, ?)`;
  
  db.run(assessmentSql, [leadId, score, readinessLevel], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to save assessment' });
    }

    const assessmentId = this.lastID;

    // Insert responses
    const responseSql = `INSERT INTO assessment_responses (assessment_id, question_id, answer) VALUES (?, ?, ?)`;
    const stmt = db.prepare(responseSql);

    responses.forEach(response => {
      stmt.run([assessmentId, response.questionId, JSON.stringify(response.answer)]);
    });

    stmt.finalize((err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to save responses' });
      }
      res.json({ 
        assessmentId, 
        message: 'Assessment saved successfully',
        score,
        readinessLevel
      });
    });
  });
});

// Get all leads
app.get('/api/leads', (req, res) => {
  db.all('SELECT * FROM leads ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch leads' });
    }
    res.json(rows);
  });
});

// Get lead with assessments
app.get('/api/leads/:id', (req, res) => {
  const leadId = req.params.id;

  db.get('SELECT * FROM leads WHERE id = ?', [leadId], (err, lead) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch lead' });
    }
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    db.all('SELECT * FROM assessments WHERE lead_id = ?', [leadId], (err, assessments) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch assessments' });
      }
      res.json({ ...lead, assessments });
    });
  });
});

// Get assessment stats
app.get('/api/stats', (req, res) => {
  const stats = {};

  db.get('SELECT COUNT(*) as total FROM leads', [], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    stats.totalLeads = row.total;

    db.get('SELECT COUNT(*) as total FROM assessments', [], (err, row) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      stats.totalAssessments = row.total;

      db.get('SELECT AVG(score) as avg FROM assessments', [], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        stats.averageScore = Math.round(row.avg || 0);

        db.all(`
          SELECT readiness_level, COUNT(*) as count 
          FROM assessments 
          GROUP BY readiness_level
        `, [], (err, rows) => {
          if (err) return res.status(500).json({ error: 'Database error' });
          stats.byReadinessLevel = rows.reduce((acc, row) => {
            acc[row.readiness_level] = row.count;
            return acc;
          }, {});

          res.json(stats);
        });
      });
    });
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});
