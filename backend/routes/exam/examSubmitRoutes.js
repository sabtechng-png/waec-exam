const express = require("express");
const router = express.Router();
const { pool } = require("../../db");
const auth = require("../../middleware/authMiddleware");

// ===============================================================
// SUBMIT EXAM + COMPUTE SCORE  (CORRECT exam_id USAGE)
// ===============================================================
router.post("/:exam_id/submit", auth, async (req, res) => {
  const { exam_id } = req.params;
  const student_id = req.user.id;

  try {
    // 1. Validate exam session belongs to student
    const sessionRes = await pool.query(
      `SELECT * FROM exam_sessions
       WHERE id = $1 AND student_id = $2 AND status = 'in_progress'`,
      [exam_id, student_id]
    );

    if (sessionRes.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or already submitted exam session." });
    }

    const subject_id = sessionRes.rows[0].subject_id;

    // 2. Get the list of questions for this exam
    const qRes = await pool.query(
      `SELECT q.id AS question_id, q.correct_option
       FROM exam_question_order o
       JOIN questions q ON q.id = o.question_id
       WHERE o.exam_id = $1
       ORDER BY o.seq`,
      [exam_id]
    );

    // 3. Load all answers saved by the student for this exam
    const aRes = await pool.query(
      `SELECT question_id, selected_option
       FROM exam_answers
       WHERE exam_id = $1 AND student_id = $2`,
      [exam_id, student_id]
    );

    // Map answers: { question_id: selected_option }
    const answerMap = {};
    aRes.rows.forEach(a => {
      answerMap[a.question_id] = a.selected_option;
    });

    // 4. Compute score
    let correct = 0;
    let wrong = 0;

    qRes.rows.forEach(q => {
      const studentAnswer = answerMap[q.question_id];

      if (!studentAnswer) {
        wrong++;
      } else if (studentAnswer === q.correct_option) {
        correct++;
      } else {
        wrong++;
      }
    });

    const total = qRes.rows.length;
    const score = Math.round((correct / total) * 100);

    // 5. Update exam session status & score
    await pool.query(
      `UPDATE exam_sessions
       SET status = 'submitted',
           score = $1,
           submitted_at = NOW()
       WHERE id = $2`,
      [score, exam_id]
    );

    // 6. Clear subject registration (clean DB)
    await pool.query(
      `DELETE FROM student_subjects
       WHERE student_id = $1 AND subject_id = $2`,
      [student_id, subject_id]
    );

    return res.json({
      message: "Exam submitted successfully.",
      score,
      correct,
      wrong,
      total
    });

  } catch (err) {
    console.error("Submit exam error:", err);
    return res.status(500).json({ error: "Failed to submit exam." });
  }
});

module.exports = router;
