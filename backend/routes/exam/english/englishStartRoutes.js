const express = require("express");
const router = express.Router();
const { pool } = require("../../../db");
const auth = require("../../../middleware/authMiddleware");

// ========================================================
// LOAD ENGLISH EXAM SESSION
// GET /english-exam/:examId/load
// ========================================================
router.get("/:examId/load", auth, async (req, res) => {
  const studentId = req.user.userId;
  const { examId } = req.params;

  try {
    // 1️⃣ Validate exam session
    const examRes = await pool.query(
      `SELECT * FROM english_exam_sessions 
       WHERE id=$1 AND student_id=$2`,
      [examId, studentId]
    );

    if (examRes.rowCount === 0) {
      return res.status(404).json({ message: "English exam not found." });
    }

    const exam = examRes.rows[0];

    // 2️⃣ Load questions (passage + objective)
    const qRes = await pool.query(
      `SELECT 
          eo.question_type,
          eo.question_id,
          eo.seq,

          -- Passage
          p.title AS passage_title,
          p.passage,
          pq.question AS passage_question,
          pq.option_a AS passage_a,
          pq.option_b AS passage_b,
          pq.option_c AS passage_c,
          pq.option_d AS passage_d,

          -- Objective
          oq.question AS objective_question,
          oq.option_a AS objective_a,
          oq.option_b AS objective_b,
          oq.option_c AS objective_c,
          oq.option_d AS objective_d

        FROM english_exam_question_order eo
        LEFT JOIN english_passage_questions pq
              ON pq.id = eo.question_id AND eo.question_type='passage'
        LEFT JOIN english_passages p
              ON p.id = pq.passage_id

        LEFT JOIN english_objective_questions oq
              ON oq.id = eo.question_id AND eo.question_type='objective'

        WHERE eo.exam_id = $1
        ORDER BY eo.seq`,
      [examId]
    );

    // 3️⃣ Group into structured format for frontend
    const sections = [];

    qRes.rows.forEach((row) => {
      let section = sections.find((s) => s.type === row.question_type);

      if (!section) {
        section = {
          type: row.question_type,
          title: row.passage_title || row.question_type.toUpperCase(),
          passage: row.passage || "",
          questions: []
        };
        sections.push(section);
      }

      // Choose the correct source
      const q = {
        id: row.question_id,
        question: row.passage_question || row.objective_question,
        option_a: row.passage_a || row.objective_a,
        option_b: row.passage_b || row.objective_b,
        option_c: row.passage_c || row.objective_c,
        option_d: row.passage_d || row.objective_d
      };

      section.questions.push(q);
    });

    return res.json({ exam, sections });
  } catch (err) {
    console.error("🔥 english load error:", err);
    return res.status(500).json({ message: "Failed to load exam." });
  }
});

module.exports = router;
