// ======================================================================
//                AUTH ROUTES — FINAL PROFESSIONAL VERSION
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

// ======================================================
// EMAIL TRANSPORTER (Optimized + Secure)
// ======================================================
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ======================================================
// EMAIL TEMPLATES — PROFESSIONAL HTML VERSION
// ======================================================
const htmlVerify = (name, link) => `
  <!DOCTYPE html>
  <html lang="en" style="margin:0;padding:0;">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Verification</title>
  </head>

  <body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
    
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;background:#f4f6f9;">
      <tr>
        <td align="center">

          <!-- MAIN CONTAINER -->
          <table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
            
            <!-- HEADER -->
            <tr>
              <td style="padding:25px 30px;background:#0d6efd;color:white;text-align:center;">
                <h1 style="margin:0;font-size:26px;font-weight:800;">Verify Your Email</h1>
              </td>
            </tr>

            <!-- BODY -->
            <tr>
              <td style="padding:30px 35px;color:#333;font-size:15px;line-height:1.7;">
                
                <p style="margin:0 0 18px;">Hello <strong>${name}</strong>,</p>

                <p style="margin:0 0 18px;">
                  Thank you for creating an account with <strong>CBT-Master</strong>.
                  To complete your registration and secure your account, please verify your email
                  by clicking the button below.
                </p>

                <div style="text-align:center;margin:30px 0;">
                  <a href="${link}"
                     style="
                       background:#0d6efd;
                       padding:14px 28px;
                       color:#ffffff;
                       font-size:16px;
                       font-weight:bold;
                       text-decoration:none;
                       border-radius:8px;
                       display:inline-block;
                     ">
                    Verify Email
                  </a>
                </div>

                <p style="margin:0 0 18px;color:#555;">
                  This link will expire in <strong>10 minutes</strong>.
                  If you did not create an account, please ignore this email.
                </p>

                <p style="margin:25px 0 0;color:#555;">
                  Need help? Simply reply to this email — our support team is here for you.
                </p>

              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="padding:20px 30px;text-align:center;background:#f8f9fb;color:#888;font-size:13px;">
                © ${new Date().getFullYear()} CBT-Master. All rights reserved.<br />
                This is an automated message. Please do not reply directly.
              </td>
            </tr>

          </table>
          <!-- END MAIN CONTAINER -->

        </td>
      </tr>
    </table>

  </body>
  </html>
`;

// ======================================================
// BACKEND WAKEUP ROUTE
// ======================================================
router.get("/ping", (req, res) => {
  res.json({ status: "ok" });
});

