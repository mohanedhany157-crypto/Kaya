const express = require('express');
const path = require('path');
const fs = require('fs'); // Added for debugging
const app = express();

// Use the port Render assigns, or 3000 if testing locally
const PORT = process.env.PORT || 3000;

// DEBUGGING: Print files to the console logs so we can see what Render sees
console.log("📂 Current Directory:", __dirname);
try {
    console.log("📄 Files found:", fs.readdirSync(__dirname));
} catch (e) {
    console.log("Error listing files:", e);
}

// Serve all static files (index.html, styles.css, script.js, pics)
app.use(express.static(__dirname));

// For any other request, send index.html
app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');

    // Safety Check: Does index.html exist?
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        // If missing, show a helpful error on the website instead of crashing
        res.status(404).send(`
            <div style="font-family:sans-serif; text-align:center; padding:50px;">
                <h1 style="color:red;">Error: index.html missing</h1>
                <p>The server is running, but it cannot find <b>index.html</b>.</p>
                <hr>
                <p><strong>Files actually found in this folder:</strong><br> ${fs.readdirSync(__dirname).join(', ')}</p>
                <p><i>Make sure index.html is in the same folder as server.js and pushed to GitHub.</i></p>
            </div>
        `);
    }
});

app.listen(PORT, () => {
    console.log(`Kaya Store is live on port ${PORT}`);
});