// ======================================================================
//                AUTH ROUTES — UNIVERSAL VERSION (LOCAL + RENDER)
// ======================================================================

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { pool } = require("../db");
const nodemailer = require("nodemailer");

const router = express.Router();
process.env.TZ = "UTC";

const BCRYPT_ROUNDS = 8;

// ======================================================================
// UNIVERSAL SMTP TRANSPORTER (Works on Localhost + Render)
// ======================================================================
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,            // ❗ Always false for port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,  // ❗ Prevent Render blocking Gmail cert
  },
  socketTimeout: 20000,
  connectionTimeout: 20000,
});

// Verify transporter (important for debugging)
transporter.verify((err) => {
  if (err) {
    console.error("SMTP CONNECTION ERROR:", err);
  } else {
    console.log("SMTP SERVER READY ✔");
  }
});

// ======================================================================
// EMAIL TEMPLATE
// ======================================================================
const htmlVerify = (name, link) => `
  <!DOCTYPE html>
  <html><body>
  <h2>Verify Your CBT-Master Account</h2>
  <p>Hello <b>${name}</b>,</p>
  <p>Click the button below to verify your email:</p>
  <p><a href="${link}" style="padding:10px 18px;background:#0d6efd;color:#fff;border-radius:6px;text-decoration:none;">Verify Email</a></p>
  <p>This link expires in 10 minutes.</p>
  </body></html>
`;

// ======================================================================
// BACKEND WAKEUP ROUTE
// ======================================================================
router.get("/ping", (req, res) => {
  res.json({ status: "ok" });
});

// ======================================================================
// GET /auth/me
// ======================================================================
router.get("/me", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Invalid token" });

    const r = await pool.query(
      `SELECT id, full_name, email, role, is_verified
       FROM users WHERE id=$1 LIMIT 1`,
      [userId]
    );

    if (r.rowCount === 0)
      return res.status(401).json({ message: "User not found" });

    res.json({ user: r.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ======================================================================
// POST /auth/register
// ======================================================================
router.post("/register", async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password)
      return res.status(400).json({
        message: "Full name, email and password are required",
      });

    const exists = await pool.query(
      "SELECT id FROM users WHERE email=$1 LIMIT 1",
      [email]
    );

    if (exists.rowCount > 0)
      return res.status(409).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    await pool.query(
      `INSERT INTO users (full_name, email, password_hash, is_verified, role)
       VALUES ($1, $2, $3, false, 'student')`,
      [full_name, email, passwordHash]
    );

    // Create token
    const token = crypto.randomBytes(32).toString("hex");

    await pool.query(
      `UPDATE users
       SET verification_token=$1,
           verification_expires = NOW() + INTERVAL '10 minutes'
       WHERE email=$2`,
      [token, email]
    );

    const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    // Fire email
    transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: "Verify your CBT-Master account",
      html: htmlVerify(full_name, verifyLink),
    }).catch(err => console.error("EMAIL SEND ERROR:", err));

    res.status(201).json({
      message: "Account created. Check your email to verify.",
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ======================================================================
// VERIFY EMAIL
// ======================================================================
router.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) return res.status(400).json({ message: "Invalid link" });

    const r = await pool.query(
      `SELECT email, verification_expires, is_verified
       FROM users WHERE verification_token=$1 LIMIT 1`,
      [token]
    );

    if (r.rowCount === 0)
      return res.status(400).json({ message: "Invalid or expired link" });

    const user = r.rows[0];

    const now = await pool.query("SELECT NOW() as now");

    if (now.rows[0].now > user.verification_expires)
      return res.status(400).json({ message: "Verification link expired" });

    await pool.query(
      `UPDATE users
       SET is_verified=true,
           verification_token=NULL,
           verification_expires=NULL
       WHERE email=$1`,
      [user.email]
    );

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ======================================================================
// LOGIN
// ======================================================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const r = await pool.query(
      `SELECT id, full_name, email, password_hash, is_verified, role
       FROM users WHERE email=$1 LIMIT 1`,
      [email]
    );

    if (r.rowCount === 0)
      return res.status(401).json({ message: "Incorrect email or password" });

    const user = r.rows[0];

    if (!user.is_verified) {
      const token = crypto.randomBytes(32).toString("hex");

      await pool.query(
        `UPDATE users
         SET verification_token=$1,
             verification_expires = NOW() + INTERVAL '10 minutes'
         WHERE email=$2`,
        [token, email]
      );

      const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

      transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to: email,
        subject: "Verify your CBT-Master account",
        html: htmlVerify(user.full_name, verifyLink),
      }).catch(err => console.error("RESEND VERIFY ERROR:", err));

      return res.status(403).json({
        message: "Email not verified. Verification link resent.",
      });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ message: "Incorrect email or password" });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    delete user.password_hash;

    res.json({
      success: true,
      message: "Login successful",
      user,
      token,
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
