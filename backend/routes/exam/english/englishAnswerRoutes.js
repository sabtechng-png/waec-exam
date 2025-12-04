const express = require("express");
const router = express.Router();
const { pool } = require("../../../db");
const auth = require("../../../middleware/authMiddleware");

// ===================================================
// SAVE / UPDATE ENGLISH ANSWER (idempotent, CBT-style)
// PATCH /english-exam/:examId/answer
// body: { question_id, selected_option?, flagged?, remaining_seconds? }
// ===================================================
router.patch("/:examId/answer", auth, async (req, res) => {
  const studentId = req.user.userId;   // UUID
  const { examId } = req.params;
  const { question_id, selected_option, flagged, remaining_seconds } = req.body || {};

  if (!question_id) {
    return res.status(400).json({ message: "question_id is required" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1️⃣ Ensure exam exists and belongs to this student + still in_progress
    const valid = await client.query(
      `SELECT id, status 
         FROM english_exam_sessions
        WHERE id=$1 AND student_id=$2`,
      [examId, studentId]
    );

    if (!valid.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "English exam not found." });
    }

    if (valid.rows[0].status !== "in_progress") {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Cannot save answer. Exam already submitted.",
      });
    }

    // 2️⃣ Optional: update remaining_minutes from remaining_seconds
    if (typeof remaining_seconds === "number") {
      const remaining_minutes = Math.max(0, Math.ceil(remaining_seconds / 60));
      await client.query(
        `UPDATE english_exam_sessions
            SET remaining_minutes = $1
          WHERE id=$2`,
        [remaining_minutes, examId]
      );
    }

    // 3️⃣ Determine question_type from english_exam_question_order
    const orderRes = await client.query(
      `SELECT question_type
         FROM english_exam_question_order
        WHERE exam_id=$1 AND question_id=$2`,
      [examId, question_id]
    );

    if (!orderRes.rowCount) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ message: "Question does not belong to this English exam." });
    }

    const question_type = orderRes.rows[0].question_type; // 'passage' | 'objective'
    const normalizedFlag = !!flagged;

    // 4️⃣ Clearing logic: if no selected_option AND not flagged → delete row
    const trimmedOpt =
      selected_option === null ||
      selected_option === undefined ||
      `${selected_option}`.trim() === ""
        ? ""
        : `${selected_option}`.trim().toUpperCase();

    if (!trimmedOpt && !normalizedFlag) {
      await client.query(
        `DELETE FROM english_exam_answers
          WHERE exam_id=$1 AND student_id=$2 AND question_id=$3`,
        [examId, studentId, question_id]
      );

      await client.query("COMMIT");
      return res.json({
        message: "Answer cleared.",
        question_id,
        selected_option: null,
        flagged: false,
      });
    }

    // 5️⃣ Upsert answer (one row per exam + question)
    await client.query(
      `INSERT INTO english_exam_answers
         (exam_id, question_type, question_id, student_id, selected_option, flagged, saved_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (exam_id, question_id)
       DO UPDATE SET
          selected_option = $5,
          flagged         = $6,
          saved_at        = NOW()`,
      [
        examId,
        question_type,
        question_id,
        studentId,
        trimmedOpt || null,
        normalizedFlag,
      ]
    );

    await client.query("COMMIT");
    return res.json({
      message: "Answer saved.",
      question_id,
      question_type,
      selected_option: trimmedOpt || null,
      flagged: normalizedFlag,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("🔥 ENGLISH SAVE ANSWER ERROR:", err);
    return res.status(500).json({ message: "Error saving English answer." });
  } finally {
    client.release();
  }
});

// =============================================================
// LOAD SAVED ENGLISH ANSWER FOR A QUESTION
// GET /english-exam/:examId/answer/:questionId
// =============================================================
router.get("/:examId/answer/:questionId", auth, async (req, res) => {
  const studentId = req.user.userId; // UUID
  const { examId, questionId } = req.params;

  try {
    // (Optional) Verify exam belongs to student
    const exam = await pool.query(
      `SELECT 1 FROM english_exam_sessions
        WHERE id=$1 AND student_id=$2`,
      [examId, studentId]
    );

    if (!exam.rowCount) {
      return res.status(404).json({ message: "Exam not found." });
    }

    const ans = await pool.query(
      `SELECT selected_option, flagged
         FROM english_exam_answers
        WHERE exam_id=$1 AND student_id=$2 AND question_id=$3
        LIMIT 1`,
      [examId, studentId, questionId]
    );

    if (!ans.rowCount) {
      return res.json({
        selected_option: null,
        flagged: false,
      });
    }

    return res.json(ans.rows[0]);
  } catch (err) {
    console.error("🔥 ENGLISH LOAD ANSWER ERROR:", err);
    return res.status(500).json({ message: "Failed to load English answer." });
  }
});

module.exports = router;
