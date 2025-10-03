// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// serve frontend if public folder exists
app.use(express.static(path.join(__dirname, 'public')));

// Connect to Postgres using DATABASE_URL provided by Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Ensure the contacts table exists
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT,
        message TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ contacts table ready');
  } catch (err) {
    console.error('Error creating contacts table', err);
  }
})();

// POST endpoint to save contact submissions
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body || {};
  try {
    await pool.query(
      'INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3)',
      [name || null, email || null, message || null]
    );
    console.log('Saved contact:', { name, email });
    res.json({ ok: true, message: 'Thanks — we received your message.' });
  } catch (err) {
    console.error('DB insert error', err);
    res.status(500).json({ ok: false, error: 'Database error' });
  }
});

// Protected GET to view saved contacts (requires ADMIN_KEY header)
app.get('/api/contacts', async (req, res) => {
  const adminKey = req.header('x-admin-key') || req.query.admin_key;
  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }
  try {
    const result = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC');
    res.json({ ok: true, rows: result.rows });
  } catch (err) {
    console.error('DB fetch error', err);
    res.status(500).json({ ok: false, error: 'Database error' });
  }
});

// Fallback: serve index.html for SPA routing
app.use((req, res) => {
  const index = path.join(__dirname, 'public', 'index.html');
  res.sendFile(index, err => {
    if (err) res.status(404).send('Not found');
  });
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
