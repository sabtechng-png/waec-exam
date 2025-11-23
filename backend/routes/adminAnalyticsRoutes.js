// routes/adminAnalyticsRoutes.js
const express = require("express");
const router = express.Router();
const { pool } = require("../db");
const auth = require("../middleware/authMiddleware");

// Admin-only guard
function mustBeAdmin(req, res) {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({ message: "Forbidden — Admin Only" });
    return true;
  }
  return false;
}

// GET /admin/analytics
router.get("/", auth, async (req, res) => {
  if (mustBeAdmin(req, res)) return;

  try {
    // 1️⃣ Subject Performance Trends
    const subjectPerformance = await pool.query(
      `
      SELECT s.name AS subject_name,
             AVG(es.score) AS average_score,
             COUNT(es.id) AS total_attempts
      FROM exam_sessions es
      JOIN subjects s ON s.id = es.subject_id
      WHERE es.status = 'submitted'
      GROUP BY s.id
      ORDER BY total_attempts DESC
      `
    );

    // 2️⃣ Student Performance Breakdown
    const studentPerformance = await pool.query(
      `
      SELECT u.full_name, AVG(es.score) AS average_score, COUNT(es.id) AS total_attempts
      FROM exam_sessions es
      JOIN users u ON u.id = es.student_id
      WHERE es.status = 'submitted'
      GROUP BY u.id
      ORDER BY average_score DESC
      LIMIT 5
      `
    );

    // 3️⃣ Difficulty Level Breakdown (correct answers vs total attempts)
 // Difficulty Level Breakdown (correct answers vs total attempts)
const questionDifficulty = await pool.query(
  `
  SELECT q.difficulty, COUNT(ea.id) AS total_attempts,
         SUM(CASE WHEN ea.is_correct THEN 1 ELSE 0 END) AS correct_answers
  FROM exam_sessions es
  JOIN exam_answers ea ON ea.exam_id = es.id
  JOIN questions q ON q.id = ea.question_id
  GROUP BY q.difficulty
  ORDER BY total_attempts DESC
  `
);


    // 4️⃣ Student Activity Trends (last 7 days)
    const studentActivity = await pool.query(
      `
      SELECT DATE(submitted_at) AS day, COUNT(DISTINCT student_id) AS active_students
      FROM exam_sessions
      WHERE submitted_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(submitted_at)
      ORDER BY day ASC
      `
    );

    res.json({
      subjectPerformance: subjectPerformance.rows,
      studentPerformance: studentPerformance.rows,
      questionDifficulty: questionDifficulty.rows,
      studentActivity: studentActivity.rows,
    });
  } catch (err) {
    console.error("ADMIN ANALYTICS ERROR:", err);
    res.status(500).json({ message: "Error loading analytics data" });
  }
});

module.exports = router;
