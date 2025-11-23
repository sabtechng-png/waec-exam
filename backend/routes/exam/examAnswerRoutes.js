const express = require("express");
const router = express.Router();
const { pool } = require("../../db");
const auth = require("../../middleware/authMiddleware");

// ===================================================
// SAVE / UPDATE ANSWER  (CBT-style, idempotent)
// PATCH /exam/:examId/answer
// ===================================================
router.patch("/:examId/answer", auth, async (req, res) => {
  const studentId = req.user.userId;
  const { examId } = req.params;
  const { question_id, selected_option, flagged, remaining_seconds } = req.body;

  if (!question_id) {
    return res.status(400).json({ message: "question_id is required" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1️⃣ Ensure exam exists and is still active
    const valid = await client.query(
      `SELECT id, status 
         FROM exam_sessions
        WHERE id=$1 AND student_id=$2`,
      [examId, studentId]
    );

    if (!valid.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Exam not found." });
    }

  if (valid.rows[0].status !== "in_progress") {
  await client.query("ROLLBACK");
  return res
    .status(400)
    .json({ message: "Cannot save answer. Exam already submitted." });
}


    // 2️⃣ Optionally update remaining_minutes in exam_sessions
    if (typeof remaining_seconds === "number") {
      const remaining_minutes = Math.max(
        0,
        Math.ceil(remaining_seconds / 60)
      );
      await client.query(
        `UPDATE exam_sessions
            SET remaining_minutes = $1
          WHERE id=$2`,
        [remaining_minutes, examId]
      );
    }

    const normalizedFlag = !!flagged;

    // 3️⃣ If no option and not flagged → clear any saved answer
    if (
      (selected_option === null ||
        selected_option === undefined ||
        `${selected_option}`.trim() === "") &&
      !normalizedFlag
    ) {
      await client.query(
        `DELETE FROM exam_answers
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

    // 4️⃣ Upsert answer (one row per exam+question)
    await client.query(
      `INSERT INTO exam_answers 
         (exam_id, student_id, question_id, selected_option, flagged, saved_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (exam_id, question_id)
       DO UPDATE SET 
          selected_option = $4,
          flagged         = $5,
          saved_at        = NOW()`,
      [
        examId,
        studentId,
        question_id,
        selected_option || null,
        normalizedFlag,
      ]
    );

    await client.query("COMMIT");
    return res.json({
      message: "Answer saved.",
      question_id,
      selected_option: selected_option || null,
      flagged: normalizedFlag,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("🔥 SAVE ANSWER ERROR:", err);
    return res.status(500).json({ message: "Error saving answer." });
  } finally {
    client.release();
  }
});

module.exports = router;
