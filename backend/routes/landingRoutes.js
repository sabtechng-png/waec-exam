const express = require("express");
const router = express.Router();
const { pool } = require("../db");

// GET /landing/content
router.get("/content", async (req, res) => {
  try {
    // 1. Get number of tests taken this week
    const countRes = await pool.query(`
      SELECT COUNT(*) AS total
      FROM exam_sessions 
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `);

    const testsTaken = parseInt(countRes.rows[0].total) || 0;

    // 2. Leaderboard Preview (top 5)
    const leaderboardRes = await pool.query(`
      SELECT u.full_name, es.score
      FROM exam_sessions es
      JOIN users u ON es.student_id = u.id
      WHERE es.score IS NOT NULL
      ORDER BY es.score DESC
      LIMIT 5
    `);

    // 3. Popular Subjects
    const subjectsRes = await pool.query(`
      SELECT name FROM subjects ORDER BY id LIMIT 5
    `);

    // 4. Testimonials (static for now)
    const testimonials = [
      { quote: "I moved from 58% to 78% in 3 weeks.", name: "Olamide, SS3" },
      { quote: "Closest to real WAEC CBT I have seen.", name: "Mrs. Bisi (Teacher)" },
      { quote: "The progress chart keeps me consistent.", name: "Hassan, SS2" },
    ];

    // 5. FAQ (static for now)
    const faqList = [
      { q: "Is it really free?", a: "Yes, practicing is 100% free." },
      { q: "Do I need an account?", a: "You can practice as a guest or create an account for more features." },
      { q: "Is this real WAEC format?", a: "Yes, fully simulated CBT." }
    ];

    return res.json({
      testsTaken,
      leaderboard: leaderboardRes.rows,
      subjects: subjectsRes.rows.map(s => s.name),
      testimonials,
      faqList
    });

  } catch (error) {
    console.error("Landing content error:", error);
    res.status(500).json({ message: "Failed to load landing content" });
  }
});

module.exports = router;
