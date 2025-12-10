// ======================================================================
//                AUTH ROUTES — RESEND EMAIL FOR VERIFICATION ONLY
// ======================================================================

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { pool } = require("../db");
const { Resend } = require("resend");

const router = express.Router();
process.env.TZ = "UTC";

const resend = new Resend(process.env.RESEND_API_KEY);
const BCRYPT_ROUNDS = 8;

// ======================================================================
// EMAIL TEMPLATE
// ======================================================================
const htmlVerify = (name, link) => `
  <html>
  <body style="font-family: Arial; background:#f6f6f6; padding:20px;">
    <div style="max-width:550px; margin:auto; background:white; padding:20px; border-radius:8px;">
      <h2 style="color:#0d6efd;">Verify Your CBT-Master Account</h2>
      <p>Hello <b>${name}</b>,</p>
      <p>Click the button below to verify your email:</p>

      <p style="text-align:center;">
        <a href="${link}"
           style="background:#0d6efd;color:white;padding:12px 25px;border-radius:6px;text-decoration:none;">
          Verify Email
        </a>
      </p>

      <p>This link expires in 10 minutes.</p>
    </div>
  </body>
  </html>
`;

// ======================================================================
// BACKEND HEALTH CHECK
// ======================================================================
router.get("/ping", (req, res) => res.json({ status: "ok" }));

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
// REGISTER
// ======================================================================
router.post("/register", async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

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

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");

    await pool.query(
      `UPDATE users SET 
        verification_token=$1,
        verification_expires = NOW() + INTERVAL '10 minutes'
       WHERE email=$2`,
      [token, email]
    );

    const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    // SEND VERIFICATION EMAIL USING RESEND
    resend.emails.send({
      from: "CBT Master <noreply@cbt-master.com.ng>",
      to: email,
      subject: "Verify your CBT-Master account",
      html: htmlVerify(full_name, verifyLink),
    }).catch(err => console.error("RESEND REGISTER ERROR:", err));

    return res.status(201).json({
      message: "Account created. Check your email to verify.",
      email,
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

    const now = await pool.query("SELECT NOW() AS now");

    if (now.rows[0].now > user.verification_expires)
      return res.status(400).json({ message: "Verification link expired" });

    await pool.query(
      `UPDATE users SET 
         is_verified=true,
         verification_token=NULL,
         verification_expires=NULL
       WHERE email=$1`,
      [user.email]
    );

    return res.json({ message: "Email verified successfully!" });

  } catch (err) {
    console.error("VERIFY ERROR:", err);
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
        `UPDATE users SET 
           verification_token=$1,
           verification_expires = NOW() + INTERVAL '10 minutes'
         WHERE email=$2`,
        [token, email]
      );

      const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

      // RESEND EMAIL FOR LOGIN VERIFICATION
      resend.emails.send({
        from: "CBT Master <noreply@cbt-master.com.ng>",
        to: email,
        subject: "Verify your CBT-Master account",
        html: htmlVerify(user.full_name, verifyLink),
      }).catch(err => console.error("RESEND LOGIN ERROR:", err));

      return res.status(403).json({
        message: "Email not verified. Verification link resent.",
        email,
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

    return res.json({
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
