// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');
// 🆕 Import nodemailer
const nodemailer = require('nodemailer'); 

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

// 🆕 Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // e.g., 'smtp.gmail.com'
    port: 587, // Standard secure port
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER, // hellotokaya@gmail.com
        pass: process.env.EMAIL_PASS  // The app-specific password/key
    },
});

// Ensure the contacts table exists
(async () => {
try {
await pool.query(`
CREATE TABLE IF NOT EXISTS contacts (
id SERIAL PRIMARY KEY,
name TEXT,
email TEXT,
        phone TEXT, // 🆕 Add phone field to table
message TEXT,
created_at TIMESTAMP DEFAULT NOW()
);
`);
console.log('✅ contacts table ready');
} catch (err) {
console.error('Error creating contacts table', err);
}
})();

// POST endpoint to save contact submissions and send email
app.post('/api/contact', async (req, res) => {
// 🆕 Include 'phone' in destructuring
const { name, email, phone, message } = req.body || {}; 

// Basic validation
if (!name || !email || !message) {
return res.status(400).json({ ok: false, error: 'Missing required fields: name, email, and message.' });
}

try {
// 1. Save to Database (Including phone)
await pool.query(
'INSERT INTO contacts (name, email, phone, message) VALUES ($1, $2, $3, $4)',
[name, email, phone || null, message]
);
console.log('Saved contact:', { name, email });

    // 2. Send Email Notification
    const mailOptions = {
        from: `KAYA Contact Form <${process.env.EMAIL_USER}>`,
        to: 'hellotokaya@gmail.com', // ⚠️ YOUR FORMAL EMAIL ADDRESS
        subject: `New KAYA Contact Submission from ${name}`,
        text: `
        Name: ${name}
        Email: ${email}
        Phone: ${phone || 'N/A'}
        
        Message:
        ${message}
        `,
        html: `
        <h2>New Contact/Pre-Order from KAYA Website</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <hr>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap; background-color: #f4f4f4; padding: 10px;">${message}</p>
        `
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to hellotokaya@gmail.com');
    
    // 3. Send Success Response to Frontend
res.json({ ok: true, message: 'Thanks — we received your message and will be in touch!' });
    
} catch (err) {
    // Log detailed error and send generic error to user
console.error('Form submission error (DB or Email)', err); 
res.status(500).json({ ok: false, error: 'A server error occurred. Please try again later.' });
}
});

// Protected GET to view saved contacts (no change needed here)
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

// Fallback: serve index.html for SPA routing (no change)
app.use((req, res) => {
const index = path.join(__dirname, 'public', 'index.html');
res.sendFile(index, err => {
if (err) res.status(404).send('Not found');
});
});


app.listen(port, () => {
console.log(`Server running on port ${port}`);
});
