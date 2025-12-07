const express = require("express");
const router = express.Router();
const { pool } = require("../../db");
const auth = require("../../middleware/authMiddleware");
/*
====================================================
 GET MY RANK (GLOBAL + PER SUBJECT)
====================================================
*/
router.get("/", auth, async (req, res) => {
  try {
    const studentId = req.user.id;

    // -------- GLOBAL RANK --------
    const globalData = await pool.query(
      `
      SELECT
        u.id,
        COUNT(es.id) AS exams_taken,
        COALESCE(AVG(es.score), 0) AS avg_score,
        COALESCE(MAX(es.score), 0) AS best_score
      FROM users u
      LEFT JOIN exam_sessions es
        ON es.student_id = u.id AND es.status = 'submitted'
      GROUP BY u.id
      ORDER BY best_score DESC, avg_score DESC
      `
    );

    let globalRank = null;
    globalData.rows.forEach((row, index) => {
      if (row.id === studentId) {
        globalRank = index + 1;
      }
    });

    // -------- SUBJECT RANKS --------
    const subjectRanks = await pool.query(
      `
      SELECT
        s.id AS subject_id,
        s.name AS subject_name,
        COUNT(es.id) AS exams_taken,
        COALESCE(AVG(es.score), 0) AS avg_score,
        COALESCE(MAX(es.score), 0) AS best_score
      FROM subjects s
      LEFT JOIN exam_sessions es
        ON es.subject_id = s.id
       AND es.student_id = $1
       AND es.status = 'submitted'
      GROUP BY s.id
      ORDER BY s.id
      `,
      [studentId]
    );

    // -------- BADGE LOGIC --------
    const bestScore =
      globalData.rows.find((r) => r.id === studentId)?.best_score || 0;

    let badge = {
      name: "Keep Improving",
      icon: "💪",
      color: "default",
    };

    if (bestScore >= 85) badge = { name: "Gold Master", icon: "🥇", color: "gold" };
    else if (bestScore >= 70)
      badge = { name: "Silver Performer", icon: "🥈", color: "silver" };
    else if (bestScore >= 50)
      badge = { name: "Bronze Achiever", icon: "🥉", color: "bronze" };

    return res.json({
      globalRank,
      totalStudents: globalData.rowCount,
      badge,
      subjects: subjectRanks.rows,
    });
  } catch (err) {
    console.error("MY RANK ERROR:", err);
    return res.status(500).json({ message: "Failed to load rank info." });
  }
});

module.exports = router;
