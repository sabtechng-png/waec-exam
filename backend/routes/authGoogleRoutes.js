// ==============================================
// CBT Master — Google Authentication (Upgraded)
// ==============================================

const express = require("express");
const router = express.Router();
const { OAuth2Client } = require("google-auth-library");
const pool = require("../db");
const jwt = require("jsonwebtoken");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Utility: Generate unique CBT USER ID
function generateUserId() {
  return "CBT-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Utility: Safe name split
function splitName(fullName) {
  const parts = fullName.trim().split(" ");
  return {
    first_name: parts[0] || "",
    last_name: parts.slice(1).join(" ") || "",
  };
}

// GOOGLE LOGIN / REGISTER
router.post("/", async (req, res) => {
  try {
    const { id_token } = req.body;

    if (!id_token)
      return res.status(400).json({ message: "Missing Google token" });

    // Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const email = payload.email;
    const email_verified = payload.email_verified;
    const full_name = payload.name;
    const picture = payload.picture;
    const google_id = payload.sub;

    if (!email_verified) {
      return res.status(400).json({ message: "Google email not verified" });
    }

    // Split name
    const { first_name, last_name } = splitName(full_name);

    // Check if email already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    let user;

    if (existingUser.rows.length > 0) {
      // Existing user — login
      user = existingUser.rows[0];

      // OPTIONAL: prevent mixing providers
      if (user.provider !== "google") {
        return res.status(400).json({
          message: "Email already registered. Use email & password login.",
        });
      }

      // Update last login timestamp
      await pool.query(
        "UPDATE users SET last_login = NOW() WHERE email = $1",
        [email]
      );
    } else {
      // New user — register
      const user_id = generateUserId();

      const insertUser = await pool.query(
        `INSERT INTO users 
          (user_id, first_name, last_name, email, provider, google_id, profile_photo, is_verified, role, created_at, last_login)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),NOW())
        RETURNING *`,
        [
          user_id,
          first_name,
          last_name,
          email,
          "google",
          google_id,
          picture,
          true,
          "student", // default role
        ]
      );

      user = insertUser.rows[0];
    }

    // Create JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Analytics insert
    await pool.query(
      `INSERT INTO login_logs (email, provider, login_time, user_agent)
       VALUES ($1, $2, NOW(), $3)`,
      [email, "google", req.headers["user-agent"] || ""]
    );

    return res.json({
      message: "Google login successful",
      user,
      token,
    });

  } catch (error) {
    console.error("GOOGLE LOGIN ERROR:", error);
    return res.status(500).json({
      message: "Google login failed",
      error: error.message,
    });
  }
});

module.exports = router;
