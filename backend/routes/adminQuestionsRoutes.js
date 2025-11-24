// =====================================================
// adminQuestionsRoutes.js (FINAL WITH CRUD + BULK UPLOAD)
// =====================================================

const express = require("express");
const router = express.Router();

const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { parse } = require("csv-parse/sync");
const AdmZip = require("adm-zip");

const auth = require("../middleware/authMiddleware");
const { pool } = require("../db");

// ================================================
// MULTER CONFIG FOR CSV + OPTIONAL ZIP
// ================================================
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

// ================================================
// NEW FINAL CSV HEADERS
// ================================================
const REQUIRED_HEADERS = [
  "question",
  "option_a",
  "option_b",
  "option_c",
  "option_d",
  "correct_option",
  "explanation",
  "difficulty",
  "stem_image_url",
];

const DIFF_OK = new Set(["easy", "medium", "hard"]);

// ================================================
// FLEXIBLE HEADER PICKER
// ================================================
function pick(row, key) {
  if (row[key] !== undefined) return row[key];
  const lower = key.toLowerCase();
  for (const k of Object.keys(row)) {
    if (k.toLowerCase() === lower) return row[k];
  }
  return "";
}

// ================================================
// NORMALIZE ROW (NEW FORMAT)
// ================================================
function normalizeRow(row) {
  return {
    question: pick(row, "question").trim(),
    option_a: pick(row, "option_a").trim(),
    option_b: pick(row, "option_b").trim(),
    option_c: pick(row, "option_c").trim(),
    option_d: pick(row, "option_d").trim(),
    correct_option: pick(row, "correct_option").trim().toUpperCase(),
    explanation: pick(row, "explanation").trim() || null,
    difficulty: pick(row, "difficulty").trim().toLowerCase() || "medium",
    stem_image_url: pick(row, "stem_image_url").trim(),
  };
}

