// ============================================================
// FILE: routes/admin/englishAdminRoutes.js
// PURPOSE: Handle English Passages, Passage Questions,
//          Objective Questions, and Section Config.
// NOTE: Cleaned, de-duplicated, optimized WITHOUT breaking
//       existing frontend routes.
// ============================================================

const express = require("express");
const router = express.Router();
const { pool } = require("../../db");
const auth = require("../../middleware/authMiddleware");

// ============================================================
// 0. UTILITY — ID VALIDATION
// ============================================================
function ensureInt(value) {
  return !isNaN(value) && Number.isInteger(parseInt(value, 10));
}

// ============================================================
// 1. PASSAGE QUESTIONS CRUD
//    - Single: list/create/update/delete
//    - Bulk CSV upload
// ============================================================

// 1.1 — GET all questions for a passage
// GET /admin/english/passages/:passageId/questions
router.get("/passages/:passageId/questions", auth, async (req, res) => {
  const { passageId } = req.params;

  if (!ensureInt(passageId)) {
    return res.status(400).json({ message: "Invalid passage ID." });
  }

  try {
    const result = await pool.query(
      `SELECT id, passage_id, question, option_a, option_b, option_c, option_d, correct_option
         FROM english_passage_questions
        WHERE passage_id = $1
        ORDER BY id ASC`,
      [passageId]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error("🔥 [1.1] GET passage questions error:", err);
    return res
      .status(500)
      .json({ message: "Failed to load passage questions." });
  }
});

// 1.2 — CREATE a new passage question
// POST /admin/english/passages/:passageId/questions
router.post("/passages/:passageId/questions", auth, async (req, res) => {
  const { passageId } = req.params;

  if (!ensureInt(passageId)) {
    return res.status(400).json({ message: "Invalid passage ID." });
  }

  const {
    question,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_option,
  } = req.body || {};

  try {
    const result = await pool.query(
      `INSERT INTO english_passage_questions
         (passage_id, question, option_a, option_b, option_c, option_d, correct_option)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, passage_id, question, option_a, option_b, option_c, option_d, correct_option`,
      [
        passageId,
        question || "",
        option_a || "",
        option_b || "",
        option_c || "",
        option_d || "",
        (correct_option || "A").toUpperCase(),
      ]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("🔥 [1.2] POST passage question error:", err);
    return res
      .status(500)
      .json({ message: "Failed to create passage question." });
  }
});

// 1.3 — UPDATE a passage question by ID (legacy route kept)
// PUT /admin/english/passages/questions/:questionId
router.put("/passages/questions/:questionId", auth, async (req, res) => {
  const { questionId } = req.params;

  if (!ensureInt(questionId)) {
    return res.status(400).json({ message: "Invalid question ID." });
  }

  const {
    question,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_option,
  } = req.body || {};

  try {
    const result = await pool.query(
      `UPDATE english_passage_questions
          SET question=$1,
              option_a=$2,
              option_b=$3,
              option_c=$4,
              option_d=$5,
              correct_option=$6
        WHERE id=$7
        RETURNING id, passage_id, question, option_a, option_b, option_c, option_d, correct_option`,
      [
        question || "",
        option_a || "",
        option_b || "",
        option_c || "",
        option_d || "",
        (correct_option || "A").toUpperCase(),
        questionId,
      ]
    );

    if (!result.rowCount) {
      return res
        .status(404)
        .json({ message: "Passage question not found." });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("🔥 [1.3] PUT passage question error:", err);
    return res
      .status(500)
      .json({ message: "Failed to update passage question." });
  }
});

// 1.3b — UPDATE a passage question by passage + id
// (newer route signature used by some pages)
// PUT /admin/english/passages/:passageId/questions/:id
router.put(
  "/passages/:passageId/questions/:id",
  auth,
  async (req, res) => {
    const { passageId, id } = req.params;

    if (!ensureInt(passageId) || !ensureInt(id)) {
      return res.status(400).json({ message: "Invalid IDs." });
    }

    const {
      question,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_option,
    } = req.body || {};

    try {
      const result = await pool.query(
        `UPDATE english_passage_questions
           SET question=$1, option_a=$2, option_b=$3, option_c=$4,
               option_d=$5, correct_option=$6
         WHERE id=$7 AND passage_id=$8
         RETURNING id, passage_id, question, option_a, option_b, option_c, option_d, correct_option`,
        [
          question || "",
          option_a || "",
          option_b || "",
          option_c || "",
          option_d || "",
          (correct_option || "A").trim().toUpperCase(),
          id,
          passageId,
        ]
      );

      if (!result.rowCount) {
        return res
          .status(404)
          .json({ message: "Passage question not found." });
      }

      return res.json(result.rows[0]);
    } catch (err) {
      console.log("🔥 [1.3b] PUT passage question (by passage+id) error:", err);
      return res.status(500).json({ error: "Update failed" });
    }
  }
);

// 1.4 — DELETE a passage question
// DELETE /admin/english/passages/questions/:questionId
router.delete("/passages/questions/:questionId", auth, async (req, res) => {
  const { questionId } = req.params;

  if (!ensureInt(questionId)) {
    return res.status(400).json({ message: "Invalid question ID." });
  }

  try {
    const result = await pool.query(
      `DELETE FROM english_passage_questions WHERE id=$1`,
      [questionId]
    );

    if (!result.rowCount) {
      return res
        .status(404)
        .json({ message: "Passage question not found." });
    }

    return res.json({ message: "Passage question deleted." });
  } catch (err) {
    console.error("🔥 [1.4] DELETE passage question error:", err);
    return res
      .status(500)
      .json({ message: "Failed to delete passage question." });
  }
});

// 1.5 — BULK UPLOAD PASSAGE QUESTIONS (CSV)
// POST /admin/english/passages/:passageId/questions/bulk
router.post(
  "/passages/:passageId/questions/bulk",
  auth,
  async (req, res) => {
    const { passageId } = req.params;
    const { questions } = req.body || {};

    if (!ensureInt(passageId)) {
      return res.status(400).json({ message: "Invalid passage ID." });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res
        .status(400)
        .json({ message: "CSV contains no questions." });
    }

    try {
      await pool.query("BEGIN");
      let inserted = 0;
      let duplicates = [];

      // Normalize CSV questions list
      const normalizedQuestions = questions.map((q) =>
        (q.question || "").toLowerCase().trim()
      );

      // CHECK duplicates inside DB
      const placeholders = normalizedQuestions
        .map((_, i) => `$${i + 2}`)
        .join(",");
      const duplicateSql = `
        SELECT question FROM english_passage_questions
        WHERE passage_id = $1
          AND LOWER(question) IN (${placeholders})
      `;
      const dupCheck = await pool.query(duplicateSql, [
        passageId,
        ...normalizedQuestions,
      ]);

      duplicates = dupCheck.rows.map((r) =>
        r.question.toLowerCase().trim()
      );

      for (const q of questions) {
        const questionText = (q.question || "").trim();
        if (!questionText) continue;

        // Skip duplicates
        if (duplicates.includes(questionText.toLowerCase())) continue;

        const cleanedCorrect = (q.correct_option || "A")
          .toString()
          .trim()
          .replace(/[^A-D]/gi, "")
          .toUpperCase()
          .slice(0, 1);

        await pool.query(
          `INSERT INTO english_passage_questions
             (passage_id, question, option_a, option_b, option_c, option_d, correct_option)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            passageId,
            questionText,
            q.option_a || "",
            q.option_b || "",
            q.option_c || "",
            q.option_d || "",
            cleanedCorrect,
          ]
        );

        inserted++;
      }

      await pool.query("COMMIT");
      return res.json({
        inserted,
        duplicates,
      });
    } catch (err) {
      await pool.query("ROLLBACK");
      console.error("🔥 Bulk passage question upload error:", err);
      return res.status(500).json({ message: "Bulk upload failed." });
    }
  }
);

// ============================================================
// 2. PASSAGES CRUD
// ============================================================

// 2.1 — GET all passages
// GET /admin/english/passages
router.get("/passages", auth, async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, passage, category, year, created_at
         FROM english_passages
        ORDER BY created_at DESC`
    );
    return res.json(result.rows);
  } catch (err) {
    console.error("🔥 [2.1] GET passages error:", err);
    return res.status(500).json({ message: "Failed to load passages." });
  }
});

// 2.2 — GET a single passage
// GET /admin/english/passages/:id
router.get("/passages/:id", auth, async (req, res) => {
  const { id } = req.params;

  if (!ensureInt(id)) {
    return res.status(400).json({ message: "Invalid passage ID." });
  }

  try {
    const result = await pool.query(
      `SELECT id, title, passage, category, year
         FROM english_passages
        WHERE id=$1`,
      [id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: "Passage not found." });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("🔥 [2.2] GET passage error:", err);
    return res.status(500).json({ message: "Failed to load passage." });
  }
});

// 2.3 — CREATE a passage
// POST /admin/english/passages
router.post("/passages", auth, async (req, res) => {
  const { title, passage, category, year } = req.body || {};

  if (!passage || !category) {
    return res
      .status(400)
      .json({ message: "Passage text and category are required." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO english_passages (title, passage, category, year)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, passage, category, year, created_at`,
      [title || null, passage, category, year || null]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("🔥 [2.3] POST passage error:", err);
    return res.status(500).json({ message: "Failed to create passage." });
  }
});

// 2.4 — UPDATE a passage
// PUT /admin/english/passages/:id
router.put("/passages/:id", auth, async (req, res) => {
  const { id } = req.params;

  if (!ensureInt(id)) {
    return res.status(400).json({ message: "Invalid passage ID." });
  }

  const { title, passage, category, year } = req.body || {};

  try {
    const result = await pool.query(
      `UPDATE english_passages
          SET title=$1,
              passage=$2,
              category=$3,
              year=$4
        WHERE id=$5
        RETURNING id, title, passage, category, year, created_at`,
      [title || null, passage, category, year || null, id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: "Passage not found." });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("🔥 [2.4] PUT passage error:", err);
    return res.status(500).json({ message: "Failed to update passage." });
  }
});

// 2.5 — DELETE a passage
// DELETE /admin/english/passages/:id
router.delete("/passages/:id", auth, async (req, res) => {
  const { id } = req.params;

  if (!ensureInt(id)) {
    return res.status(400).json({ message: "Invalid passage ID." });
  }

  try {
    const result = await pool.query(
      `DELETE FROM english_passages WHERE id=$1`,
      [id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: "Passage not found." });
    }

    return res.json({ message: "Passage deleted." });
  } catch (err) {
    console.error("🔥 [2.5] DELETE passage error:", err);
    return res.status(500).json({ message: "Failed to delete passage." });
  }
});

// ============================================================
// 3. OBJECTIVE QUESTIONS CRUD
//    - Full list (legacy), single CRUD
//    - Paged by category
//    - Bulk upload by category
//    - Duplicate check by category
// ============================================================

// 3.1 — PAGED LIST: /admin/english/objectives/paged?category=&page=&limit=
// GET /admin/english/objectives/paged
router.get("/objectives/paged", auth, async (req, res) => {
  const { category, page = 1, limit = 20 } = req.query;

  if (!category) {
    return res.status(400).json({ message: "Category is required." });
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const offset = (pageNum - 1) * limitNum;

  try {
    const listResult = await pool.query(
      `SELECT id, category, question, option_a, option_b, option_c, option_d, correct_option
         FROM english_objective_questions
        WHERE category=$1
        ORDER BY id ASC
        LIMIT $2 OFFSET $3`,
      [category, limitNum, offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) AS total
         FROM english_objective_questions
        WHERE category=$1`,
      [category]
    );

    const total = parseInt(countResult.rows[0].total, 10) || 0;
    const totalPages = Math.max(1, Math.ceil(total / limitNum));

    return res.json({
      data: listResult.rows,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    });
  } catch (err) {
    console.error("🔥 [3.1] GET /objectives/paged error:", err);
    return res.status(500).json({ message: "Failed to load objectives." });
  }
});

// 3.2 — BULK UPLOAD BY CATEGORY
// POST /admin/english/objectives/bulk/:category
router.post("/objectives/bulk/:category", auth, async (req, res) => {
  const { category } = req.params;
  const { questions } = req.body || {};

  if (!category) {
    return res.status(400).json({ message: "Category is required." });
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ message: "No questions provided." });
  }

  try {
    await pool.query("BEGIN");

    let inserted = 0;
    for (const q of questions) {
      const {
        question,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
      } = q || {};

      if (!question) continue;

      await pool.query(
        `INSERT INTO english_objective_questions
           (category, question, option_a, option_b, option_c, option_d, correct_option)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          category,
          question || "",
          option_a || "",
          option_b || "",
          option_c || "",
          option_d || "",
          (correct_option || "A").toUpperCase(),
        ]
      );
      inserted++;
    }

    await pool.query("COMMIT");
    return res.json({ inserted });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("🔥 [3.2] POST /objectives/bulk error:", err);
    return res
      .status(500)
      .json({ message: "Failed to bulk upload questions." });
  }
});

// 3.3 — CHECK DUPLICATE QUESTIONS BEFORE BULK UPLOAD
// POST /admin/english/objectives/check-duplicates/:category
router.post(
  "/objectives/check-duplicates/:category",
  auth,
  async (req, res) => {
    const { category } = req.params;
    const { questions } = req.body || {};

    if (!category) {
      return res.status(400).json({ message: "Category is required." });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res
        .status(400)
        .json({ message: "Questions array required." });
    }

    try {
      const lowered = questions.map((q) => q.toLowerCase().trim());
      const params = [category, ...lowered];

      // Build placeholders $2, $3, $4...
      const placeholders = lowered.map((_, i) => `$${i + 2}`).join(",");

      const sql = `
        SELECT question
        FROM english_objective_questions
        WHERE category = $1
          AND LOWER(question) IN (${placeholders})
      `;

      const result = await pool.query(sql, params);

      return res.json({
        duplicates: result.rows.map((r) => r.question),
      });
    } catch (err) {
      console.error("🔥 DUPLICATE CHECK ERROR:", err);
      return res.status(500).json({ message: "Duplicate check failed." });
    }
  }
);

// 3.4 — GET all objective questions (legacy endpoint)
// GET /admin/english/objectives
router.get("/objectives", auth, async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, category, question, option_a, option_b, option_c, option_d, correct_option
         FROM english_objective_questions
        ORDER BY id ASC`
    );
    return res.json(result.rows);
  } catch (err) {
    console.error("🔥 [3.4] GET /objectives error:", err);
    return res.status(500).json({ message: "Failed to load objective questions." });
  }
});

// 3.5 — CREATE single objective question
// POST /admin/english/objectives
router.post("/objectives", auth, async (req, res) => {
  const {
    category,
    question,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_option,
  } = req.body || {};

  if (!category) {
    return res.status(400).json({ message: "Category is required." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO english_objective_questions
         (category, question, option_a, option_b, option_c, option_d, correct_option)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, category, question, option_a, option_b, option_c, option_d, correct_option`,
      [
        category,
        question || "",
        option_a || "",
        option_b || "",
        option_c || "",
        option_d || "",
        (correct_option || "A").toUpperCase(),
      ]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("🔥 [3.5] POST /objectives error:", err);
    return res.status(500).json({ message: "Failed to create objective question." });
  }
});

// 3.6 — UPDATE objective question
// PUT /admin/english/objectives/:id
router.put("/objectives/:id", auth, async (req, res) => {
  const { id } = req.params;

  if (!ensureInt(id)) {
    return res.status(400).json({ message: "Invalid objective ID." });
  }

  const {
    category,
    question,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_option,
  } = req.body || {};

  try {
    const result = await pool.query(
      `UPDATE english_objective_questions
          SET category=$1,
              question=$2,
              option_a=$3,
              option_b=$4,
              option_c=$5,
              option_d=$6,
              correct_option=$7
        WHERE id=$8
        RETURNING id, category, question, option_a, option_b, option_c, option_d, correct_option`,
      [
        category,
        question || "",
        option_a || "",
        option_b || "",
        option_c || "",
        option_d || "",
        (correct_option || "A").toUpperCase(),
        id,
      ]
    );

    if (!result.rowCount) {
      return res
        .status(404)
        .json({ message: "Objective question not found." });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("🔥 [3.6] PUT /objectives/:id error:", err);
    return res
      .status(500)
      .json({ message: "Failed to update objective question." });
  }
});

// 3.7 — DELETE objective question
// DELETE /admin/english/objectives/:id
router.delete("/objectives/:id", auth, async (req, res) => {
  const { id } = req.params;

  if (!ensureInt(id)) {
    return res.status(400).json({ message: "Invalid objective ID." });
  }

  try {
    const result = await pool.query(
      `DELETE FROM english_objective_questions
        WHERE id=$1`,
      [id]
    );

    if (!result.rowCount) {
      return res
        .status(404)
        .json({ message: "Objective question not found." });
    }

    return res.json({ message: "Objective question deleted." });
  } catch (err) {
    console.error("🔥 [3.7] DELETE /objectives/:id error:", err);
    return res
      .status(500)
      .json({ message: "Failed to delete objective question." });
  }
});

// ============================================================
// 4. SECTION CONFIG CRUD
// ============================================================

// 4.1 — GET section config
// GET /admin/english/section-config
router.get("/section-config", auth, async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id,
              section AS section_name,
              question_count AS number_of_questions,
              enabled
         FROM english_section_config
        ORDER BY id ASC`
    );
    return res.json(result.rows);
  } catch (err) {
    console.error("🔥 [4.1] GET section config error:", err);
    return res.status(500).json({ message: "Failed to load section config." });
  }
});

// 4.2 — UPDATE section config
// PUT /admin/english/section-config/:id
router.put("/section-config/:id", auth, async (req, res) => {
  const { id } = req.params;

  if (!ensureInt(id)) {
    return res.status(400).json({ message: "Invalid config ID." });
  }

  let { number_of_questions, enabled } = req.body || {};

  // Coerce to proper types
  number_of_questions = parseInt(number_of_questions, 10) || 0;
  enabled =
    enabled === true ||
    enabled === "true" ||
    enabled === 1 ||
    enabled === "1";

  try {
    const result = await pool.query(
      `UPDATE english_section_config
          SET question_count = $1,
              enabled = $2
        WHERE id = $3
        RETURNING id,
                  section AS section_name,
                  question_count AS number_of_questions,
                  enabled`,
      [number_of_questions, enabled, id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: "Config entry not found." });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("🔥 [4.2] PUT section config error:", err);
    return res.status(500).json({ message: "Failed to update config." });
  }
});

module.exports = router;
