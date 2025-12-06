// ============================================================================
// passwordResetRoutes.js — FINAL VERSION (using { pool } destructuring)
// ============================================================================

const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { pool } = require("../../db");  // ⬅⬅⬅ Updated destructuring import

const router = express.Router();

// ============================================================================
// EMAIL TRANSPORT (SMTP)
// ============================================================================
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ============================================================================
// 1) REQUEST PASSWORD RESET
// ============================================================================
router.post("/request", async (req, res) => {
  const { email } = req.body;

  if (!email)
    return res.status(400).json({ message: "Email is required." });

  try {
    const emailLower = email.trim().toLowerCase();

    const userRes = await pool.query(
      "SELECT id, email FROM users WHERE email=$1 LIMIT 1",
      [emailLower]
    );

    // Prevent email enumeration
    if (userRes.rows.length === 0) {
      return res.json({
        message: "If an account exists, a reset link has been sent.",
      });
    }

    const user = userRes.rows[0];

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");

    // Store token + expiry
    await pool.query(
      `UPDATE users
         SET reset_token=$1,
             reset_token_expiry=NOW() + INTERVAL '15 minutes'
       WHERE id=$2`,
      [token, user.id]
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

   await transporter.sendMail({
  from: process.env.FROM_EMAIL,
  to: user.email,
  subject: "Reset Your Password",
  html: `
    <div style="
      font-family:Arial,Helvetica,sans-serif;
      max-width:600px;
      margin:auto;
      padding:20px;
      background:#ffffff;
      border-radius:8px;
      border:1px solid #eee;
    ">

      <h2 style="color:#dc3545;text-align:center;margin-bottom:10px;">
        Reset Your Password
      </h2>

      <p>Hello,</p>

      <p>You requested to reset your password for your <strong>CBT-Master</strong> account.</p>

      <div style="text-align:center;margin:25px 0;">
        <a href="${resetLink}" 
           style="
             background:#0d6efd;
             padding:12px 24px;
             color:#ffffff;
             font-weight:bold;
             text-decoration:none;
             border-radius:6px;
             display:inline-block;
           ">
          Reset Password
        </a>
      </div>

      <p>This link expires in <strong>15 minutes</strong>. If you didn’t request this, you can ignore this email.</p>

      <p style="margin-top:25px;color:#666;font-size:13px;text-align:center;">
        © ${new Date().getFullYear()} CBT-Master
      </p>
    </div>
  `,
});

    return res.json({
      message: "If an account exists, a reset link has been sent.",
    });

  } catch (err) {
    console.error("RESET REQUEST ERROR:", err);
    return res.status(500).json({
      message: "Unable to send reset link. Try again later.",
    });
  }
});

// ============================================================================
// 2) VALIDATE RESET TOKEN
// ============================================================================
router.post("/validate-token", async (req, res) => {
  const { token } = req.body;

  if (!token)
    return res.status(400).json({ message: "Reset token is required." });

  try {
    const result = await pool.query(
      `SELECT id, reset_token_expiry
         FROM users
        WHERE reset_token=$1 LIMIT 1`,
      [token]
    );

    if (result.rows.length === 0)
      return res.status(400).json({ message: "Invalid or used token." });

    const user = result.rows[0];

    if (new Date(user.reset_token_expiry) < new Date()) {
      return res.status(400).json({ message: "Token has expired." });
    }

    return res.json({ message: "Valid token" });

  } catch (err) {
    console.error("VALIDATE TOKEN ERROR:", err);
    return res.status(500).json({ message: "Server error validating token" });
  }
});

// ============================================================================
// 3) RESET PASSWORD
// ============================================================================
router.post("/reset", async (req, res) => {
  const { token, password } = req.body;

  if (!token)
    return res.status(400).json({ message: "Token is required." });

  if (!password)
    return res.status(400).json({ message: "Password is required." });

  try {
    const result = await pool.query(
      `SELECT id, reset_token_expiry
         FROM users
        WHERE reset_token=$1 LIMIT 1`,
      [token]
    );

    if (result.rows.length === 0)
      return res.status(400).json({ message: "Invalid or used token." });

    const user = result.rows[0];

    if (new Date(user.reset_token_expiry) < new Date()) {
      return res.status(400).json({ message: "Token has expired." });
    }

    const hashed = await bcrypt.hash(password, 12);

    await pool.query(
      `UPDATE users
         SET password_hash=$1,
             reset_token=NULL,
             reset_token_expiry=NULL
       WHERE id=$2`,
      [hashed, user.id]
    );

    return res.json({ message: "Password reset successfully." });

  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    return res.status(500).json({
      message: "Unable to reset password. Try again later.",
    });
  }
});

// ============================================================================
// EXPORT ROUTER
// ============================================================================
module.exports = router;
