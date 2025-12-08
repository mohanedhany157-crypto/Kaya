const express = require('express');
const path = require('path');
const app = express();

// Use the port Render assigns, or 3000 if testing locally
const PORT = process.env.PORT || 3000;

// Serve all static files (index.html, styles.css, script.js, pics)
app.use(express.static(__dirname));

// For any other request, send index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Kaya Store is live on port ${PORT}`);
});