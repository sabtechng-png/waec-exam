const express = require("express");
const router = express.Router();
const { pool } = require("../db");

// GET /public/subjects
router.get("/subjects", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, code FROM subjects WHERE status = true ORDER BY name ASC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Public subjects error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
