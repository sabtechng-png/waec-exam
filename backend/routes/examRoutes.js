// ======================================================
// routes/examRoutes.js — Single-Mode: start, answer, submit, result
// ======================================================
const express = require("express");
const router = express.Router();
const { pool } = require("../db");
const auth = require("../middleware/authMiddleware");

// Small helper
const fail = (res, code, message, extra = {}) => {
  if (process.env.NODE_ENV !== "test") console.log("❌ FAIL:", message, extra);
  return res.status(code).json({ message });
};

// 1) START or RESUME an exam
router.post("/start", auth, async (req, res) => {
  const studentId = req.user.userId;
  const { subject_id } = req.body;
  if (!subject_id) return fail(res, 400, "subject_id required");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Must be registered & not archived
    const reg = await client.query(
      `SELECT id, status
         FROM student_subjects
        WHERE student_id=$1 AND subject_id=$2 AND archived=FALSE
        LIMIT 1`,
      [studentId, subject_id]
    );
    if (!reg.rowCount) {
      await client.query("ROLLBACK");
      return fail(res, 404, "You must register this subject first.");
    }

    // Use existing active session or create fresh
    let ses = await client.query(
      `SELECT id, subject_id, status, started_at, remaining_minutes
         FROM exam_sessions
        WHERE student_id=$1 AND subject_id=$2 AND status='active'
        LIMIT 1`,
      [studentId, subject_id]
    );

    if (!ses.rowCount) {
      ses = await client.query(
        `INSERT INTO exam_sessions (student_id, subject_id, status, started_at, remaining_minutes)
         VALUES ($1, $2, 'active', NOW(), 60)
         RETURNING id, subject_id, status, started_at, remaining_minutes`,
        [studentId, subject_id]
      );

      // push the registration to in_progress
      await client.query(
        `UPDATE student_subjects
           SET status='in_progress', started_at=COALESCE(started_at, NOW())
         WHERE student_id=$1 AND subject_id=$2 AND archived=FALSE`,
        [studentId, subject_id]
      );
    }

    // Question ids (sorted; you can change to RANDOM() LIMIT 50 later)
const qs = await client.query(
  `SELECT id FROM questions
    WHERE subject_id=$1
    ORDER BY RANDOM()
    LIMIT 50`,
  [subject_id]
);
    await client.query("COMMIT");
    const sess = ses.rows[0];
    return res.json({
      message: "Exam started.",
      exam: {
        id: sess.id,
        subject_id,
        remaining_minutes: sess.remaining_minutes ?? 60,
      },
      question_ids: qs.rows.map((r) => r.id),
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ /exam/start error:", err);
    return fail(res, 500, "Error starting exam.");
  } finally {
    client.release();
  }
});

// 2) LOAD a question
router.get("/:examId/question/:questionId", auth, async (req, res) => {
  const studentId = req.user.userId;
  const { examId, questionId } = req.params;

  try {
    const own = await pool.query(
      `SELECT subject_id FROM exam_sessions
        WHERE id=$1 AND student_id=$2 AND status='active'`,
      [examId, studentId]
    );
    if (!own.rowCount) return fail(res, 404, "Exam not active or not found.");

    const q = await pool.query(
      `SELECT id, question, option_a, option_b, option_c, option_d
         FROM questions WHERE id=$1 LIMIT 1`,
      [questionId]
    );
    if (!q.rowCount) return fail(res, 404, "Question not found.");

    return res.json(q.rows[0]);
  } catch (err) {
    console.error("❌ load question error:", err);
    return fail(res, 500, "Error loading question.");
  }
});

// 3) SAVE / FLAG an answer (idempotent via UNIQUE (exam_id, question_id))
router.patch("/:examId/answer", auth, async (req, res) => {
  const studentId = req.user.userId;
  const { examId } = req.params;
  const { question_id, selected_option, flagged } = req.body;
  if (!question_id) return fail(res, 400, "question_id required");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const valid = await client.query(
      `SELECT 1 FROM exam_sessions
        WHERE id=$1 AND student_id=$2 AND status='active'`,
      [examId, studentId]
    );
    if (!valid.rowCount) {
      await client.query("ROLLBACK");
      return fail(res, 404, "Exam not active or not found.");
    }

    await client.query(
      `INSERT INTO exam_answers (exam_id, student_id, question_id, selected_option, flagged, saved_at)
       VALUES ($1, $2, $3, $4, COALESCE($5,false), NOW())
       ON CONFLICT (exam_id, question_id)
       DO UPDATE SET selected_option=$4, flagged=COALESCE($5,false), saved_at=NOW()`,
      [examId, studentId, question_id, selected_option || null, !!flagged]
    );

    await client.query("COMMIT");
    return res.json({ message: "Saved" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ save answer error:", err);
    return fail(res, 500, "Error saving answer.");
  } finally {
    client.release();
  }
});

// 4) // -------------------------------------------------------------
// 🧾 SUBMIT exam → mark subject completed & save score
// -------------------------------------------------------------
router.post("/:examId/submit", auth, async (req, res) => {
  const studentId = req.user.userId;
  const { examId } = req.params;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1️⃣ Verify that the session exists and is active
    const ses = await client.query(
      `SELECT subject_id FROM exam_sessions
         WHERE id=$1 AND student_id=$2 AND status='active' LIMIT 1`,
      [examId, studentId]
    );
    if (!ses.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Exam not found or already submitted." });
    }
    const subjectId = ses.rows[0].subject_id;

    // 2️⃣ Count correct answers vs total questions
    const correctRes = await client.query(
      `SELECT COUNT(*)::int AS correct
         FROM exam_answers a
         JOIN questions q ON a.question_id = q.id
        WHERE a.exam_id=$1 AND a.selected_option = q.correct_option`,
      [examId]
    );
    const totalRes = await client.query(
      `SELECT COUNT(*)::int AS total FROM exam_answers WHERE exam_id=$1`,
      [examId]
    );

    const correct = correctRes.rows[0].correct;
    const total = totalRes.rows[0].total;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;

    // 3️⃣ Update session: mark submitted + save score
   await client.query(
  `UPDATE exam_sessions
      SET status='submitted',
          submitted_at=NOW(),
          score=$1
    WHERE id=$2`,
  [score, examId]
);

    // 4️⃣ Mark subject completed so it can be re-registered
    await client.query(
      `UPDATE student_subjects
          SET status='completed',
              archived=TRUE
              
        WHERE student_id=$1 AND subject_id=$2 AND archived=FALSE`,
      [studentId, subjectId]
    );

    await client.query("COMMIT");
    console.log(`✅ Exam ${examId} submitted with score ${score}%`);

    res.json({ message: "Exam submitted successfully", score });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("submit exam error:", err);
    res.status(500).json({ message: "Error submitting exam." });
  } finally {
    client.release();
  }
});


// 5) RESULT summary for a submitted exam (latest)
router.get("/result/:examId", auth, async (req, res) => {
  const studentId = req.user.userId;
  const { examId } = req.params;

  try {
    // Find the submitted exam by ID
    const exam = await pool.query(
      `
      SELECT es.id, es.score, es.subject_id, es.submitted_at, s.name AS subject_name
      FROM exam_sessions es
      JOIN subjects s ON s.id = es.subject_id
      WHERE es.student_id = $1
        AND es.id = $2
        AND es.status = 'submitted'
      LIMIT 1;
      `,
      [studentId, examId]
    );

    if (exam.rowCount === 0) {
      console.log("FAIL: No submitted exam found.", { studentId, examId });
      return res.status(404).json({ message: "No submitted exam found." });
    }

    const { id, subject_id, subject_name, score, submitted_at } = exam.rows[0];

    // Get answers for this exam
    const answers = await pool.query(
      `
      SELECT 
        q.id AS question_id,
        q.question,
        q.option_a, q.option_b, q.option_c, q.option_d,
        q.correct_option,
        ea.selected_option,
        CASE
          WHEN ea.selected_option IS NULL THEN 'unanswered'
          WHEN ea.selected_option = q.correct_option THEN 'correct'
          ELSE 'wrong'
        END AS result
      FROM exam_answers ea
      JOIN questions q ON q.id = ea.question_id
      WHERE ea.exam_id = $1
      ORDER BY q.id;
      `,
      [examId]
    );

    const total = answers.rowCount;
    const correct = answers.rows.filter((r) => r.result === "correct").length;
    const wrong = answers.rows.filter((r) => r.result === "wrong").length;
    const unanswered = answers.rows.filter((r) => r.result === "unanswered").length;

    res.json({
      exam_id: id,
      subject_id,
      subject_name,
      score,
      total_questions: total,
      correct,
      wrong,
      unanswered,
      percentage: total ? Math.round((correct * 100) / total) : 0,
      submitted_at,
      answers: answers.rows,
    });
  } catch (err) {
    console.error("❌ Error in /exam/result/:examId:", err);
    res.status(500).json({ message: "Error fetching result details." });
  }
});


///////////////////////////////FOR PDF??????//////////////////////
const PDFDocument = require("pdfkit");


router.get("/:examId/pdf", auth, async (req, res) => {
  const studentId = req.user.userId;
  const { examId } = req.params;

  try {
    // 1️⃣ Get exam + student + subject info
    const exam = await pool.query(
      `
      SELECT es.id, es.score, es.subject_id, es.submitted_at,
             s.name AS subject_name, u.full_name AS student_name, u.email
      FROM exam_sessions es
      JOIN subjects s ON s.id = es.subject_id
      JOIN users u ON u.id = es.student_id
      WHERE es.student_id = $1
        AND es.id = $2
        AND es.status = 'submitted'
      LIMIT 1;
      `,
      [studentId, examId]
    );

    if (exam.rowCount === 0)
      return res.status(404).json({ message: "Exam not found or not submitted." });

    const { subject_name, score, student_name, email, submitted_at } = exam.rows[0];

    // 2️⃣ Fetch all question/answer details
    const answers = await pool.query(
      `
      SELECT q.id AS question_id, q.question, q.option_a, q.option_b, q.option_c, q.option_d,
             q.correct_option, ea.selected_option,
             CASE
               WHEN ea.selected_option IS NULL THEN 'unanswered'
               WHEN ea.selected_option = q.correct_option THEN 'correct'
               ELSE 'wrong'
             END AS result
      FROM exam_answers ea
      JOIN questions q ON q.id = ea.question_id
      WHERE ea.exam_id = $1
      ORDER BY q.id;
      `,
      [examId]
    );

    // 3️⃣ Create the PDF
    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=ExamResult_${subject_name}_${Date.now()}.pdf`
    );
    doc.pipe(res);

    // 🧾 Title Section
    doc.fontSize(20).text("Exam Master — Result Report", {
      align: "center",
      underline: true,
    });
    doc.moveDown();

    doc.fontSize(12)
      .text(`Student Name: ${student_name}`)
      .text(`Email: ${email}`)
      .text(`Subject: ${subject_name}`)
      .text(`Submitted: ${new Date(submitted_at).toLocaleString()}`)
      .text(`Score: ${score}%`)
      .moveDown(1);

    // Summary
    const total = answers.rowCount;
    const correct = answers.rows.filter((a) => a.result === "correct").length;
    const wrong = answers.rows.filter((a) => a.result === "wrong").length;
    const unanswered = answers.rows.filter((a) => a.result === "unanswered").length;

    doc.fontSize(13).text("Performance Summary:", { underline: true }).moveDown(0.5);
    doc
      .fontSize(11)
      .text(`Total Questions: ${total}`)
      .text(`Correct: ${correct}`)
      .text(`Wrong: ${wrong}`)
      .text(`Unanswered: ${unanswered}`)
      .moveDown(1);

    // 🧠 Question-by-Question Review
    doc.fontSize(14).text("Detailed Review (for study):", { underline: true }).moveDown(0.5);

    answers.rows.forEach((a, i) => {
      const color =
        a.result === "correct"
          ? "#2e7d32"
          : a.result === "wrong"
          ? "#c62828"
          : "#6c757d";

      doc.fillColor("#000000").fontSize(11);
      doc.text(`${i + 1}. ${a.question}`, { continued: false });
      doc.moveDown(0.2);

      // Show all options (mark correct & selected)
      ["A", "B", "C", "D"].forEach((opt) => {
        const optText = a[`option_${opt.toLowerCase()}`];
        let prefix = `(${opt}) ${optText}`;
        if (opt === a.correct_option) prefix += "  ✅ (Correct)";
        if (opt === a.selected_option && opt !== a.correct_option) prefix += "   (Chosen)";
        if (opt === a.selected_option && opt === a.correct_option) prefix += "   (Your Choice & Correct)";

        doc.fillColor(opt === a.correct_option ? "#1b5e20" : opt === a.selected_option ? "#d32f2f" : "#000000");
        doc.text(prefix, { indent: 20 });
      });

      // Result summary for that question
      doc.fillColor(color);
      doc.text(`Result: ${a.result.toUpperCase()}`, { indent: 20 });
      doc.moveDown(0.8);
      doc.fillColor("#000000");
    });

    doc.end();
  } catch (err) {
    console.error("❌ PDF generation error:", err);
    res.status(500).json({ message: "Error generating PDF." });
  }
});


////////////////////RESULT ROUTES?/////////////////////////
// -------------------------------------------------------------
// 🟢 GET all completed exam results for a student
// -------------------------------------------------------------
router.get("/results/all", auth, async (req, res) => {
  const studentId = req.user.userId;
  try {
    const result = await pool.query(
      `SELECT 
          es.id AS exam_id,
          es.subject_id,
          s.name AS subject_name,
          s.code AS subject_code,
          COALESCE(es.score, 0) AS score,
          es.status,
          es.started_at,
          es.submitted_at
       FROM exam_sessions es
       JOIN subjects s ON es.subject_id = s.id
       WHERE es.student_id = $1
         AND es.status = 'submitted'
       ORDER BY es.submitted_at DESC`,
      [studentId]
    );
    res.json({ results: result.rows });
  } catch (error) {
    console.error("❌ Error fetching results:", error);
    res.status(500).json({ message: "Failed to fetch results." });
  }
});




module.exports = router;
