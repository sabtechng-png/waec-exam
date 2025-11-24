// =====================================================
// questionsBulkOpsRoutes.js (EXPORT + DELETE ALL)
// =====================================================

const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { pool } = require("../db");

// =====================================================
// SAFELY PARSE subject_id
// =====================================================
function parseSubjectId(raw) {
  if (!raw) return { error: "subject_id is missing" };
  const num = Number(raw);
  if (Number.isNaN(num) || num <= 0)
    return { error: `Invalid subject_id: ${raw}` };
  return { value: num };
}

// =====================================================
// EXPORT CSV: GET /admin/questions/export
// =====================================================
router.get("/export", auth, async (req, res) => {
  try {
    if (req.user?.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });

    const parsed = parseSubjectId(req.query.subject_id);
    if (parsed.error)
      return res.status(400).json({ message: parsed.error });

    const subjectId = parsed.value;

    const result = await pool.query(
      `SELECT question, option_a, option_b, option_c, option_d,
              correct_option, explanation, difficulty, stem_image_url
       FROM questions
       WHERE subject_id = $1
       ORDER BY id ASC`,
      [subjectId]
    );

    let csv =
      "question,option_a,option_b,option_c,option_d,correct_option,explanation,difficulty,stem_image_url\n";

    for (const r of result.rows) {
      csv += `"${(r.question || "").replace(/"/g, '""')}",` +
             `"${(r.option_a || "").replace(/"/g, '""')}",` +
             `"${(r.option_b || "").replace(/"/g, '""')}",` +
             `"${(r.option_c || "").replace(/"/g, '""')}",` +
             `"${(r.option_d || "").replace(/"/g, '""')}",` +
             `"${r.correct_option}",` +
             `"${(r.explanation || "").replace(/"/g, '""')}",` +
             `"${r.difficulty}",` +
             `"${r.stem_image_url || ""}"\n`;
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=questions_export.csv"
    );

    return res.send(csv);
  } catch (err) {
    console.error("Export CSV error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// =====================================================
// DELETE ALL QUESTIONS FOR A SUBJECT
// DELETE /admin/questions/bulk?subject_id=1
// =====================================================
router.delete("/bulk", auth, async (req, res) => {
  try {
    if (req.user?.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });

    const parsed = parseSubjectId(req.query.subject_id);
    if (parsed.error)
      return res.status(400).json({ message: parsed.error });

    const subjectId = parsed.value;

    const result = await pool.query(
      "DELETE FROM questions WHERE subject_id = $1",
      [subjectId]
    );

    return res.json({
      deleted: result.rowCount,
      message: `Deleted ${result.rowCount} questions`,
    });
  } catch (err) {
    console.error("Bulk delete error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
