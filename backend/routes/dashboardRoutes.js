// ===================== dashboardRoutes.js =====================
const express = require("express");
const router = express.Router();
const { pool } = require("../db");
const auth = require("../middleware/authMiddleware");

// -------------------------------------------------------
// GET /dashboard/student
// Returns: summary counts, performance stats, trends, last exam,
// best subject, weak subjects, and activity overview.
// -------------------------------------------------------
router.get("/student", auth, async (req, res) => {
  const studentId = req.user.userId;

  try {
    // 1️⃣ Subject registrations summary
    const subjects = await pool.query(
      `SELECT status FROM student_subjects
       WHERE student_id=$1 AND archived=FALSE`,
      [studentId]
    );

    const pending = subjects.rows.filter((s) => s.status === "pending").length;
    const in_progress = subjects.rows.filter((s) => s.status === "in_progress").length;
    const completed = subjects.rows.filter((s) => s.status === "completed").length;

    // 2️⃣ All submitted exam results
    const results = await pool.query(
      `SELECT es.id AS exam_id, es.score, es.subject_id, es.submitted_at,
              s.name AS subject_name, s.code
       FROM exam_sessions es
       JOIN subjects s ON s.id = es.subject_id
       WHERE es.student_id=$1 AND es.status='submitted'
       ORDER BY es.submitted_at DESC`,
      [studentId]
    );

    const total_attempts = results.rowCount;
    const avg_score = results.rowCount
      ? Math.round(results.rows.reduce((a, b) => a + b.score, 0) / results.rowCount)
      : 0;
    const last_exam = results.rows[0] || null;

    // 3️⃣ Best subject
    const best_subject = results.rows.length
      ? results.rows.reduce((best, curr) =>
          curr.score > best.score ? curr : best
        )
      : null;

    // 4️⃣ Weak subjects (score < 50)
    const weak_subjects = results.rows.filter((r) => r.score < 50);

    // 5️⃣ Trends for charts
    const trends = await pool.query(
      `SELECT s.name AS subject_name, es.score, es.submitted_at
       FROM exam_sessions es
       JOIN subjects s ON s.id = es.subject_id
       WHERE es.student_id=$1 AND es.status='submitted'
       ORDER BY es.submitted_at ASC`,
      [studentId]
    );

    res.json({
      summary: {
        pending,
        in_progress,
        completed,
        total_attempts,
        avg_score,
      },
      last_exam,
      best_subject,
      weak_subjects,
      trends: trends.rows,
      all_results: results.rows,
    });
  } catch (err) {
    console.error("DASHBOARD ERROR:", err);
    return res.status(500).json({ message: "Error loading dashboard." });
  }
});

module.exports = router;
