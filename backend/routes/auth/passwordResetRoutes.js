// backend/routes/passwordResetRoutes.js
const express = require("express");
const router = express.Router();
const { pool } = require("../../db");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// ----------------------------------
// MAIL TRANSPORT
// ----------------------------------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ----------------------------------
// SEND RESET LINK
// POST /auth/password/request
// ----------------------------------
router.post("/request", async (req, res) => {
  try {
    const { email } = req.body;

    console.log("📩 Password reset requested for:", email);

    const q = await pool.query(
      "SELECT id, full_name FROM users WHERE email=$1",
      [email]
    );

    // Always return generic response for security
    if (q.rowCount === 0) {
      console.log("⚠️ No user found with that email (but sending generic reply)");
      return res.json({
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    const user = q.rows[0];
    console.log("✅ User found for reset:", user.id, user.full_name);

    // Generate RANDOM reset token
    const token = crypto.randomBytes(32).toString("hex");

    // Save to DB and confirm it actually updated
    const updated = await pool.query(
  `
  UPDATE users 
  SET reset_token=$1,
      reset_token_expiry = NOW() + INTERVAL '15 minutes'
  WHERE id::text = $2::text
  `,
  [token, String(user.id)]
);

    if (updated.rowCount === 0) {
      console.error(
        "❌ UPDATE users ... WHERE id=$2 affected 0 rows. Something is wrong."
      );
      return res
        .status(500)
        .json({ message: "Server error setting reset token" });
    }

    console.log("✅ Reset token set:", updated.rows[0]);

    const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: "Reset Your Password",
      html: `
        <h2>Password Reset</h2>
        <p>Hello ${user.full_name},</p>
        <p>Click the button below to reset your password:</p>
        <a 
           href="${link}"
           style="display:inline-block;background:#0d6efd;padding:12px 22px;color:white;
                  text-decoration:none;border-radius:8px;font-size:16px;margin-top:10px;">
           Reset Password
        </a>
        <p style="margin-top:15px;">This link expires in 15 minutes.</p>
      `,
    });

    return res.json({
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (err) {
    console.error("RESET REQUEST ERROR:", err);
    res.status(500).json({ message: "Server error sending reset link" });
  }
});

// ----------------------------------
// VALIDATE TOKEN
// POST /auth/password/validate-token
// ----------------------------------
router.post("/validate-token", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Invalid or expired link" });
    }

    const q = await pool.query(
      `
      SELECT id FROM users
      WHERE reset_token=$1
      AND reset_token_expiry > NOW()
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

// ----------------------------------
// RESET PASSWORD
// POST /auth/password/reset
// ----------------------------------
router.post("/reset", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const q = await pool.query(
      `
      SELECT id, reset_token_expiry FROM users 
      WHERE reset_token=$1 LIMIT 1
      `,
      [token]
    );

    if (q.rowCount === 0) {
      return res
        .status(400)
        .json({
          message:
            "This reset link has already been used or is invalid.",
        });
    }

    const user = q.rows[0];

    // Check expiration
    const now = await pool.query("SELECT NOW() as now");
    if (now.rows[0].now > user.reset_token_expiry) {
      return res.status(400).json({ message: "Reset link expired" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Update & clear token
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

    console.log("✅ Password reset successful for user:", user.id);

    return res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("RESET ERROR:", err);
    res.status(500).json({ message: "Server error resetting password" });
  }
});

module.exports = router;
