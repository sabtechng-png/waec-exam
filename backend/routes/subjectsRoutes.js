const express = require("express");
const router = express.Router();
const { pool } = require("../db");
const auth = require("../middleware/authMiddleware");

/**
 * ---------------------------------------------------------------------
 * GET /api/subjects
 * Returns all subjects with their registration status for logged-in student.
 * Matches your StudentSubjectsPage.jsx expectation (setSubjects(res.data)).
 * ---------------------------------------------------------------------
 */
router.get("/", auth, async (req, res) => {
  const studentId = req.user.userId; // from token payload

  if (!studentId) {
    return res.status(401).json({ message: "Unauthorized - no student ID" });
  }

  try {
    // Get all subjects
    const subjectsRes = await pool.query(
      "SELECT id, name, code, active FROM subjects ORDER BY id ASC"
    );

    // Get registration data for this student
    const regRes = await pool.query(
      `SELECT subject_id, mode, status
         FROM student_subjects
        WHERE student_id=$1 AND archived=FALSE`,
      [studentId]
    );

    const regMap = {};
    for (const r of regRes.rows) {
      regMap[r.subject_id] = r.status;
    }

    // Merge data for frontend
    const subjects = subjectsRes.rows.map((s) => ({
      ...s,
      registered_status: regMap[s.id] || "none",
    }));

    // Return only what your UI expects
    return res.json(subjects);
  } catch (err) {
    console.error("GET /api/subjects error:", err.message);
    return res.status(500).json({ message: "Server error fetching subjects" });
  }
});

module.exports = router;
