// ===========================================================
// Google Authentication Route (FINAL PRODUCTION VERSION)
// ===========================================================

const express = require("express");
const router = express.Router();
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");

// Google OAuth2 Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ===========================================================
// POST /auth/google
// Login or Register User Using Google
// ===========================================================

router.post("/", async (req, res) => {
  try {
    const { id_token } = req.body;

    if (!id_token) {
      return res.status(400).json({ message: "Missing Google token" });
    }

    // 1. VERIFY GOOGLE TOKEN
    const ticket = await googleClient.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const email = payload?.email;
    const fullName = payload?.name;

    if (!email) {
      return res.status(400).json({ message: "Google authentication failed" });
    }

    // ----------------------------------------------------
    // 2. CHECK IF USER ALREADY EXISTS
    // ----------------------------------------------------
    const existingUser = await pool.query(
      "SELECT id, full_name, email, role, is_verified FROM users WHERE email = $1",
      [email]
    );

    let user;

    if (existingUser.rowCount > 0) {
      // Existing user found
      user = existingUser.rows[0];

      // Auto-verify if not verified already
      if (!user.is_verified) {
        await pool.query(
          "UPDATE users SET is_verified = true WHERE id = $1",
          [user.id]
        );
        user.is_verified = true;
      }
    } else {
      // ----------------------------------------------------
      // 3. CREATE NEW GOOGLE USER
      // ----------------------------------------------------
      const insertUser = await pool.query(
        `INSERT INTO users (
            full_name,
            email,
            password_hash,
            is_verified,
            role
        ) VALUES ($1, $2, NULL, true, 'student')
        RETURNING id, full_name, email, role, is_verified`,
        [fullName, email]
      );

      user = insertUser.rows[0];
    }

    // ----------------------------------------------------
    // 4. CREATE SESSION JWT TOKEN
    // ----------------------------------------------------
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ----------------------------------------------------
    // 5. SEND RESPONSE
    // ----------------------------------------------------
    return res.json({
      message: "Google authentication successful",
      user,
      token,
    });
  } catch (err) {
    console.error("GOOGLE AUTH ERROR:", err);
    return res.status(500).json({
      message: "Google authentication failed",
    });
  }
});

module.exports = router;
