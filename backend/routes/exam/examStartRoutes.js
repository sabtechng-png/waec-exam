// ======================================================
// examStartRoutes.js — FINAL (hard-delete mode, no total_questions)
// ======================================================

const express = require("express");
const router = express.Router();

const { pool } = require("../../db");
const auth = require("../../middleware/authMiddleware");

// ------------------------------------------------------
// POST /exam/start  → Start OR Resume Exam
// ------------------------------------------------------
router.post("/start", auth, async (req, res) => {
  const studentId = req.user.userId;
  const { subject_id } = req.body;

  if (!subject_id) {
    return res.status(400).json({ message: "subject_id is required" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1️⃣ CHECK registration (hard delete → only one active row)
    const reg = await client.query(
      `
      SELECT id, status 
      FROM student_subjects
      WHERE student_id=$1 AND subject_id=$2
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [studentId, subject_id]
    );

    if (reg.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Please register this subject first." });
    }

    const registration = reg.rows[0];

    // 2️⃣ BLOCK if completed
    if (registration.status === "completed") {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Exam already completed. Re-register to retake.",
      });
    }

    // 3️⃣ IF IN PROGRESS → RESUME
    if (registration.status === "in_progress") {
      const active = await client.query(
        `
        SELECT id, remaining_minutes
        FROM exam_sessions
        WHERE student_id=$1 AND subject_id=$2 AND status='in_progress'
        ORDER BY created_at DESC
        LIMIT 1
        `,
        [studentId, subject_id]
      );

      if (active.rowCount > 0) {
        await client.query("COMMIT");
        return res.json({
          exam: {
            id: active.rows[0].id,
            remaining_minutes: active.rows[0].remaining_minutes,
          },
          resumed: true,
        });
      }
    }

    // ------------------------------------------------------
    // 4️⃣ CREATE NEW exam session (NO total_questions)
    // ------------------------------------------------------
    const newExam = await client.query(
      `
      INSERT INTO exam_sessions
      (student_id, subject_id, status, remaining_minutes)
      VALUES ($1, $2, 'in_progress', 15)
      RETURNING id
      `,
      [studentId, subject_id]
    );

    const examId = newExam.rows[0].id;

    // Update subject state
    await client.query(
      `
      UPDATE student_subjects
      SET status='in_progress'
      WHERE id=$1
      `,
      [registration.id]
    );

    // ------------------------------------------------------
    // 5️⃣ PICK 20 RANDOM QUESTIONS
    // ------------------------------------------------------
    const questions = await client.query(
      `
      SELECT id
      FROM questions
      WHERE subject_id=$1
      ORDER BY RANDOM()
      LIMIT 20
      `,
      [subject_id]
    );

    // ------------------------------------------------------
    // 6️⃣ SAVE question order
    // ------------------------------------------------------
    for (let i = 0; i < questions.rows.length; i++) {
      await client.query(
        `
          INSERT INTO exam_question_order (exam_id, question_id, seq)
          VALUES ($1, $2, $3)
        `,
        [examId, questions.rows[i].id, i + 1]
      );
    }

    await client.query("COMMIT");

    return res.json({
      exam: { id: examId, remaining_minutes: 15 },
      resumed: false,
      message: "Exam started successfully",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Exam Start Error:", err);
    res.status(500).json({ message: "Error starting exam" });
  } finally {
    client.release();
  }
});

module.exports = router;
