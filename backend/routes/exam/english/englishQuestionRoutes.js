const express = require("express");
const router = express.Router();
const { pool } = require("../../../db");
const auth = require("../../../middleware/authMiddleware");

// =====================================================================
// LOAD ONE ENGLISH QUESTION
// GET /english-exam/:examId/question/:questionId
// =====================================================================
router.get("/:examId/question/:questionId", auth, async (req, res) => {
  const { examId, questionId } = req.params;
  const studentId = req.user.userId;

  try {
    // 1️⃣ Verify exam session belongs to student
    const exam = await pool.query(
      `SELECT 1 FROM english_exam_sessions
        WHERE id=$1 AND student_id=$2`,
      [examId, studentId]
    );

    if (!exam.rowCount) {
      return res.status(404).json({ message: "Exam not found." });
    }

    // 2️⃣ Identify question type from english_exam_question_order
    const orderRes = await pool.query(
      `SELECT question_type
         FROM english_exam_question_order
        WHERE exam_id=$1 AND question_id=$2`,
      [examId, questionId]
    );

    if (!orderRes.rowCount) {
      return res.status(404).json({ message: "Question not in this exam." });
    }

    const questionType = orderRes.rows[0].question_type;

    // 3️⃣ Fetch from the right table
    let qRes;

    if (questionType === "passage") {
      qRes = await pool.query(
        `SELECT id, question, option_a, option_b, option_c, option_d
           FROM english_passage_questions
          WHERE id=$1`,
        [questionId]
      );
    } else {
      qRes = await pool.query(
        `SELECT id, question, option_a, option_b, option_c, option_d
           FROM english_objective_questions
          WHERE id=$1`,
        [questionId]
      );
    }

    if (!qRes.rowCount) {
      return res.status(404).json({ message: "Question not found." });
    }

    // 4️⃣ Return question
    return res.json({
      question_type: questionType,
      ...qRes.rows[0]
    });

  } catch (error) {
    console.error("🔥 English question load error:", error);
    return res.status(500).json({ message: "Failed to load English question." });
  }
});

module.exports = router;
