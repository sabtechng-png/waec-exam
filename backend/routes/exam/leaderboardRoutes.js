const express = require("express");
const router = express.Router();
const { pool } = require("../../db");
const auth = require("../../middleware/authMiddleware");

/*
====================================================
 LEADERBOARD WITH PAGINATION + BEST SUBJECT
====================================================
*/
router.get("/", auth, async (req, res) => {
  try {
    let { page, limit } = req.query;

    page = Number(page) || 1;
    limit = Number(limit) || 50;

    const offset = (page - 1) * limit;

    // 1️⃣ MAIN LEADERBOARD QUERY WITH PAGINATION
    const leaderboard = await pool.query(
      `
      SELECT 
        u.id AS student_id,
        u.full_name,
        COUNT(es.id) AS exams_taken,
        AVG(es.score) AS avg_score,
        MAX(es.score) AS best_score
      FROM exam_sessions es
      JOIN users u ON u.id = es.student_id
      WHERE es.status = 'submitted'
      GROUP BY u.id
      HAVING COUNT(es.id) > 0
      ORDER BY avg_score DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    const ranked = leaderboard.rows;

    // 2️⃣ FETCH BEST SUBJECT FOR EACH STUDENT
    for (let item of ranked) {
      const bestSubject = await pool.query(
        `
        SELECT s.name AS subject_name, es.score
        FROM exam_sessions es
        JOIN subjects s ON s.id = es.subject_id
        WHERE es.student_id = $1
        ORDER BY es.score DESC
        LIMIT 1
        `,
        [item.student_id]
      );

      item.best_subject = bestSubject.rows.length
        ? bestSubject.rows[0].subject_name
        : "N/A";
    }

    // 3️⃣ TOTAL COUNT FOR PAGINATION
    const totalCount = await pool.query(`
      SELECT COUNT(*) FROM (
        SELECT u.id
        FROM exam_sessions es
        JOIN users u ON u.id = es.student_id
        WHERE es.status='submitted'
        GROUP BY u.id
      ) t
    `);

    return res.json({
      leaderboard: ranked,
      pagination: {
        currentPage: page,
        limit,
        totalStudents: Number(totalCount.rows[0].count),
        totalPages: Math.ceil(totalCount.rows[0].count / limit),
      },
    });
  } catch (err) {
    console.error("🔥 LEADERBOARD ERROR:", err);
    return res.status(500).json({ message: "Failed to load leaderboard." });
  }
});

module.exports = router;
