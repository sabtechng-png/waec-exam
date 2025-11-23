// routes/exam/examStartRoutes.js
const express = require("express");
const router = express.Router();
const { pool } = require("../../db");
const auth = require("../../middleware/authMiddleware");

// ================================
//   START or RESUME EXAM
// ================================
router.post("/start", auth, async (req, res) => {
  const studentId = req.user.userId;
  const { subject_id } = req.body;

  if (!subject_id) {
    return res.status(400).json({ message: "subject_id is required" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Ensure student is registered
    const reg = await client.query(
      `SELECT id, status
         FROM student_subjects
        WHERE student_id=$1 AND subject_id=$2 AND archived=FALSE
        LIMIT 1`,
      [studentId, subject_id]
    );
    if (!reg.rowCount) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ message: "You must register this subject first." });
    }

    // Check existing session
    let existing = await client.query(
      `SELECT id, subject_id, status, started_at, remaining_minutes
         FROM exam_sessions
        WHERE student_id=$1 AND subject_id=$2
        ORDER BY id DESC
        LIMIT 1`,
      [studentId, subject_id]
    );

    let examSession;
    let isNew = false;

    if (!existing.rowCount || existing.rows[0].status === "submitted") {
      // 🆕 CREATE NEW EXAM
      const created = await client.query(
        `INSERT INTO exam_sessions
           (student_id, subject_id, status, started_at, remaining_minutes)
         VALUES ($1,$2,'in_progress',NOW(),60)
         RETURNING id, subject_id, status, started_at, remaining_minutes`,
        [studentId, subject_id]
      );
      examSession = created.rows[0];
      isNew = true;

      // 🔄 Update registration → IN PROGRESS
      await client.query(
        `UPDATE student_subjects
           SET status='in_progress', started_at=COALESCE(started_at, NOW())
         WHERE student_id=$1 AND subject_id=$2 AND archived=FALSE`,
        [studentId, subject_id]
      );
    } else {
      // ♻️ RESUME EXAM
      examSession = existing.rows[0];

      // 🔒 Ensure session is marked as in_progress (for old "active" rows)
      if (examSession.status !== "in_progress") {
        await client.query(
          `UPDATE exam_sessions
             SET status='in_progress'
           WHERE id=$1`,
          [examSession.id]
        );
        examSession.status = "in_progress";
      }

      // 🔄 ALSO ensure registration is in_progress on RESUME
      await client.query(
        `UPDATE student_subjects
           SET status='in_progress', started_at=COALESCE(started_at, NOW())
         WHERE student_id=$1 AND subject_id=$2 AND archived=FALSE`,
        [studentId, subject_id]
      );

      // ==========================================================
      // 🔥 RESUME PENALTY ONLY: -2 minutes (but not below 0)
      // ==========================================================
      const oldSec = (examSession.remaining_minutes ?? 60) * 60;
      const newSec = Math.max(0, oldSec - 120);
      const newMin = Math.ceil(newSec / 60);

      await client.query(
        `UPDATE exam_sessions SET remaining_minutes=$1 WHERE id=$2`,
        [newMin, examSession.id]
      );

      examSession.remaining_minutes = newMin; // update local copy
      // ==========================================================
    }

    const examId = examSession.id;

    // Create question order table if needed
    await client.query(
      `CREATE TABLE IF NOT EXISTS exam_question_order (
          exam_id INT REFERENCES exam_sessions(id) ON DELETE CASCADE,
          question_id INT REFERENCES questions(id) ON DELETE CASCADE,
          seq INT,
          PRIMARY KEY (exam_id, question_id)
        )`
    );

    // Try to load existing question order (resume)
    let qs = await client.query(
      `SELECT question_id AS id
         FROM exam_question_order
        WHERE exam_id=$1
        ORDER BY seq ASC`,
      [examId]
    );

    // If no order, generate new one
    if (!qs.rowCount) {
      const picked = await client.query(
        `SELECT id
           FROM questions
          WHERE subject_id=$1
          ORDER BY RANDOM()
          LIMIT 50`,
        [subject_id]
      );

      if (!picked.rowCount) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: "No questions found." });
      }

      for (let i = 0; i < picked.rows.length; i++) {
        await client.query(
          `INSERT INTO exam_question_order (exam_id, question_id, seq)
             VALUES ($1,$2,$3)`,
          [examId, picked.rows[i].id, i + 1]
        );
      }

      // 🔥 Always return a pg-style rows object
      qs = { rows: picked.rows };
    }

    // Load saved answers + flags
    const ansRes = await client.query(
      `SELECT question_id, selected_option, flagged
         FROM exam_answers
        WHERE exam_id=$1 AND student_id=$2`,
      [examId, studentId]
    );

    const savedAnswers = {};
    const savedFlags = {};
    ansRes.rows.forEach((r) => {
      if (r.selected_option) savedAnswers[r.question_id] = r.selected_option;
      if (r.flagged) savedFlags[r.question_id] = true;
    });

    // Load subject name
    const subj = await client.query(
      `SELECT name FROM subjects WHERE id=$1 LIMIT 1`,
      [subject_id]
    );

    await client.query("COMMIT");

    const remainingMinutes = examSession.remaining_minutes ?? 60;

    return res.json({
      message: isNew ? "Exam started." : "Exam resumed.",
      resumed: !isNew,
      penalized: !isNew, // FRONTEND WILL ALERT ONLY IF RESUMED
      exam: {
        id: examId,
        subject_id,
        subject_name: subj.rows[0]?.name,
        remaining_minutes: remainingMinutes,
        remaining_seconds: remainingMinutes * 60,
      },
      question_ids: qs.rows.map((r) => r.id),
      answers: savedAnswers,
      flags: savedFlags,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ /exam/start error:", err);
    return res.status(500).json({ message: "Error starting exam." });
  } finally {
    client.release();
  }
});

// ================================
// GET QUESTION DETAILS
// ================================
router.get("/:examId/question/:questionId", auth, async (req, res) => {
  const { examId, questionId } = req.params;
  const studentId = req.user.userId;

  try {
    const own = await pool.query(
      `SELECT 1 FROM exam_sessions
        WHERE id=$1 AND student_id=$2`,
      [examId, studentId]
    );

    if (!own.rowCount) {
      return res.status(404).json({ message: "Exam not found." });
    }

    const q = await pool.query(
      `SELECT id, question, option_a, option_b, option_c, option_d
         FROM questions WHERE id=$1 LIMIT 1`,
      [questionId]
    );

    if (!q.rowCount) {
      return res.status(404).json({ message: "Question not found." });
    }

    return res.json(q.rows[0]);
  } catch (err) {
    console.error("❌ load question error:", err);
    return res.status(500).json({ message: "Error loading question." });
  }
});

module.exports = router;