// ================================================
// UTILITIES FOR ZIP -> URL HANDLING
// ================================================
function ensureUploadsDirForSubject(subjectCode) {
  const base = path.join(__dirname, "..", "uploads");
  const dir = path.join(base, subjectCode);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function publicUrlFor(req, subjectCode, filename) {
  return `${req.protocol}://${req.get("host")}/uploads/${subjectCode}/${filename}`;
}

function writeSubjectImage(req, subjectCode, originalName, buffer) {
  const safeName = path.basename(originalName).replace(/[^A-Za-z0-9._-]/g, "_");
  const dir = ensureUploadsDirForSubject(subjectCode);
  const full = path.join(dir, safeName);
  fs.writeFileSync(full, buffer);
  return publicUrlFor(req, subjectCode, safeName);
}

// ================================================
// AUTO-DETECT CSV DELIMITER
// ================================================
function autoDetectDelimiter(buffer) {
  const sample = buffer.toString("utf8").split(/\r?\n/).slice(0, 10).join("\n");
  const comma = (sample.match(/,/g) || []).length;
  const semi = (sample.match(/;/g) || []).length;
  return semi > comma ? ";" : ",";
}

// ============================================================
// GET /admin/questions  -> list questions WITH PAGINATION + SEARCH
//   query: ?subject_id=1&page=1&limit=20&search=xxx
// ============================================================
router.get("/", auth, async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const subjectId = parseInt(req.query.subject_id || "", 10);
    if (!subjectId) {
      return res.status(400).json({ message: "subject_id is required" });
    }

    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "20", 10);
    const search = req.query.search ? `%${req.query.search}%` : "";
    const offset = (page - 1) * limit;

    // Count with search
    const countRes = await pool.query(
      `SELECT COUNT(*)
       FROM questions
       WHERE subject_id = $1
         AND (question ILIKE $2 OR $2 = '')`,
      [subjectId, search]
    );

    const total = parseInt(countRes.rows[0].count, 10);
    const totalPages = Math.ceil(total / limit);

    // Page results
    const result = await pool.query(
      `SELECT id, subject_id, question,
              option_a, option_b, option_c, option_d,
              correct_option, explanation, difficulty, stem_image_url
       FROM questions
       WHERE subject_id = $1
         AND (question ILIKE $2 OR $2 = '')
       ORDER BY id ASC
       LIMIT $3 OFFSET $4`,
      [subjectId, search, limit, offset]
    );

    return res.json({
      questions: result.rows,
      page,
      limit,
      totalPages,
      totalQuestions: total,
    });

  } catch (err) {
    console.error("List questions error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ============================================================
// BULK UPLOAD: POST /admin/questions/upload
// ============================================================
router.post(
  "/upload",
  auth,
  upload.fields([{ name: "file" }, { name: "images_zip" }]),
  async (req, res) => {
    try {
      if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Validate subject_id
      const subject_id = parseInt(req.body.subject_id || "", 10);
      if (!subject_id) {
        return res.status(400).json({ message: "subject_id is required" });
      }

      // Get subject code
      const s = await pool.query("SELECT code FROM subjects WHERE id=$1", [subject_id]);
      if (!s.rowCount) return res.status(400).json({ message: "Invalid subject_id" });

      const subjectCode = s.rows[0].code?.trim()?.toUpperCase();
      if (!subjectCode) return res.status(400).json({ message: "Subject has no code" });

      // CSV FILE
      const csvPart = req.files?.file?.[0];
      if (!csvPart) return res.status(400).json({ message: "CSV file is required" });

      const delimiter = autoDetectDelimiter(csvPart.buffer);

      let rows;
      try {
        rows = parse(csvPart.buffer, {
          columns: true,
          skip_empty_lines: true,
          bom: true,
          delimiter,
          relax_quotes: true,
          relax_column_count: true,
        });
      } catch (err) {
        return res.status(400).json({ message: "Failed to parse CSV" });
      }

      if (!rows.length) {
        return res.status(400).json({ message: "CSV file is empty" });
      }

      // VALIDATE HEADERS
      const headerKeys = Object.keys(rows[0]).map((k) => k.toLowerCase());
      const missing = REQUIRED_HEADERS.filter(
        (h) => !headerKeys.includes(h.toLowerCase())
      );

      if (missing.length > 0) {
        return res.status(400).json({
          message: `CSV missing required headers: ${missing.join(", ")}`,
        });
      }

      // ZIP IMAGES (OPTIONAL)
      const zipPart = req.files?.images_zip?.[0];
      let zipMap = new Map();

      if (zipPart) {
        try {
          const zip = new AdmZip(zipPart.buffer);
          for (const entry of zip.getEntries()) {
            if (!entry.isDirectory) {
              const fname = path.basename(entry.entryName);
              zipMap.set(fname.toLowerCase(), entry.getData());
            }
          }
        } catch {
          return res.status(400).json({ message: "Failed to read ZIP file" });
        }
      }

      const toUrl = (value) => {
        if (!value) return "";
        if (/^https?:\/\//i.test(value)) return value; // already URL

        const base = path.basename(value).toLowerCase();
        const buf = zipMap.get(base);

        if (!buf) return value; // not in zip, leave as is

        return writeSubjectImage(req, subjectCode, base, buf);
      };

      // PROCESS ROWS
      let inserted = 0;
      let skipped = 0;
      const errors = [];
      const values = [];

      rows.forEach((raw, index) => {
        const r = normalizeRow(raw);

        // Apply ZIP mapping to STEM ONLY
        r.stem_image_url = toUrl(r.stem_image_url);

        // Validation
        const validQ = r.question.length > 0;
        const validOpt = r.option_a || r.option_b || r.option_c || r.option_d;
        const validCorrect = ["A", "B", "C", "D"].includes(r.correct_option);
        const validDiff = DIFF_OK.has(r.difficulty);

        if (!validQ || !validOpt || !validCorrect || !validDiff) {
          skipped++;
          errors.push({
            row: index + 2,
            error: !validQ
              ? "Missing question"
              : !validOpt
              ? "At least one option must have text"
              : !validCorrect
              ? "correct_option must be A/B/C/D"
              : "difficulty must be easy/medium/hard",
          });
          return;
        }

        values.push([
          subject_id,
          r.question,
          r.option_a,
          r.option_b,
          r.option_c,
          r.option_d,
          r.correct_option,
          r.explanation,
          r.difficulty,
          r.stem_image_url || null,
        ]);

        inserted++;
      });

      if (inserted === 0) {
        return res.status(400).json({
          inserted: 0,
          skipped,
          errors,
          message: "No valid rows to insert",
        });
      }

      // FINAL INSERT
      const cols = `(subject_id, question, option_a, option_b, option_c, option_d,
                      correct_option, explanation, difficulty, stem_image_url)`;

      const flat = [];
      const placeholders = values
        .map((row, i) => {
          const base = i * row.length;
          row.forEach((v) => flat.push(v));
          return `(${row.map((_, j) => `$${base + j + 1}`).join(",")})`;
        })
        .join(",");

      await pool.query(`INSERT INTO questions ${cols} VALUES ${placeholders}`, flat);

      return res.json({
        inserted,
        skipped,
        errors,
        message: "Upload finished",
      });
    } catch (err) {
      console.error("Bulk upload error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

// ===================================================================
// SINGLE QUESTION: POST /admin/questions  (CREATE)
// ===================================================================
router.post("/", auth, async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

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
      return res.status(400).json({ message: "subject_id is required" });

    if (!question || !question.trim())
      return res.status(400).json({ message: "Question text is required" });

    if (!option_a || !option_b || !option_c || !option_d)
      return res.status(400).json({ message: "All options must have text" });

    const correct = (correct_option || "").toUpperCase();
    if (!["A", "B", "C", "D"].includes(correct))
      return res.status(400).json({ message: "correct_option must be A/B/C/D" });

    const diff = (difficulty || "medium").toLowerCase();
    if (!DIFF_OK.has(diff))
      return res.status(400).json({ message: "Invalid difficulty" });

    const sql = `
      INSERT INTO questions
      (subject_id, question, option_a, option_b, option_c, option_d,
       correct_option, explanation, difficulty, stem_image_url)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING id
    `;

    const params = [
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
    ];

    const r = await pool.query(sql, params);

    return res.json({
      message: "Question created successfully",
      id: r.rows[0].id,
    });
  } catch (err) {
    console.error("Single question insert error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ===================================================================
// UPDATE QUESTION: PUT /admin/questions/:id
// ===================================================================
router.put("/:id", auth, async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const id = parseInt(req.params.id || "", 10);
    if (!id) return res.status(400).json({ message: "Invalid question id" });

    const {
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

    if (!question || !question.trim())
      return res.status(400).json({ message: "Question text is required" });

    if (!option_a || !option_b || !option_c || !option_d)
      return res.status(400).json({ message: "All options must have text" });

    const correct = (correct_option || "").toUpperCase();
    if (!["A", "B", "C", "D"].includes(correct))
      return res.status(400).json({ message: "correct_option must be A/B/C/D" });

    const diff = (difficulty || "medium").toLowerCase();
    if (!DIFF_OK.has(diff))
      return res.status(400).json({ message: "Invalid difficulty" });

    const sql = `
      UPDATE questions
      SET question = $1,
          option_a = $2,
          option_b = $3,
          option_c = $4,
          option_d = $5,
          correct_option = $6,
          explanation = $7,
          difficulty = $8,
          stem_image_url = $9
      WHERE id = $10
      RETURNING *
    `;

    const params = [
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
    ];

    const r = await pool.query(sql, params);
    if (!r.rowCount)
      return res.status(404).json({ message: "Question not found" });

    return res.json({
      message: "Question updated successfully",
      question: r.rows[0],
    });
  } catch (err) {
    console.error("Update question error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ===================================================================
// DELETE QUESTION: DELETE /admin/questions/:id
// ===================================================================
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const id = parseInt(req.params.id || "", 10);
    if (!id) return res.status(400).json({ message: "Invalid question id" });

    const r = await pool.query("DELETE FROM questions WHERE id = $1", [id]);
    if (!r.rowCount)
      return res.status(404).json({ message: "Question not found" });

    return res.json({ message: "Question deleted successfully" });
  } catch (err) {
    console.error("Delete question error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});


// ===================================================================
// EXPORT QUESTIONS TO CSV: GET /admin/questions/export?subject_id=1
// ===================================================================
router.get("/export", auth, async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const subjectId = parseInt(req.query.subject_id || "", 10);
    if (!subjectId)
      return res.status(400).json({ message: "subject_id is required" });

    const result = await pool.query(
      `SELECT question, option_a, option_b, option_c, option_d,
              correct_option, explanation, difficulty, stem_image_url
       FROM questions
       WHERE subject_id = $1
       ORDER BY id ASC`,
      [subjectId]
    );

    const rows = result.rows;

    // Build CSV
    let csv = "question,option_a,option_b,option_c,option_d,correct_option,explanation,difficulty,stem_image_url\n";

    for (const r of rows) {
      csv += `"${r.question.replace(/"/g, '""')}",` +
             `"${r.option_a.replace(/"/g, '""')}",` +
             `"${r.option_b.replace(/"/g, '""')}",` +
             `"${r.option_c.replace(/"/g, '""')}",` +
             `"${r.option_d.replace(/"/g, '""')}",` +
             `"${r.correct_option}",` +
             `"${r.explanation ? r.explanation.replace(/"/g, '""') : ""}",` +
             `"${r.difficulty}",` +
             `"${r.stem_image_url || ""}"\n`;
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=questions.csv");
    res.send(csv);

  } catch (err) {
    console.error("Export CSV error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ===================================================================
// BULK DELETE: DELETE /admin/questions/bulk?subject_id=1
// ===================================================================
router.delete("/bulk", auth, async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const subjectId = parseInt(req.query.subject_id || "", 10);
    if (!subjectId)
      return res.status(400).json({ message: "subject_id is required" });

    const result = await pool.query(
      "DELETE FROM questions WHERE subject_id = $1",
      [subjectId]
    );

    return res.json({
      message: "All questions deleted successfully",
      deleted: result.rowCount,
    });
  } catch (err) {
    console.error("Bulk delete error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ===================================================================
// BULK DELETE SELECTED QUESTIONS: POST /admin/questions/bulk-delete
// ===================================================================
router.post("/bulk-delete", auth, async (req, res) => {
  try {
    if (req.user?.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });

    const ids = req.body.ids;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ message: "Send an array of question IDs" });
    }

    const result = await pool.query(
      `DELETE FROM questions WHERE id = ANY($1::int[])`,
      [ids]
    );

    return res.json({
      deleted: result.rowCount,
      message: `${result.rowCount} questions deleted`,
    });
  } catch (err) {
    console.error("Bulk delete selected error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
