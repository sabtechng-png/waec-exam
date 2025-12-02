// routes/publicExamRoutes.js
const express = require("express");
const router = express.Router();
const { pool } = require("../db"); // adjust path if needed

/*
=========================================================
 PUBLIC CBT DEMO EXAM ROUTES
 No login required, no exam_sessions, no saving.
=========================================================
*/

/*
---------------------------------------------------------
 1) GET 10 RANDOM QUESTIONS FOR PUBLIC DEMO
    PRESET: subject_id = 2  (as user requested)
---------------------------------------------------------
*/
router.get("/questions", async (req, res) => {
	  console.log("🔥 Public exam route hit");

  try {
    const result = await pool.query(
      `
      SELECT 
        id,
        question,
        option_a,
        option_b,
        option_c,
        option_d
      FROM questions
      WHERE subject_id = 2
      ORDER BY RANDOM()
      LIMIT 10
      `
    );

    if (!result.rowCount) {
      return res.status(404).json({
        message: "No public questions found for subject_id = 2",
      });
    }

    return res.json({
      message: "Public demo questions loaded",
      questions: result.rows,
    });
  } catch (err) {
    console.error("🔥 Public Questions Error:", err);
    return res.status(500).json({
      message: "Failed to load public exam questions",
    });
  }
});

/*
---------------------------------------------------------
 2) SUBMIT PUBLIC DEMO AND SCORE
---------------------------------------------------------
*/
router.post("/submit", async (req, res) => {
  const { answers } = req.body;

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({
      message: "answers[] is required",
    });
  }

  try {
    const qIds = answers.map((a) => a.question_id);

    if (qIds.length === 0) {
      return res.status(400).json({
        message: "No answers submitted",
      });
    }

    const qRes = await pool.query(
      `
      SELECT id, correct_option
      FROM questions
      WHERE id = ANY($1)
      `,
      [qIds]
    );

    const correctMap = new Map();
    qRes.rows.forEach((q) =>
      correctMap.set(q.id, q.correct_option?.toUpperCase())
    );

    let correct = 0;
    let wrong = 0;

    answers.forEach((item) => {
      const correctOpt = correctMap.get(item.question_id);
      const userOpt = item.selected_option?.toUpperCase();

      if (!userOpt) return;

      if (userOpt === correctOpt) correct++;
      else wrong++;
    });

    const total = answers.length;
    const score = Math.round((correct / total) * 100);

    return res.json({
      message: "Public exam scored",
      total,
      correct,
      wrong,
      score,
    });
  } catch (err) {
    console.error("🔥 Public Submit Error:", err);
    return res.status(500).json({
      message: "Failed to score public exam",
    });
  }
});

module.exports = router;
