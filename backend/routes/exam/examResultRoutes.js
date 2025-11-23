const express = require("express");
const router = express.Router();
const { pool } = require("../../db");
const auth = require("../../middleware/authMiddleware");
const PDFDocument = require("pdfkit");

// ============================================
// 1) ALL RESULTS for logged-in student
//    GET /exam/results/all
// ============================================
router.get("/results/all", auth, async (req, res) => {
  const studentId = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT es.id AS exam_id,
              es.subject_id,
              s.name AS subject_name,
              es.score,
              es.status,
              es.submitted_at
         FROM exam_sessions es
         JOIN subjects s ON s.id = es.subject_id
        WHERE es.student_id = $1
          AND es.status   = 'submitted'
        ORDER BY es.submitted_at DESC`,
      [studentId]
    );

    return res.json({ results: result.rows });
  } catch (err) {
    console.error("🔥 ERROR fetching results:", err);
    return res.status(500).json({ message: "Failed to fetch results." });
  }
});

// ============================================
// 2) SINGLE EXAM DETAIL (WITH 24-HOUR DELETION)
//    GET /exam/result/:examId
// ============================================
router.get("/result/:examId", auth, async (req, res) => {
  const { examId } = req.params;
  const studentId = req.user.userId;

  try {
    // ----- Fetch exam session -----
    const exam = await pool.query(
      `SELECT es.*, s.name AS subject_name
         FROM exam_sessions es
         JOIN subjects s ON s.id = es.subject_id
        WHERE es.id=$1 AND es.student_id=$2 AND es.status='submitted'`,
      [examId, studentId]
    );

    if (!exam.rowCount) {
      return res.status(404).json({ message: "Exam not found." });
    }

    const examData = exam.rows[0];

    // ----- 24-Hour Expiration -----
    const submittedAt = new Date(examData.submitted_at);
    const now = new Date();
    const hoursPassed = (now - submittedAt) / 36e5;
    const viewAllowed = hoursPassed <= 24;

    if (!viewAllowed) {
      // DELETE student's answers
      await pool.query(
        `DELETE FROM exam_answers WHERE exam_id=$1 AND student_id=$2`,
        [examId, studentId]
      );

      // DELETE question sequence
      await pool.query(
        `DELETE FROM exam_question_order WHERE exam_id=$1`,
        [examId]
      );

      return res.json({
        exam_id: examId,
        subject_id: examData.subject_id,
        subject_name: examData.subject_name,
        score: examData.score,
        view_expired: true,
        message:
          "Your answer details have been deleted after 24 hours. Only score is available.",
      });
    }

    // ----- Retrieve detailed answers (within 24h only) -----
    const rows = await pool.query(
      `SELECT 
          eq.seq,
          q.id AS question_id,
          q.question,
          q.option_a,
          q.option_b,
          q.option_c,
          q.option_d,
          q.correct_option,
          ea.selected_option,
          ea.flagged
       FROM exam_question_order eq
       JOIN questions q ON q.id = eq.question_id
  LEFT JOIN exam_answers ea
         ON ea.exam_id = eq.exam_id
        AND ea.student_id = $2
        AND ea.question_id = eq.question_id
      WHERE eq.exam_id = $1
      ORDER BY eq.seq ASC`,
      [examId, studentId]
    );

    let correct = 0,
      wrong = 0,
      unanswered = 0;

    const answers = rows.rows.map((r) => {
      let result = "unanswered";

      if (!r.selected_option) {
        unanswered++;
      } else if (
        r.selected_option.toUpperCase() ===
        (r.correct_option || "").toUpperCase()
      ) {
        result = "correct";
        correct++;
      } else {
        result = "wrong";
        wrong++;
      }

      return {
        question_id: r.question_id,
        question: r.question,
        option_a: r.option_a,
        option_b: r.option_b,
        option_c: r.option_c,
        option_d: r.option_d,
        correct_option: r.correct_option,
        selected_option: r.selected_option,
        flagged: r.flagged,
        result,
      };
    });

    const totalQuestions = answers.length;
    const percentage =
      totalQuestions > 0
        ? Math.round((correct / totalQuestions) * 100)
        : 0;

    return res.json({
      exam_id: examId,
      subject_id: examData.subject_id,
      subject_name: examData.subject_name,
      score: percentage,
      correct,
      wrong,
      unanswered,
      percentage,
      answers,
    });
  } catch (err) {
    console.error("🔥 ERROR loading result details:", err);
    return res.status(500).json({ message: "Failed to load result details." });
  }
});

// ===========================================================
// 3) GENERATE PDF RESULT SHEET (WITH 24-HOUR EXPIRATION)
//     GET /exam/:examId/pdf
// ===========================================================
router.get("/:examId/pdf", auth, async (req, res) => {
  const { examId } = req.params;
  const studentId = req.user.userId;

  try {
    const exam = await pool.query(
      `SELECT es.*, s.name AS subject_name, u.full_name
         FROM exam_sessions es
         JOIN subjects s ON s.id = es.subject_id
         JOIN users u ON u.id = es.student_id
        WHERE es.id=$1 AND es.student_id=$2 AND es.status='submitted'`,
      [examId, studentId]
    );

    if (!exam.rowCount) {
      return res.status(404).json({ message: "Result not found" });
    }

    const e = exam.rows[0];

    // ----- 24-Hour PDF Expiration -----
    const submittedAt = new Date(e.submitted_at);
    const now = new Date();
    const hoursPassed = (now - submittedAt) / 36e5;
    const viewAllowed = hoursPassed <= 24;

    if (!viewAllowed) {
      // Delete detailed records
      await pool.query(
        `DELETE FROM exam_answers WHERE exam_id=$1 AND student_id=$2`,
        [examId, studentId]
      );
      await pool.query(
        `DELETE FROM exam_question_order WHERE exam_id=$1`,
        [examId]
      );
    }

    // ----- Create PDF -----
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="ExamResult_${examId}.pdf"`
    );
    doc.pipe(res);

    // HEADER
    doc.fontSize(20).text("CBT Examination Result Sheet", { align: "center" });
    doc.moveDown().fontSize(12);
    doc.text(`Student: ${e.full_name}`);
    doc.text(`Subject: ${e.subject_name}`);
    doc.text(`Score: ${e.score}%`);
    doc.text(`Submitted: ${new Date(e.submitted_at).toLocaleString()}`);
    doc.moveDown().moveTo(40, doc.y).lineTo(550, doc.y).stroke();

    // ---- AFTER 24 HOURS → SCORE ONLY PDF ----
    if (!viewAllowed) {
      doc.moveDown(2);
      doc.fontSize(14).fillColor("red").text("Answer Review Expired", {
        align: "center",
      });

      doc.moveDown().fontSize(12).fillColor("black");
      doc.text(
        "Detailed answer information was automatically deleted after 24 hours."
      );
      doc.text("This PDF contains ONLY your score summary.");
      doc.end();
      return;
    }

    // ----- WITHIN 24 HOURS → FULL DETAILED PDF -----
    const rows = await pool.query(
      `SELECT 
          eq.seq,
          q.question,
          q.option_a, q.option_b, q.option_c, q.option_d,
          q.correct_option,
          ea.selected_option
       FROM exam_question_order eq
       JOIN questions q ON q.id = eq.question_id
  LEFT JOIN exam_answers ea
         ON ea.exam_id = eq.exam_id
        AND ea.student_id = $2
        AND ea.question_id = eq.question_id
      WHERE eq.exam_id = $1
      ORDER BY eq.seq ASC`,
      [examId, studentId]
    );

    const answers = rows.rows;

    answers.forEach((q, i) => {
      doc.moveDown(1);
      doc.fontSize(13).text(`${i + 1}. ${q.question}`);

      const correct = q.correct_option?.toUpperCase();
      const selected = q.selected_option?.toUpperCase();

      let status = "Unanswered";
      let color = "gray";

      if (selected) {
        if (selected === correct) {
          status = "Correct";
          color = "green";
        } else {
          status = "Wrong";
          color = "red";
        }
      }

      doc.moveDown(0.3).fontSize(11);

      ["A", "B", "C", "D"].forEach((opt) => {
        const txt = q[`option_${opt.toLowerCase()}`];
        if (!txt) return;

        let mark = "";
        if (opt === selected) mark += " (Your Answer)";
        if (opt === correct) mark += " (Correct)";

        doc.fillColor(
          opt === selected
            ? selected === correct
              ? "green"
              : "red"
            : opt === correct
            ? "green"
            : "black"
        );
        doc.text(`${opt}. ${txt}${mark}`);
      });

      doc.fillColor(color).text(`Status: ${status}`);
      doc.fillColor("black");

      doc.moveDown().moveTo(40, doc.y).lineTo(550, doc.y).stroke();
    });

    doc.end();
  } catch (err) {
    console.error("PDF ERROR:", err);
    return res.status(500).json({ message: "Failed to generate PDF." });
  }
});

module.exports = router;
