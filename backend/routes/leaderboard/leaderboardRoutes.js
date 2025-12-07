const express = require("express");
const router = express.Router();
const { pool } = require("../../db");
const auth = require("../../middleware/authMiddleware");

// ===============================================================
// GLOBAL LEADERBOARD (BEST SCORE PER STUDENT)
// ===============================================================
router.get("/global", auth, async (req, res) => {
  try {
    const result = await pool.query(`
      WITH stats AS (
        SELECT
          es.student_id,
          u.full_name,
          COUNT(*) AS exams_taken,
          MAX(es.score) AS best_score,
          AVG(es.score)::numeric(5,2) AS avg_score
        FROM exam_sessions es
        JOIN users u ON u.id = es.student_id
        WHERE es.status = 'submitted'
          AND es.score IS NOT NULL
        GROUP BY es.student_id, u.full_name
      ),
      ranked AS (
        SELECT
          student_id,
          full_name,
          exams_taken,
          best_score,
          avg_score,
          RANK() OVER (ORDER BY best_score DESC, avg_score DESC) AS rank
        FROM stats
      )
      SELECT *
      FROM ranked
      ORDER BY rank ASC;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ error: "Failed to load leaderboard." });
  }
});

// ===============================================================
// SUBJECT LEADERBOARD
// ===============================================================
// SUBJECT LEADERBOARD (TOP 10)
router.get("/subject/:subjectId", auth, async (req, res) => {
  const subjectId = parseInt(req.params.subjectId, 10);
  if (isNaN(subjectId)) {
    return res.status(400).json({ error: "Invalid subject ID" });
  }

  try {
    // Validate subject exists
    const sub = await pool.query(
      `SELECT id, name, code FROM subjects WHERE id=$1 LIMIT 1`,
      [subjectId]
    );

    if (sub.rowCount === 0) {
      return res.status(404).json({ error: "Subject not found" });
    }

    const leaderboard = await pool.query(
      `
      WITH stats AS (
        SELECT
          es.student_id,
          u.full_name,
          COUNT(*) as exams_taken,
          MAX(es.score) AS best_score,
          AVG(es.score)::numeric(5,2) AS avg_score
        FROM exam_sessions es
        JOIN users u ON u.id = es.student_id
        WHERE es.subject_id = $1
          AND es.status = 'submitted'
          AND es.score IS NOT NULL
        GROUP BY es.student_id, u.full_name
      ),
      ranked AS (
        SELECT *,
          RANK() OVER (ORDER BY best_score DESC, avg_score DESC) AS rank
        FROM stats
      )
      SELECT *
      FROM ranked
      ORDER BY rank ASC
      LIMIT 10;
      `,
      [subjectId]
    );

    return res.json({
      subject: sub.rows[0],
      leaderboard: leaderboard.rows,
    });
  } catch (err) {
    console.error("Subject Leaderboard Error:", err);
    return res.status(500).json({ error: "Failed to load leaderboard." });
  }
});

/// ==========================================
// GET My Rank for a Specific Subject
// ==========================================
// MY RANK FOR SUBJECT
router.get("/subject/:subjectId/my-rank", auth, async (req, res) => {
  const studentId = req.user.userId;
  const subjectId = parseInt(req.params.subjectId, 10);

  if (isNaN(subjectId)) {
    return res.status(400).json({ error: "Invalid subject ID" });
  }

  try {
    // Validate subject exists
    const sub = await pool.query(
      `SELECT id, name, code FROM subjects WHERE id=$1 LIMIT 1`,
      [subjectId]
    );

    if (sub.rowCount === 0) {
      return res.status(404).json({ error: "Subject not found" });
    }

    const result = await pool.query(
      `
      WITH stats AS (
        SELECT
          es.student_id,
          u.full_name,
          AVG(es.score)::numeric(5,2) AS avg_score,
          MAX(es.score) AS best_score
        FROM exam_sessions es
        JOIN users u ON u.id = es.student_id
        WHERE es.subject_id = $1
          AND es.status = 'submitted'
          AND es.score IS NOT NULL
        GROUP BY es.student_id, u.full_name
      ),
      ranked AS (
        SELECT *,
          RANK() OVER (ORDER BY best_score DESC, avg_score DESC) AS rank
        FROM stats
      )
      SELECT *
      FROM ranked
      WHERE student_id = $2
      `,
      [subjectId, studentId]
    );

    // Total students in subject
    const totalCount = await pool.query(
      `
      SELECT COUNT(*) FROM (
        SELECT DISTINCT student_id
        FROM exam_sessions
        WHERE subject_id=$1 AND status='submitted' AND score IS NOT NULL
      ) x
      `,
      [subjectId]
    );

    const totalStudents = parseInt(totalCount.rows[0].count);

    if (result.rowCount === 0) {
      return res.json({
        subject: sub.rows[0],
        rank: null,
        total_students: totalStudents,
        message: "You have no submitted exam for this subject."
      });
    }

    const my = result.rows[0];

    return res.json({
      subject: sub.rows[0],
      student_id: my.student_id,
      full_name: my.full_name,
      best_score: my.best_score,
      avg_score: my.avg_score,
      rank: my.rank,
      total_students: totalStudents,
      percentile: ((my.rank / totalStudents) * 100).toFixed(2) + "%"
    });
  } catch (err) {
    console.error("My Rank Error:", err);
    return res.status(500).json({ error: "Failed to load my rank" });
  }
});


module.exports = router;
