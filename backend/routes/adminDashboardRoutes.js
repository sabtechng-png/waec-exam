// routes/adminDashboardRoutes.js
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

// GET /admin/dashboard
router.get("/", auth, async (req, res) => {
  if (mustBeAdmin(req, res)) return;

  try {
    // 1️⃣ Total students
    const totalStudents = await pool.query(
      `SELECT COUNT(*) AS total FROM users WHERE role='student'`
    );

    // 2️⃣ Total subjects
    const totalSubjects = await pool.query(
      `SELECT COUNT(*) AS total FROM subjects`
    );

    // 3️⃣ Exams taken
    const totalExams = await pool.query(
      `SELECT COUNT(*) AS total FROM exam_sessions WHERE status='submitted'`
    );

    // 4️⃣ Total questions uploaded
    const totalQuestions = await pool.query(
      `SELECT COUNT(*) AS total FROM questions`
    );

    // 5️⃣ Recent exams (last 5)
    const recentExams = await pool.query(
      `
      SELECT es.id, es.score, es.submitted_at,
             u.full_name AS student_name,
             s.name AS subject_name
      FROM exam_sessions es
      JOIN users u ON u.id = es.student_id
      JOIN subjects s ON s.id = es.subject_id
      WHERE es.status='submitted'
      ORDER BY es.submitted_at DESC
      LIMIT 5
      `
    );

    // 6️⃣ Top 5 students by highest average score
    const topStudents = await pool.query(
      `
      SELECT u.full_name,
             ROUND(AVG(es.score)) AS avg_score,
             COUNT(es.id) AS attempts
      FROM exam_sessions es
      JOIN users u ON u.id = es.student_id
      WHERE es.status='submitted'
      GROUP BY u.id
      HAVING COUNT(es.id) > 0
      ORDER BY avg_score DESC
      LIMIT 5
      `
    );

    // 7️⃣ Daily active students (last 7 days)
    const activeStudents = await pool.query(
      `
      SELECT DATE(submitted_at) AS day, COUNT(DISTINCT student_id) AS count
      FROM exam_sessions
      WHERE submitted_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(submitted_at)
      ORDER BY day ASC;
      `
    );

    // 8️⃣ Subject popularity (attempt counts)
    const subjectPopularity = await pool.query(
      `
      SELECT s.name, COUNT(es.id) AS attempts
      FROM subjects s
      LEFT JOIN exam_sessions es ON es.subject_id = s.id
      GROUP BY s.id
      ORDER BY attempts DESC;
      `
    );

    res.json({
      summary: {
        students: Number(totalStudents.rows[0].total),
        subjects: Number(totalSubjects.rows[0].total),
        exams: Number(totalExams.rows[0].total),
        questions: Number(totalQuestions.rows[0].total),
      },
      recentExams: recentExams.rows,
      topStudents: topStudents.rows,
      activeStudents: activeStudents.rows,
      subjectPopularity: subjectPopularity.rows,
    });
  } catch (err) {
    console.error("ADMIN DASHBOARD ERROR:", err);
    res.status(500).json({ message: "Server error loading dashboard" });
  }
});

module.exports = router;
