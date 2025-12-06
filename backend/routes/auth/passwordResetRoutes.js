// backend/routes/passwordResetRoutes.js
// ===================================================
//      PASSWORD RESET ROUTES — OPTIMIZED VERSION
// ===================================================

const express = require("express");
const router = express.Router();
const { pool } = require("../../db");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

process.env.TZ = "UTC";

// --------------------------------------
// EMAIL TRANSPORT (FAST & SECURE)
// --------------------------------------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// --------------------------------------
// UTILITY: Reset email template
// --------------------------------------
function resetEmailTemplate(name, link) {
  return `
    <div style="font-family:Arial;max-width:600px;margin:auto;">
      <h2 style="color:#0d6efd;">Reset Your Password</h2>
      <p>Hello <b>${name}</b>,</p>

      <p>Click the button below to reset your password:</p>

      <a href="${link}"
         style="display:inline-block;background:#0d6efd;color:white;padding:12px 22px;
         border-radius:8px;text-decoration:none;font-size:16px;margin-top:8px;">
         Reset Password
      </a>

      <p style="color:#444;margin-top:18px;">This link expires in <b>15 minutes</b>.</p>
    </div>
  `;
}

// ===================================================
// POST /auth/password/request
// Request password reset link
// ===================================================
router.post("/request", async (req, res) => {
  try {
    const { email } = req.body;

    console.log("📩 Password reset request for:", email);

    const q = await pool.query(
      "SELECT id, full_name FROM users WHERE email=$1 LIMIT 1",
      [email]
    );

    // Always return generic response for security (no email leak)
    if (q.rowCount === 0) {
      console.log("⚠️ No user found (but returning generic message)");
      return res.json({
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    const user = q.rows[0];

    // Generate secure random token
    const token = crypto.randomBytes(32).toString("hex");

    // Store token + expiry
    const update = await pool.query(
      `
      UPDATE users
      SET reset_token=$1,
          reset_token_expiry = NOW() + INTERVAL '15 minutes'
      WHERE id=$2
      `,
      [token, user.id]
    );

    if (update.rowCount === 0) {
      console.error("❌ Failed to update reset token");
      return res.status(500).json({ message: "Server error" });
    }

    const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    // Send email
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: "Reset Your Password",
      html: resetEmailTemplate(user.full_name, link),
      date: new Date().toUTCString(),
    });

    console.log("✅ Reset email sent to:", email);

    return res.json({
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (err) {
    console.error("RESET REQUEST ERROR:", err);
    res.status(500).json({ message: "Server error sending reset link" });
  }
});

// ===================================================
// POST /auth/password/validate-token
// Check if reset token is valid
// ===================================================
router.post("/validate-token", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Invalid or expired link" });
    }

    const q = await pool.query(
      `
      SELECT id 
      FROM users
      WHERE reset_token=$1
      AND reset_token_expiry > NOW()
      LIMIT 1
      `,
      [token]
    );

    if (q.rowCount === 0) {
      return res.status(400).json({ message: "Invalid or expired link" });
    }

    return res.json({ message: "Valid" });
  } catch (err) {
    console.error("VALIDATE TOKEN ERROR:", err);
    res.status(500).json({ message: "Server error validating link" });
  }
});

// ===================================================
// POST /auth/password/reset
// Reset password using token
// ===================================================
router.post("/reset", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const q = await pool.query(
      `
      SELECT id, reset_token_expiry 
      FROM users 
      WHERE reset_token=$1
      LIMIT 1
      `,
      [token]
    );

    if (q.rowCount === 0) {
      return res.status(400).json({
        message: "This reset link is invalid or has already been used.",
      });
    }

    const user = q.rows[0];

    // Check if expired
    const now = await pool.query("SELECT NOW() as now");
    if (now.rows[0].now > user.reset_token_expiry) {
      return res.status(400).json({ message: "Reset link expired" });
    }

    // Hash new password (bcrypt cost 8 for speed + safety)
    const hashed = await bcrypt.hash(password, 8);

    // Update password & clear token
    await pool.query(
      `
      UPDATE users
      SET password_hash=$1,
          reset_token=NULL,
          reset_token_expiry=NULL
      WHERE id=$2
      `,
      [hashed, user.id]
    );

    console.log("✅ Password reset for user:", user.id);

    return res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("RESET ERROR:", err);
    res.status(500).json({ message: "Server error resetting password" });
  }
});

module.exports = router;
