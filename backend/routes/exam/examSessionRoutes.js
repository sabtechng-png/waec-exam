const express = require("express");
const router = express.Router();

const { pool } = require("../../db");
const auth = require("../../middleware/authMiddleware");

// ================================================
// GET /exam/session/:examId
// Returns full exam session info + questions + answers
// ================================================
router.get("/session/:examId", auth, async (req, res) => {
  const studentId = req.user.userId;
  const { examId } = req.params;

  try {
    // 1️⃣ Load exam + subject info
    const examRes = await pool.query(
      `
      SELECT 
        es.id,
        es.status,
        es.remaining_minutes,
        es.subject_id,
        s.name AS subject_name,
        s.code AS subject_code
      FROM exam_sessions es
      JOIN subjects s ON s.id = es.subject_id
      WHERE es.id = $1 AND es.student_id = $2
      `,
      [examId, studentId]
    );

    if (examRes.rowCount === 0) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const exam = examRes.rows[0];

    // 2️⃣ Load ordered questions
    const qRes = await pool.query(
      `
      SELECT 
        q.id,
        q.question,
        q.stem_image_url,
        q.option_a, q.option_b, q.option_c, q.option_d,
        q.option_a_image_url, q.option_b_image_url,
        q.option_c_image_url, q.option_d_image_url,
        eq.seq
      FROM exam_question_order eq
      JOIN questions q ON q.id = eq.question_id
      WHERE eq.exam_id = $1
      ORDER BY eq.seq ASC
      `,
      [examId]
    );

    // 3️⃣ Load saved answers
    const ansRes = await pool.query(
      `
      SELECT question_id, selected_option, flagged 
      FROM exam_answers
      WHERE exam_id = $1
      `,
      [examId]
    );

    return res.json({
      exam,
      questions: qRes.rows,
      answers: ansRes.rows
    });

  } catch (err) {
    console.error("❌ Error loading exam session:", err);
    return res.status(500).json({ message: "Server error loading exam" });
  }
});

module.exports = router;
