require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the React app build directory
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
}

// Initialize PostgreSQL database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 5000,
  query_timeout: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Initialize database tables
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        company TEXT,
        role TEXT,
        phone TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS assessments (
        id SERIAL PRIMARY KEY,
        lead_id INTEGER NOT NULL REFERENCES leads(id),
        score INTEGER NOT NULL,
        readiness_level TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS assessment_responses (
        id SERIAL PRIMARY KEY,
        assessment_id INTEGER NOT NULL REFERENCES assessments(id),
        question_id TEXT NOT NULL,
        answer TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables initialized');
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  }
}

// Initialize database on startup with retry logic
async function initializeDatabaseWithRetry(retries = 10, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      await initializeDatabase();
      console.log('Database initialized successfully!');
      return;
    } catch (err) {
      console.log(`Database initialization attempt ${i + 1}/${retries} failed, retrying in ${delay/1000}s...`);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  console.log('Database initialization failed after all retries, but continuing with app startup');
}

initializeDatabaseWithRetry();

// API Routes

// Save lead
app.post('/api/leads', async (req, res) => {
  const { email, name, company, role, phone } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'Email and name are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO leads (email, name, company, role, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [email, name, company, role, phone]
    );
    res.json({ leadId: result.rows[0].id, message: 'Lead saved successfully' });
  } catch (err) {
    if (err.code === '23505') {
      try {
        const existing = await pool.query('SELECT id FROM leads WHERE email = $1', [email]);
        return res.json({ leadId: existing.rows[0].id, message: 'Lead already exists' });
      } catch (dbErr) {
        console.error('Database error:', dbErr);
        return res.status(500).json({ error: 'Database error' });
      }
    }
    console.error('Failed to save lead:', err);
    res.status(500).json({ error: 'Failed to save lead' });
  }
});

// Save assessment
app.post('/api/assessments', async (req, res) => {
  const { leadId, score, readinessLevel, responses } = req.body;

  if (!leadId || score === undefined || !readinessLevel || !responses) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const assessmentResult = await client.query(
      'INSERT INTO assessments (lead_id, score, readiness_level) VALUES ($1, $2, $3) RETURNING id',
      [leadId, score, readinessLevel]
    );
    const assessmentId = assessmentResult.rows[0].id;

    for (const response of responses) {
      await client.query(
        'INSERT INTO assessment_responses (assessment_id, question_id, answer) VALUES ($1, $2, $3)',
        [assessmentId, response.questionId, JSON.stringify(response.answer)]
      );
    }

    await client.query('COMMIT');
    res.json({
      assessmentId,
      message: 'Assessment saved successfully',
      score,
      readinessLevel
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Failed to save assessment:', err);
    res.status(500).json({ error: 'Failed to save assessment' });
  } finally {
    client.release();
  }
});

// Get all leads
app.get('/api/leads', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch leads:', err);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// Get lead with assessments
app.get('/api/leads/:id', async (req, res) => {
  const leadId = req.params.id;
  try {
    const leadResult = await pool.query('SELECT * FROM leads WHERE id = $1', [leadId]);
    if (leadResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const assessmentsResult = await pool.query('SELECT * FROM assessments WHERE lead_id = $1', [leadId]);
    res.json({ ...leadResult.rows[0], assessments: assessmentsResult.rows });
  } catch (err) {
    console.error('Failed to fetch lead:', err);
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
});

// Get assessment stats
app.get('/api/stats', async (req, res) => {
  try {
    const stats = {};

    const leadsResult = await pool.query('SELECT COUNT(*) as total FROM leads');
    stats.totalLeads = parseInt(leadsResult.rows[0].total);

    const assessmentsResult = await pool.query('SELECT COUNT(*) as total FROM assessments');
    stats.totalAssessments = parseInt(assessmentsResult.rows[0].total);

    const avgResult = await pool.query('SELECT AVG(score) as avg FROM assessments');
    stats.averageScore = Math.round(avgResult.rows[0].avg || 0);

    const readinessResult = await pool.query(`
      SELECT readiness_level, COUNT(*) as count
      FROM assessments
      GROUP BY readiness_level
    `);
    stats.byReadinessLevel = readinessResult.rows.reduce((acc, row) => {
      acc[row.readiness_level] = parseInt(row.count);
      return acc;
    }, {});

    res.json(stats);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catch all handler: send back React's index.html file for client-side routing
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    console.log('Serving React app in production mode');
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing database connection...');
  await pool.end();
  console.log('Database connection closed');
  process.exit(0);
});

