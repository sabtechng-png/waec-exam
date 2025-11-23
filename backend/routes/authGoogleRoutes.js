// routes/authGoogleRoutes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { pool } = require("../db");

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// -------------------------------------------
// POST /auth/google
// Expects: { credential: <google_id_token> }
// -------------------------------------------
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential)
      return res.status(400).json({ message: "Missing Google credential" });

    // Verify Google ID Token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const full_name = payload.name;

    // Check if user exists
    const userRes = await pool.query(
      "SELECT id, full_name, email, role FROM users WHERE email=$1 LIMIT 1",
      [email]
    );

    let user;

    if (userRes.rowCount === 0) {
      // Create new user automatically
      const insert = await pool.query(
        `INSERT INTO users (full_name, email, is_verified, password_hash, role)
         VALUES ($1, $2, true, NULL, 'student')
         RETURNING id, full_name, email, role`,
        [full_name, email]
      );
      user = insert.rows[0];
    } else {
      user = userRes.rows[0];
    }

    // Issue JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Google login successful",
      user,
      token
    });

  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ message: "Google authentication failed" });
  }
});

module.exports = router;
