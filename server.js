// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// allow requests from your frontend (dev)
app.use(cors());
app.use(bodyParser.json());

// serve frontend
app.use(express.static("public"));

// simple contact endpoint
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body || {};
  console.log('Contact form received:', { name, email, message, time: new Date().toISOString() });

  // TODO: integrate email sending (e.g., nodemailer) or save to DB
  res.json({ ok: true, message: 'Thanks — we received your message.' });
});

// static file serving for production if desired
// e.g., serve built frontend from ../dist or /public
// app.use(express.static('../public'));
app.get('/', (req, res) => {
  res.send('✅ Backend is running. Use POST /api/contact to send messages.');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
