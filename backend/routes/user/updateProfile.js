const express = require("express");
const router = express.Router();
const { pool } = require("../../db");
const auth = require("../../middleware/authMiddleware");

router.get("/me", auth, async (req, res) => {
  try {
    const user = await pool.query(
      "SELECT id, full_name, email FROM users WHERE id=$1",
      [req.user.id]
    );
    res.json(user.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error loading profile" });
  }
});

router.post("/update-profile", auth, async (req, res) => {
  try {
    await pool.query(
      "UPDATE users SET full_name=$1 WHERE id=$2",
      [req.body.full_name, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Error updating profile" });
  }
});

module.exports = router;
