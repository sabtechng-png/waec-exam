const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const nodemailer = require("nodemailer");
const moment = require("moment-timezone");

// Nigeria timezone fix
const nowNG = () => moment().tz("Africa/Lagos");

// EMAIL SENDER
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// REGISTER USER
exports.registerUser = async (req, res) => {
  const { full_name, email, password } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);

    const user = await pool.query(
      `INSERT INTO users (full_name, email, password_hash)
       VALUES ($1,$2,$3) RETURNING id, email`,
      [full_name, email, hashed]
    );

    // Generate token valid for 10 minutes
    const token = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    // Save token + real Nigeria expiry time
    const expiryTime = nowNG().add(10, "minutes").format("YYYY-MM-DD HH:mm:ss");

    await pool.query(
      `UPDATE users SET verification_token=$1, verification_expires=$2 WHERE email=$3`,
      [token, expiryTime, email]
    );

    // SEND EMAIL
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: "Verify Your Email",
      html: `
      <h2>Hello ${full_name},</h2>
      <p>Click the button below to activate your account:</p>
      <a href="${process.env.FRONTEND_URL}/verify-email?token=${token}"
         style="display:inline-block;padding:10px 20px;margin-top:10px;background:#007bff;color:white;text-decoration:none;border-radius:6px;">
         Verify Email
      </a>
      <p>This link expires in <b>10 minutes</b>.</p>
      `,
    });

    res.json({ success: true, message: "Registration successful. Check your email." });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// VERIFY EMAIL
exports.verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    // 1. Decode Token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.json({ success: false, message: "Invalid or expired token" });
    }

    const email = decoded.email;

    // 2. Fetch User
    const userCheck = await pool.query(
      `SELECT id, verification_expires FROM users WHERE email=$1`,
      [email]
    );

    if (userCheck.rowCount === 0)
      return res.json({ success: false, message: "Invalid verification link" });

    const user = userCheck.rows[0];

    // Convert DB UTC time → Lagos time
    const dbExpiryNG = moment(user.verification_expires).tz("Africa/Lagos");

    if (nowNG().isAfter(dbExpiryNG)) {
      return res.json({ success: false, message: "Expired link" });
    }

    // 3. Mark email verified
    await pool.query(
      `UPDATE users SET is_verified=true, verification_token=NULL, verification_expires=NULL WHERE email=$1`,
      [email]
    );

    res.json({ success: true, message: "Email verified successfully" });
  } catch (err) {
    console.error("Verify error:", err);
    res.json({ success: false, message: "Server error" });
  }
};


// RESEND VERIFICATION LINK
exports.resendVerificationLink = async (req, res) => {
  const { email } = req.body;

  try {
    const check = await pool.query(
      `SELECT full_name FROM users WHERE email=$1`,
      [email]
    );

    if (check.rowCount === 0)
      return res.json({ success: false, message: "Email not found" });

    const fullName = check.rows[0].full_name;

    // Generate new token
    const token = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    const expiry = nowNG().add(10, "minutes").format("YYYY-MM-DD HH:mm:ss");

    await pool.query(
      `UPDATE users SET verification_token=$1, verification_expires=$2 WHERE email=$3`,
      [token, expiry, email]
    );

    // Send email again
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: "Resend Email Verification",
      html: `
      <h2>Hello ${fullName},</h2>
      <p>Click below to verify your email:</p>
      <a href="${process.env.FRONTEND_URL}/verify-email?token=${token}"
         style="display:inline-block;padding:10px 20px;background:#007bff;color:white;text-decoration:none;border-radius:6px;">
         Verify Email
      </a>
      `,
    });

    res.json({ success: true, message: "Verification link resent" });
  } catch (err) {
    console.error("Resend verify error:", err);
    res.json({ success: false, message: "Server error" });
  }
};
