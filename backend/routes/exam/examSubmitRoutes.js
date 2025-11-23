const express = require("express");
const router = express.Router();
const { pool } = require("../../db");
const auth = require("../../middleware/authMiddleware");

// =============================================
// SUBMIT EXAM
// POST /exam/:examId/submit
// body: { remaining_seconds? }
// =============================================
router.post("/:examId/submit", auth, async (req, res) => {
  const studentId = req.user.userId;
  const { examId } = req.params;
  const { remaining_seconds } = req.body || {};

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1️⃣ Validate exam & get subject
    const ses = await client.query(
      `SELECT id, subject_id, status
         FROM exam_sessions
        WHERE id=$1 AND student_id=$2
        LIMIT 1`,
      [examId, studentId]
    );

    if (!ses.rowCount) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ message: "Exam not found or not authorized." });
    }

    if (ses.rows[0].status === "submitted") {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Exam already submitted." });
    }

    const subjectId = ses.rows[0].subject_id;

    // 2️⃣ Fetch all exam questions (exact 50 used in this exam)
    //    Requires exam_question_order table populated by /start route
    const qset = await client.query(
      `SELECT eq.question_id,
              q.correct_option
         FROM exam_question_order eq
         JOIN questions q ON q.id = eq.question_id
        WHERE eq.exam_id = $1
        ORDER BY eq.seq ASC`,
      [examId]
    );

    if (!qset.rowCount) {
      // Fallback: if for some reason the table is empty, treat all subject questions as the exam
      const fallback = await client.query(
        `SELECT id AS question_id, correct_option
           FROM questions
          WHERE subject_id=$1
          ORDER BY id ASC
          LIMIT 50`,
        [subjectId]
      );

      if (!fallback.rowCount) {
        await client.query("ROLLBACK");
        return res
          .status(400)
          .json({ message: "No questions available for this exam." });
      }

      qset.rows.push(...fallback.rows);
    }

    const total = qset.rowCount;

    // 3️⃣ Fetch all answers for this exam
    const ans = await client.query(
      `SELECT question_id, selected_option
         FROM exam_answers
        WHERE exam_id=$1 AND student_id=$2`,
      [examId, studentId]
    );

    const answerMap = new Map();
    ans.rows.forEach((r) => {
      answerMap.set(r.question_id, r.selected_option);
    });

    // 4️⃣ Compute marks
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    for (const row of qset.rows) {
      const userOpt = answerMap.get(row.question_id);
      const correctOpt = row.correct_option;

      if (!userOpt) {
        unanswered++;
      } else if (
        userOpt.toUpperCase() === (correctOpt || "").toUpperCase()
      ) {
        correct++;
      } else {
        wrong++;
      }
    }

    const score = Math.round((correct / total) * 100);

    // 5️⃣ Remaining minutes
    const remaining_minutes =
      typeof remaining_seconds === "number"
        ? Math.max(0, Math.ceil(remaining_seconds / 60))
        : 0;

    // 6️⃣ Update exam_sessions
    await client.query(
      `UPDATE exam_sessions
          SET status='submitted',
              submitted_at=NOW(),
              score=$1,
              remaining_minutes=$2
        WHERE id=$3`,
      [score, remaining_minutes, examId]
    );

    // 7️⃣ Mark student_subjects as completed
    await client.query(
      `UPDATE student_subjects
          SET status='completed',
              archived=TRUE,
              finished_at = COALESCE(finished_at, NOW())
        WHERE student_id=$1 AND subject_id=$2 AND archived=FALSE`,
      [studentId, subjectId]
    );

    await client.query("COMMIT");

    return res.json({
      message: "Exam submitted successfully",
      score,
      total,
      correct,
      wrong,
      unanswered,
      remaining_minutes,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("🔥 SUBMIT ERROR:", err);
    return res.status(500).json({ message: "Error submitting exam." });
  } finally {
    client.release();
  }
});

module.exports = router;
