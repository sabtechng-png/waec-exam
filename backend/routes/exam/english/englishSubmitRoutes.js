const express = require("express");
const router = express.Router();
const { pool } = require("../../../db");
const auth = require("../../../middleware/authMiddleware");

// =============================================================
// SUBMIT ENGLISH EXAM
// POST /english-exam/:examId/submit
// =============================================================
router.post("/:examId/submit", auth, async (req, res) => {
  const studentId = req.user.userId; // UUID
  const { examId } = req.params;
  const { remaining_seconds } = req.body || {};

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Validate exam session belongs to student
    const examRes = await client.query(
      `SELECT id, status
         FROM english_exam_sessions
        WHERE id=$1 AND student_id=$2
        LIMIT 1`,
      [examId, studentId]
    );

    if (!examRes.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "English exam not found." });
    }

    const exam = examRes.rows[0];

    if (exam.status === "submitted") {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Exam already submitted." });
    }

    // 2️⃣ Fetch all ordered questions for this exam
    const qOrderRes = await client.query(
      `SELECT question_type, question_id
         FROM english_exam_question_order
        WHERE exam_id=$1
        ORDER BY seq ASC`,
      [examId]
    );

    const questionRows = qOrderRes.rows;

    if (questionRows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "No English exam questions found." });
    }

    // 3️⃣ Fetch all student answers
    const ansRes = await client.query(
      `SELECT question_id, selected_option
         FROM english_exam_answers
        WHERE exam_id=$1 AND student_id=$2`,
      [examId, studentId]
    );

    const answerMap = new Map();
    ansRes.rows.forEach((r) => {
      answerMap.set(r.question_id, r.selected_option);
    });

    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    // 4️⃣ Evaluate each question based on question_type
    for (const row of questionRows) {
      const { question_type, question_id } = row;

      // Get student's chosen option
      const studentChoice = answerMap.get(question_id);
      let correctOpt;

      if (question_type === "passage") {
        // Fetch correct option from passage questions
        const passageRes = await client.query(
          `SELECT correct_option
             FROM english_passage_questions
            WHERE id=$1`,
          [question_id]
        );

        correctOpt = passageRes.rows[0]?.correct_option;
      } else {
        // Objective questions
        const objRes = await client.query(
          `SELECT correct_option
             FROM english_objective_questions
            WHERE id=$1`,
          [question_id]
        );

        correctOpt = objRes.rows[0]?.correct_option;
      }

      // 5️⃣ Compare student choice to correct answer
      if (!studentChoice) {
        unanswered++;
      } else if (studentChoice.toUpperCase() === correctOpt.toUpperCase()) {
        correct++;
      } else {
        wrong++;
      }
    }

    const total = questionRows.length;
    const score = Math.round((correct / total) * 100);

    // 6️⃣ Calculate remaining_minutes
    const remaining_minutes =
      typeof remaining_seconds === "number"
        ? Math.max(0, Math.ceil(remaining_seconds / 60))
        : 0;

    // 7️⃣ Update exam session to submitted
    await client.query(
      `UPDATE english_exam_sessions
          SET status='submitted',
              submitted_at=NOW(),
              score=$1,
              remaining_minutes=$2
        WHERE id=$3`,
      [score, remaining_minutes, examId]
    );

    await client.query("COMMIT");

    return res.json({
      message: "English exam submitted.",
      total_questions: total,
      correct,
      wrong,
      unanswered,
      score,
    });
  } catch (error) {
    await client.query("ROLLROLLBACK");
    console.error("🔥 ENGLISH SUBMIT ERROR:", error);
    return res.status(500).json({ message: "Error submitting English exam." });
  } finally {
    client.release();
  }
});

module.exports = router;
