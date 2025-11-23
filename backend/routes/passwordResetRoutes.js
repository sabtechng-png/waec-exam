// ==================== PASSWORD RESET ROUTES (FINAL & FLAWLESS) ====================
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");
const nodemailer = require("nodemailer");

const router = express.Router();

// Force UTC timestamps (align with your NeonDB)
process.env.TZ = "UTC";

// ----------------------
// Email Transporter
// ----------------------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ----------------------
// Email Template
// ----------------------
function htmlReset(name, link) {
  return `
    <div style="font-family:Arial; max-width:600px; margin:auto;">
      <h2 style="color:#0d6efd;">Reset Your Password</h2>

      <p>Hello <b>${name}</b>,</p>
      <p>You requested to reset your password. Click below to continue.</p>

      <a href="${link}"
        style="background:#0d6efd; color:white; padding:12px 22px;
        border-radius:8px; text-decoration:none;">
        Reset Password
      </a>

      <p style="margin-top:20px; color:#555;">
        This link expires in <b>10 minutes</b>.
      </p>
    </div>
  `;
}

// ===================================================================
// 1️⃣ REQUEST RESET LINK  → POST /auth/password/request
// ===================================================================
router.post("/password/request", async (req, res) => {
  const { email } = req.body;

  try {
    const r = await pool.query(
      "SELECT id, full_name FROM users WHERE email=$1",
      [email]
    );

    if (r.rowCount === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    const user = r.rows[0];

    // Generate JWT reset token
    const token = jwt.sign({ email }, process.env.JWT_SECRET);

    await pool.query(
      `UPDATE users
       SET reset_token=$1,
           reset_token_expiry = NOW() + INTERVAL '10 minutes'
       WHERE email=$2`,
      [token, email]
    );

    const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: "Password Reset Request",
      html: htmlReset(user.full_name, link),
      date: new Date().toUTCString(),
    });

    res.json({ message: "Reset link sent to your email." });
  } catch (err) {
    console.error("RESET REQUEST ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===================================================================
// 2️⃣ VALIDATE TOKEN  → POST /auth/password/validate-token
//     Used in ResetPassword.jsx first check
// ===================================================================
router.post("/password/validate-token", async (req, res) => {
  const { token } = req.body;

  try {
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET, {
        ignoreExpiration: true, // DB expiry rules apply
      });
    } catch {
      return res.status(400).json({
        message: "Invalid or corrupted reset link.",
      });
    }

    const email = decoded.email;

    const r = await pool.query(
      `SELECT reset_token, reset_token_expiry
       FROM users WHERE email=$1`,
      [email]
    );

    if (r.rowCount === 0) {
      return res.status(400).json({ message: "Invalid reset link." });
    }

    const user = r.rows[0];

    if (user.reset_token !== token) {
      return res.status(400).json({ message: "Invalid reset link." });
    }

    const nowRes = await pool.query("SELECT NOW() AS now");
    const now = nowRes.rows[0].now;

    if (now > user.reset_token_expiry) {
      return res.status(400).json({ message: "Reset link expired." });
    }

    return res.json({ message: "Token valid." });
  } catch (err) {
    console.error("TOKEN VALIDATION ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ===================================================================
// 3️⃣ RESET PASSWORD  → POST /auth/password/reset
// ===================================================================
router.post("/password/reset", async (req, res) => {
  const { token, password } = req.body;

  try {
    // Decode email
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET, {
        ignoreExpiration: true,
      });
    } catch {
      return res.status(400).json({ message: "Invalid reset link." });
    }

    const email = decoded.email;

    const r = await pool.query(
      `SELECT reset_token, reset_token_expiry
       FROM users WHERE email=$1`,
      [email]
    );

    if (r.rowCount === 0) {
      return res.status(400).json({ message: "Invalid reset link." });
    }

    const user = r.rows[0];

    // Token must match DB copy
    if (user.reset_token !== token) {
      return res.status(400).json({ message: "Invalid reset link." });
    }

    // Check expiry
    const nowRes = await pool.query("SELECT NOW() AS now");
    const now = nowRes.rows[0].now;

    if (now > user.reset_token_expiry) {
      return res.status(400).json({ message: "Reset link expired." });
    }

    // Hash new password
    const hash = await bcrypt.hash(password, 10);

    // Update password & clear reset token
    await pool.query(
      `UPDATE users
       SET password_hash=$1,
           reset_token=NULL,
           reset_token_expiry=NULL,
           updated_at=NOW()
       WHERE email=$2`,
      [hash, email]
    );

    res.json({ message: "Password reset successfully." });
  } catch (err) {
    console.error("PASSWORD RESET ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
