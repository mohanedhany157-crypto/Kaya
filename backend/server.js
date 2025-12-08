const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allows your frontend to talk to this backend
app.use(express.json());

// --- EMAIL CONFIGURATION ---
// Replace these with your real details or use a .env file
const EMAIL_USER = "hellotokaya@gmail.com";
const EMAIL_PASS = "YOUR_GOOGLE_APP_PASSWORD_HERE"; // NOT your login password!

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

// --- API ROUTE ---
app.post('/api/send-order-email', async (req, res) => {
    const { name, email, orderId, total } = req.body;

    console.log(`📩 Request received to send email to: ${email}`);

    const mailOptions = {
        from: `"Kaya Store" <${EMAIL_USER}>`,
        to: email,
        subject: "🎉 Pre-order Confirmation: Welcome to the KAYA Family!",
        text: `
Hello ${name},

Thanks for being one of the first to preorder our KAYA product! 
We are thrilled to have you on board.

Order ID: ${orderId}
Total: USD ${total}

Your order has been received and we are getting it ready for launch.
We hope you enjoy mastering financial literacy with us!

Best,
The Kaya Team
        `,
        html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #FD4D0A;">Welcome to KAYA!</h2>
                <p>Hello <strong>${name}</strong>,</p>
                <p>Thanks for being one of the first to preorder our KAYA product! We are thrilled to have you on board.</p>
                
                <div style="background: #FEF6EC; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Order ID:</strong> ${orderId}</p>
                    <p><strong>Total Paid:</strong> USD ${total}</p>
                </div>

                <p>Your order has been received and we are getting it ready for launch.</p>
                <p>We hope you enjoy mastering financial literacy with us!</p>
                <br>
                <p>Best,<br><strong>The Kaya Team</strong></p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("✅ Email sent successfully");
        res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error("❌ Error sending email:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Kaya Backend running on http://localhost:${PORT}`);
});