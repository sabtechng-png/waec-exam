// =============================
// File: routes/authGoogleRoutes.js (FINAL)
// =============================
const express = require("express");
const router = express.Router();
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");

// Google Client ID from .env
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /auth/google
router.post("/", async (req, res) => {
  try {
    const { id_token } = req.body;

    if (!id_token) {
      return res.status(400).json({ message: "Missing Google token" });
    }

    // Verify ID Token
    const ticket = await googleClient.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const fullName = payload.name;

    if (!email) {
      return res.status(400).json({ message: "Google login failed" });
    }

    // Check if user exists
    const existing = await pool.query(
      "SELECT id, full_name, email, role FROM users WHERE email=$1",
      [email]
    );

    let user;

    if (existing.rowCount > 0) {
      user = existing.rows[0];
    } else {
      // Auto-create Google users as STUDENTS
      const insert = await pool.query(
        `INSERT INTO users (full_name, email, password_hash, is_verified, role)
         VALUES ($1, $2, NULL, true, 'student')
         RETURNING id, full_name, email, role`,
        [fullName, email]
      );

      user = insert.rows[0];
    }

    // Create JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Google login successful",
      user,
      token,
    });
  } catch (err) {
    console.error("GOOGLE LOGIN ERROR:", err);
    return res.status(500).json({
      message: "Google authentication failed",
    });
  }
});

module.exports = router;