// ======================================================
// GET /auth/me
// ======================================================
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
    console.error("ME ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ======================================================================
// POST /auth/register  — FIXED (No more “Registration failed” bug)
// ======================================================================
// ======================================================================
// POST /auth/register  — Optimized & Professional Version
// ======================================================================
router.post("/register", async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    // --------------------------------------------------------------
    // Input Validation
    // --------------------------------------------------------------
    if (!full_name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Full name, email, and password are required." });
    }

    // Check if email already exists
    const exists = await pool.query(
      "SELECT id FROM users WHERE email = $1 LIMIT 1",
      [email]
    );

    if (exists.rowCount > 0) {
      return res
        .status(409)
        .json({ message: "This email is already registered." });
    }

    // --------------------------------------------------------------
    // Create User Account
    // --------------------------------------------------------------
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    await pool.query(
      `
      INSERT INTO users (full_name, email, password_hash, is_verified, role)
      VALUES ($1, $2, $3, false, 'student')
      `,
      [full_name, email, passwordHash]
    );

    // --------------------------------------------------------------
    // Generate Verification Token
    // --------------------------------------------------------------
    const token = crypto.randomBytes(32).toString("hex");

    await pool.query(
      `
      UPDATE users
      SET verification_token = $1,
          verification_expires = NOW() + INTERVAL '10 minutes'
      WHERE email = $2
      `,
      [token, email]
    );

    const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    // --------------------------------------------------------------
    // Send Email (Fire-and-Forget — does NOT block API response)
    // --------------------------------------------------------------
    transporter
      .sendMail({
        from: process.env.FROM_EMAIL,
        to: email,
        subject: "Verify your CBT-Master account",
        html: htmlVerify(full_name, verifyLink),
        date: new Date().toUTCString(),
      })
      .catch((err) => {
        console.error("EMAIL SEND FAILED:", err);
      });

    // --------------------------------------------------------------
    // Final Success Response
    // --------------------------------------------------------------
    return res.status(201).json({
      message: "Account created successfully. Please check your email to verify your account.",
      email,
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({
      message: "An unexpected server error occurred. Please try again later.",
    });
  }
});

// ======================================================================
// GET /auth/verify-email — NORMAL EMAIL VERIFICATION
// ======================================================================
router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: "Invalid link" });

    const r = await pool.query(
      `SELECT email, is_verified, verification_token, verification_expires
       FROM users WHERE verification_token=$1 LIMIT 1`,
      [token]
    );

    if (r.rowCount === 0)
      return res.status(400).json({ message: "Invalid or expired link" });

    const user = r.rows[0];

    if (user.is_verified)
      return res.json({ message: "Email already verified" });

    const now = await pool.query("SELECT NOW() as now");
    if (now.rows[0].now > user.verification_expires)
      return res.status(400).json({ message: "Verification link expired" });

    await pool.query(
      `UPDATE users SET is_verified=true,
                        verification_token=NULL,
                        verification_expires=NULL
       WHERE email=$1`,
      [user.email]
    );

    return res.json({
      message: "Email verified successfully!",
      email: user.email,
    });
  } catch (err) {
    console.error("VERIFY GET ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ======================================================================
// POST /auth/verify-email — For frontend POST usage
// ======================================================================
router.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Invalid link" });

    const r = await pool.query(
      `SELECT email, is_verified, verification_token, verification_expires
       FROM users WHERE verification_token=$1 LIMIT 1`,
      [token]
    );

    if (r.rowCount === 0)
      return res.status(400).json({ message: "Invalid or expired link" });

    const user = r.rows[0];

    if (user.is_verified)
      return res.json({ message: "Email already verified" });

    const now = await pool.query("SELECT NOW() as now");
    if (now.rows[0].now > user.verification_expires)
      return res.status(400).json({ message: "Verification link expired" });

    await pool.query(
      `UPDATE users SET is_verified=true,
                        verification_token=NULL,
                        verification_expires=NULL
       WHERE email=$1`,
      [user.email]
    );

    return res.json({
      message: "Email verified successfully!",
      email: user.email,
    });
  } catch (err) {
    console.error("VERIFY POST ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ======================================================================
// POST /auth/resend-verify-link   — ALWAYS RETURNS SUCCESS (No leak)
// ======================================================================
router.post("/resend-verify-link", async (req, res) => {
  try {
    const { email } = req.body;

    const r = await pool.query(
      "SELECT full_name, is_verified FROM users WHERE email=$1 LIMIT 1",
      [email]
    );

    // Always respond success to avoid email enumeration
    if (r.rowCount === 0)
      return res.json({
        message: "If this email exists, verification will be resent.",
      });

    const user = r.rows[0];

    if (user.is_verified)
      return res.json({ message: "Email already verified." });

    const token = crypto.randomBytes(32).toString("hex");

    await pool.query(
      `UPDATE users
       SET verification_token=$1,
           verification_expires = NOW() + INTERVAL '10 minutes'
       WHERE email=$2`,
      [token, email]
    );

    const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    try {
      await transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to: email,
        subject: "Verify Your CBT Master Account",
        html: htmlVerify(user.full_name, verifyLink),
        date: new Date().toUTCString(),
      });
    } catch (err) {
      console.error("RESEND EMAIL FAILED:", err);
    }

    return res.json({ message: "Verification link resent." });
  } catch (err) {
    console.error("RESEND ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ======================================================================
// POST /auth/login — FIXED (auto token refresh for unverified users)
// ======================================================================
// ======================================================================
// POST /auth/login — Professional, Secure, Complete
// ======================================================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // --------------------------------------------------------------
    // 1. Validate input
    // --------------------------------------------------------------
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // --------------------------------------------------------------
    // 2. Look up user
    // --------------------------------------------------------------
    const r = await pool.query(
      `
      SELECT id, full_name, email, password_hash, is_verified, role
      FROM users 
      WHERE email = $1 
      LIMIT 1
      `,
      [email]
    );

    if (r.rowCount === 0) {
      return res
        .status(401)
        .json({ message: "Incorrect email or password." });
    }

    const user = r.rows[0];

    // --------------------------------------------------------------
    // 3. Handle unverified accounts
    // --------------------------------------------------------------
    if (!user.is_verified) {
      const verifyToken = crypto.randomBytes(32).toString("hex");

      await pool.query(
        `
        UPDATE users 
        SET verification_token = $1,
            verification_expires = NOW() + INTERVAL '10 minutes'
        WHERE email = $2
        `,
        [verifyToken, email]
      );

      const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}`;

      // Send verification email in background (non-blocking)
      transporter
        .sendMail({
          from: process.env.FROM_EMAIL,
          to: email,
          subject: "Verify your CBT-Master account",
          html: htmlVerify(user.full_name, verifyLink),
          date: new Date().toUTCString(),
        })
        .catch((err) => console.error("LOGIN VERIFY EMAIL ERROR:", err));

      return res
        .status(403)
        .json({ message: "Email not verified. Verification link resent. Verification Mail may delay due to the network ", email });
    }

    // --------------------------------------------------------------
    // 4. Validate password
    // --------------------------------------------------------------
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res
        .status(401)
        .json({ message: "Incorrect email or password." });
    }

    // --------------------------------------------------------------
    // 5. Generate JWT
    // --------------------------------------------------------------
    const jwtToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    delete user.password_hash;

    // --------------------------------------------------------------
    // 6. Respond success
    // --------------------------------------------------------------
    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user,
      token: jwtToken,
    });

  } catch (err) {
    console.error("[LOGIN ERROR]", err.message);
    return res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
