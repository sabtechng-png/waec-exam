// =====================================================
// questionsManageRoutes.js  (CRUD + Pagination + Search)
// =====================================================

const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { pool } = require("../db");

const DIFF_OK = new Set(["easy", "medium", "hard"]);

// ============================================================
// GET /admin/questions  -> list with pagination + search
// ============================================================
router.get("/", auth, async (req, res) => {
  try {
    if (req.user?.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });

    const subjectId = parseInt(req.query.subject_id || "", 10);
    if (!subjectId)
      return res.status(400).json({ message: "subject_id is required" });

    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "20", 10);
    const search = req.query.search ? `%${req.query.search}%` : "";
    const offset = (page - 1) * limit;

    const count = await pool.query(
      `SELECT COUNT(*) FROM questions 
       WHERE subject_id=$1 AND (question ILIKE $2 OR $2 = '')`,
      [subjectId, search]
    );

    const total = parseInt(count.rows[0].count, 10);
    const totalPages = Math.ceil(total / limit);

    const rows = await pool.query(
      `SELECT * FROM questions
       WHERE subject_id=$1 AND (question ILIKE $2 OR $2 = '')
       ORDER BY id ASC
       LIMIT $3 OFFSET $4`,
      [subjectId, search, limit, offset]
    );

    return res.json({
      questions: rows.rows,
      page,
      limit,
      totalPages,
      totalQuestions: total,
    });

  } catch (err) {
    console.error("List questions error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================================================
// CREATE: POST /admin/questions
// ============================================================
router.post("/", auth, async (req, res) => {
  try {
    if (req.user?.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });

    const {
      subject_id,
      question,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_option,
      explanation,
      difficulty,
      stem_image_url,
    } = req.body;

    if (!subject_id)
      return res.status(400).json({ message: "subject_id required" });

    if (!question?.trim())
      return res.status(400).json({ message: "Question required" });

    if (!option_a || !option_b || !option_c || !option_d)
      return res.status(400).json({ message: "Options required" });

    const correct = correct_option?.toUpperCase();
    if (!["A", "B", "C", "D"].includes(correct))
      return res.status(400).json({ message: "Correct must be A/B/C/D" });

    const diff = difficulty?.toLowerCase() || "medium";
    if (!DIFF_OK.has(diff))
      return res.status(400).json({ message: "Invalid difficulty" });

    const r = await pool.query(
      `INSERT INTO questions
       (subject_id, question, option_a, option_b, option_c, option_d,
        correct_option, explanation, difficulty, stem_image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id`,
      [
        subject_id,
        question.trim(),
        option_a.trim(),
        option_b.trim(),
        option_c.trim(),
        option_d.trim(),
        correct,
        explanation || null,
        diff,
        stem_image_url || null,
      ]
    );

    res.json({ message: "Created", id: r.rows[0].id });

  } catch (err) {
    console.error("Create error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================================================
// GET TOTAL QUESTIONS FOR A SUBJECT
// ============================================================
router.get("/count", auth, async (req, res) => {
  try {
    const subjectId = Number(req.query.subject_id);

    if (!subjectId || isNaN(subjectId)) {
      return res.status(400).json({ message: "Invalid subject_id" });
    }

    const result = await pool.query(
      "SELECT COUNT(*) AS total FROM questions WHERE subject_id = $1",
      [subjectId]
    );

    const total = Number(result.rows[0]?.total || 0);

    return res.json({
      subject_id: subjectId,
      total
    });

  } catch (err) {
    console.error("Count error:", err);
    res.status(500).json({ message: "Server error" });
  }
});







// ============================================================
// UPDATE: PUT /admin/questions/:id
// ============================================================
router.put("/:id", auth, async (req, res) => {
  try {
    if (req.user?.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });

    const id = parseInt(req.params.id || "", 10);
    if (!id) return res.status(400).json({ message: "Bad ID" });

    const {
      question,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_option,
      explanation,
      difficulty,
      stem_image_url
    } = req.body;

    if (!question?.trim())
      return res.status(400).json({ message: "Question required" });

    const correct = correct_option?.toUpperCase();
    if (!["A", "B", "C", "D"].includes(correct))
      return res.status(400).json({ message: "Correct must be A/B/C/D" });

    const diff = difficulty?.toLowerCase() || "medium";
    if (!DIFF_OK.has(diff))
      return res.status(400).json({ message: "Invalid difficulty" });

    const r = await pool.query(
      `UPDATE questions
       SET question=$1, option_a=$2, option_b=$3, option_c=$4, option_d=$5,
           correct_option=$6, explanation=$7, difficulty=$8, stem_image_url=$9
       WHERE id=$10 RETURNING *`,
      [
        question.trim(),
        option_a.trim(),
        option_b.trim(),
        option_c.trim(),
        option_d.trim(),
        correct,
        explanation || null,
        diff,
        stem_image_url || null,
        id,
      ]
    );

    if (!r.rowCount)
      return res.status(404).json({ message: "Not found" });

    res.json({ message: "Updated", question: r.rows[0] });

  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// ============================================================
// DELETE ALL QUESTIONS FOR A SUBJECT (must come BEFORE :id)
// ============================================================
router.delete("/bulk", auth, async (req, res) => {
  try {
    if (req.user?.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });

    const subjectId = Number(req.query.subject_id);

    if (!Number.isInteger(subjectId) || subjectId <= 0) {
      return res.status(400).json({
        message: "Invalid subject_id",
        received: req.query.subject_id
      });
    }

    const result = await pool.query(
      "DELETE FROM questions WHERE subject_id = $1",
      [subjectId]
    );

    return res.json({
      message: `Deleted ${result.rowCount} questions`,
      deleted: result.rowCount
    });

  } catch (err) {
    console.error("Bulk delete ALL error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ============================================================
// BULK DELETE SELECTED: POST /admin/questions/bulk-delete
// ============================================================
router.post("/bulk-delete", auth, async (req, res) => {
  try {
    if (req.user?.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });

    let { ids } = req.body;

    if (!Array.isArray(ids))
      return res.status(400).json({ message: "ids must be an array" });

    const cleanIds = ids
      .map((x) => Number(x))
      .filter((n) => Number.isInteger(n) && n > 0);

    if (cleanIds.length === 0) {
      return res.status(400).json({
        message: "No valid question IDs provided",
        received: ids
      });
    }

    const placeholders = cleanIds.map((_, i) => `$${i + 1}`).join(",");

    const result = await pool.query(
      `DELETE FROM questions WHERE id IN (${placeholders})`,
      cleanIds
    );

    return res.json({
      message: `Deleted ${result.rowCount} selected questions`,
      deleted: result.rowCount,
      ids: cleanIds
    });

  } catch (err) {
    console.error("Bulk delete selected error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ============================================================
// DELETE SINGLE QUESTION: DELETE /admin/questions/:id
// ============================================================
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user?.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid ID",
        received: req.params.id
      });
    }

    const r = await pool.query("DELETE FROM questions WHERE id=$1", [id]);

    if (!r.rowCount)
      return res.status(404).json({ message: "Not found" });

    res.json({ message: "Deleted" });

  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===================================================================
// DUPLICATE QUESTION: POST /admin/questions/:id/duplicate
// ===================================================================
router.post("/:id/duplicate", auth, async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const id = parseInt(req.params.id || "", 10);
    if (!id) {
      return res.status(400).json({ message: "Invalid question id" });
    }

    // 1. Fetch the original question
    const q = await pool.query(
      `SELECT subject_id, question, option_a, option_b, option_c, option_d,
              correct_option, explanation, difficulty, stem_image_url
       FROM questions
       WHERE id = $1`,
      [id]
    );

    if (!q.rowCount) {
      return res.status(404).json({ message: "Question not found" });
    }

    const original = q.rows[0];

    // 2. Insert the duplicate
    const clone = await pool.query(
      `INSERT INTO questions
        (subject_id, question, option_a, option_b, option_c, option_d,
         correct_option, explanation, difficulty, stem_image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        original.subject_id,
        original.question,
        original.option_a,
        original.option_b,
        original.option_c,
        original.option_d,
        original.correct_option,
        original.explanation,
        original.difficulty,
        original.stem_image_url,
      ]
    );

    return res.json({
      message: "Question duplicated successfully",
      question: clone.rows[0],
    });

  } catch (err) {
    console.error("Duplicate question error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
