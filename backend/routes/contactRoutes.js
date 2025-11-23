// ==================================
// File: routes/contactRoutes.js
// ==================================

const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
require("dotenv").config();

// Setup email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// POST /contact/send
router.post("/send", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Email to admin
    const adminMail = {
      from: `"CBT Master Contact" <${process.env.SMTP_USER}>`,
      to: "sabtech.ng@gmail.com",
      subject: "New CBT Master Support Message",
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <div style="background:#f2f2f2; padding:10px; border-radius:5px;">
          ${message}
        </div>
        <br />
        <p style="font-size:12px; color:gray;">Sent from CBT Master Contact Page</p>
      `,
    };

    await transporter.sendMail(adminMail);

    // Auto-reply to user
    const autoReply = {
      from: `"CBT Master Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "We received your message",
      html: `
        <h2>Hello ${name},</h2>
        <p>This is a confirmation that we received your message:</p>

        <blockquote style="background:#f5f5f5; padding:12px; border-left:4px solid #1976d2;">
          ${message}
        </blockquote>

        <p>Our support team will get back to you shortly.</p>

        <p>Regards,<br/><strong>CBT Master Support Team</strong></p>
      `,
    };

    await transporter.sendMail(autoReply);

    return res.json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("Contact Form Email Error:", error);
    return res.status(500).json({ message: "Failed to send message." });
  }
});

module.exports = router;
