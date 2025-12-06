// =======================================================
// routes/authGoogleRoutes.js
// Supports BOTH:
//  1) ID-token flow  -> POST /auth/google      (current)
//  2) OAuth "code"   -> GET  /auth/google/login
//                       GET  /auth/google/callback
// =======================================================

const express = require("express");
const router = express.Router();
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");

// ---------- GOOGLE CLIENTS ----------

// For verifying ID tokens (One Tap / GSI)
const idTokenClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// For OAuth "code" redirect flow (full Google page)
const oauthClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_OAUTH_REDIRECT_URI
);

// ---------- HELPER: FIND OR CREATE USER ----------

async function findOrCreateUser({ email, fullName }) {
  if (!email) {
    throw new Error("Email is required from Google payload");
  }

  // Check if user already exists
  const existing = await pool.query(
    "SELECT id, full_name, email, role, is_verified FROM users WHERE email = $1",
    [email]
  );

  let user;

  if (existing.rowCount > 0) {
    user = existing.rows[0];

    // If they were previously unverified (email/password signup),
    // mark them verified now because Google confirmed the email.
    if (!user.is_verified) {
      await pool.query(
        "UPDATE users SET is_verified = true WHERE id = $1",
        [user.id]
      );
      user.is_verified = true;
    }
  } else {
    // New user via Google: no password, auto-verified, default role "student"
    const inserted = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, is_verified, role)
       VALUES ($1, $2, NULL, true, 'student')
       RETURNING id, full_name, email, role, is_verified`,
      [fullName || email.split("@")[0], email]
    );
    user = inserted.rows[0];
  }

  return user;
}

// ---------- HELPER: ISSUE JWT TOKEN ----------

function createJwtForUser(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// =======================================================
// 1) ID-TOKEN FLOW  (keeps your current behavior)
//    POST /auth/google  with { id_token }
// =======================================================

router.post("/", async (req, res) => {
  try {
    const { id_token } = req.body;

    if (!id_token) {
      return res.status(400).json({ message: "Missing Google id_token" });
    }

    // Verify ID token
    const ticket = await idTokenClient.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const email = payload?.email;
    const fullName = payload?.name;

    const user = await findOrCreateUser({ email, fullName });
    const token = createJwtForUser(user);

    return res.json({
      message: "Google login successful",
      user,
      token,
    });
  } catch (err) {
    console.error("GOOGLE LOGIN ERROR (ID TOKEN):", err);
    return res.status(500).json({
      message: "Google authentication failed",
    });
  }
});

// =======================================================
// 2) OAUTH "CODE" FLOW (FULL GOOGLE PAGE)
//    a) GET /auth/google/login     -> redirect to Google
//    b) GET /auth/google/callback  -> Google redirects back here
// =======================================================

// a) Start OAuth login
router.get("/login", (req, res) => {
  try {
    const url = oauthClient.generateAuthUrl({
      access_type: "offline",
      prompt: "select_account",
      scope: [
        "openid",
        "email",
        "profile",
      ],
    });

    return res.redirect(url);
  } catch (err) {
    console.error("GOOGLE OAUTH LOGIN URL ERROR:", err);
    return res.status(500).send("Unable to start Google login.");
  }
});

// b) OAuth callback
router.get("/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("Missing authorization code from Google.");
  }

  try {
    // Exchange code for tokens
    const { tokens } = await oauthClient.getToken(code);
    oauthClient.setCredentials(tokens);

    // Get user info from ID token (preferred) or userinfo endpoint
    let email, fullName;

    if (tokens.id_token) {
      const ticket = await idTokenClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload?.email;
      fullName = payload?.name;
    }

    if (!email) {
      // Fallback: call Google userinfo endpoint
      const ticket = await oauthClient.getIdToken();
      // In most cases, the id_token above is enough; this is a safety net.
    }

    const user = await findOrCreateUser({ email, fullName });
    const token = createJwtForUser(user);

    // Redirect back to frontend with token & minimal info.
    // You can handle this on the frontend in /google-success route.
    const frontendBase = process.env.FRONTEND_URL || "http://localhost:3000";
    const redirectUrl =
      `${frontendBase}/google-success` +
      `?token=${encodeURIComponent(token)}` +
      `&email=${encodeURIComponent(user.email)}` +
      `&name=${encodeURIComponent(user.full_name)}`;

    return res.redirect(redirectUrl);
  } catch (err) {
    console.error("GOOGLE OAUTH CALLBACK ERROR:", err);
    return res.status(500).send("Google login failed. Please try again.");
  }
});

module.exports = router;
