// backend/routes/authRoutes.js
// ==================== AUTH ROUTES (FINAL VERSION) ====================

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");
const nodemailer = require("nodemailer");

const router = express.Router();

// Force backend timestamps to always use UTC
process.env.TZ = "UTC";

// ----------------------
// Email Transporter
// ----------------------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // true for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ----------------------
// Email HTML Template
// ----------------------
function htmlVerify(name, link) {
  return `
    <div style="font-family:Arial; max-width:600px; margin:auto;">
      <h2 style="color:#0d6efd;">Verify Your Email</h2>
      <p>Hello <b>${name}</b>,</p>
      <p>Please click the button below to activate your account.</p>

      <a href="${link}" 
        style="background:#0d6efd;color:white;padding:12px 22px;
               border-radius:8px;text-decoration:none;">
        Verify Email
      </a>

      <p style="margin-top:20px; color:#555;">
        This link expires in <b>10 minutes</b> (your local time).
      </p>
    </div>
  `;
}

// ----------------------
// POST /auth/register
// ----------------------
router.post("/register", async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const check = await pool.query("SELECT id FROM users WHERE email=$1", [
      email,
    ]);
    if (check.rowCount > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, 10);

    // Create user as unverified
    await pool.query(
      `INSERT INTO users(full_name, email, password_hash, is_verified, role)
       VALUES ($1,$2,$3,false,'student')`,
      [full_name, email, hash]
    );

    const token = jwt.sign({ email }, process.env.JWT_SECRET);

    await pool.query(
      `UPDATE users
       SET verification_token=$1,
           verification_expires = NOW() + INTERVAL '10 minutes'
       WHERE email=$2`,
      [token, email]
    );

    const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: "Verify your CBT Master account",
      html: htmlVerify(full_name, link),
      date: new Date().toUTCString(), // stable header for Outlook
    });

    res.status(201).json({
      message: "Account created. Check your email to verify your account.",
      email,
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------------
// GET /auth/verify-email
// ----------------------
router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: "Invalid verification link" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET, {
        ignoreExpiration: true, // we use DB expiry instead
      });
    } catch {
      return res.status(400).json({ message: "Invalid verification link" });
    }

    const email = decoded.email;

    const userRes = await pool.query(
      `SELECT is_verified, verification_token, verification_expires
       FROM users WHERE email=$1`,
      [email]
    );

    if (userRes.rowCount === 0) {
      return res.status(400).json({ message: "Invalid verification link" });
    }

    const user = userRes.rows[0];

    // Already verified → treat as success
    if (user.is_verified === true) {
      return res.json({ message: "Email already verified" });
    }

    // Token mismatch
    if (user.verification_token !== token) {
      return res.status(400).json({ message: "Invalid verification link" });
    }

    // Compare with DB clock (UTC)
    const nowResult = await pool.query("SELECT NOW() AS now");
    const now = nowResult.rows[0].now;

    if (now > user.verification_expires) {
      return res.status(400).json({ message: "Verification link expired" });
    }

    // Mark user as verified
    await pool.query(
      `UPDATE users
       SET is_verified=true,
           verification_token=NULL,
           verification_expires=NULL
       WHERE email=$1`,
      [email]
    );

    res.json({ message: "Email verified successfully!" });
  } catch (err) {
    console.error("VERIFY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------------
// POST /auth/resend-verify-link
// ----------------------
router.post("/resend-verify-link", async (req, res) => {
  try {
    const { email } = req.body;

    const q = await pool.query(
      `SELECT full_name, is_verified FROM users WHERE email=$1`,
      [email]
    );

    if (q.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    if (q.rows[0].is_verified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET);

    await pool.query(
      `UPDATE users
       SET verification_token=$1,
           verification_expires=NOW() + INTERVAL '10 minutes'
       WHERE email=$2`,
      [token, email]
    );

    const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: "Verify Your Email",
      html: htmlVerify(q.rows[0].full_name, link),
      date: new Date().toUTCString(),
    });

    res.json({ message: "Verification link resent" });
  } catch (err) {
    console.error("RESEND ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------------
// POST /auth/login
// ----------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const r = await pool.query(
      "SELECT id, full_name, email, password_hash, is_verified, role FROM users WHERE email=$1",
      [email]
    );

    if (r.rowCount === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = r.rows[0];

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.is_verified) {
      return res.status(403).json({ message: "Email not verified" });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    delete user.password_hash;

    res.json({ message: "Login successful", user, token });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
