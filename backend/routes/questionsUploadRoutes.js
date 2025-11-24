// =====================================================
// questionsUploadRoutes.js (BULK CSV + ZIP UPLOAD)
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

// =====================================================
// MULTER CONFIG
// =====================================================
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

// =====================================================
// REQUIRED CSV HEADERS
// =====================================================
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

// =====================================================
// FLEXIBLE CSV PICK
// =====================================================
function pick(row, key) {
  if (row[key] !== undefined) return row[key];
  const lower = key.toLowerCase();
  for (const k of Object.keys(row)) {
    if (k.toLowerCase() === lower) return row[k];
  }
  return "";
}

// =====================================================
// NORMALIZE ROW
// =====================================================
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

// =====================================================
// IMAGE HELPERS
// =====================================================
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

// =====================================================
// AUTO-DETECT CSV DELIMITER
// =====================================================
function autoDetectDelimiter(buffer) {
  const sample = buffer.toString("utf8").split(/\r?\n/).slice(0, 10).join("\n");
  const comma = (sample.match(/,/g) || []).length;
  const semi = (sample.match(/;/g) || []).length;
  return semi > comma ? ";" : ",";
}

// =====================================================
// BULK UPLOAD ROUTE
// POST /admin/questions/upload
// =====================================================
router.post(
  "/upload",
  auth,
  upload.fields([{ name: "file" }, { name: "images_zip" }]),
  async (req, res) => {
    try {
      if (req.user?.role !== "admin")
        return res.status(403).json({ message: "Forbidden" });

      const subject_id = parseInt(req.body.subject_id || "", 10);
      if (!subject_id)
        return res.status(400).json({ message: "subject_id is required" });

      // Fetch subject code
      const s = await pool.query("SELECT code FROM subjects WHERE id = $1", [
        subject_id,
      ]);
      if (!s.rowCount)
        return res.status(400).json({ message: "Invalid subject_id" });

      const subjectCode = s.rows[0].code?.trim()?.toUpperCase();

      // CSV FILE
      const csvPart = req.files?.file?.[0];
      if (!csvPart)
        return res.status(400).json({ message: "CSV file is required" });

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
      } catch {
        return res.status(400).json({ message: "Failed to parse CSV" });
      }

      // VALIDATE HEADERS
      const headerKeys = Object.keys(rows[0]).map((k) => k.toLowerCase());
      const missing = REQUIRED_HEADERS.filter(
        (h) => !headerKeys.includes(h.toLowerCase())
      );

      if (missing.length > 0)
        return res.status(400).json({
          message: `CSV missing required headers: ${missing.join(", ")}`,
        });

      // PROCESS ZIP FILE
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
        if (/^https?:\/\//i.test(value)) return value;
        const base = path.basename(value).toLowerCase();
        const buf = zipMap.get(base);
        if (!buf) return value;
        return writeSubjectImage(req, subjectCode, base, buf);
      };

      // PROCESS ROWS
      let inserted = 0;
      let skipped = 0;
      const errors = [];
      const values = [];

      rows.forEach((raw, index) => {
        const r = normalizeRow(raw);

        r.stem_image_url = toUrl(r.stem_image_url);

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

      if (inserted === 0)
        return res.status(400).json({
          inserted: 0,
          skipped,
          errors,
          message: "No valid rows to insert",
        });

      // INSERT VALUES
      const cols = `(subject_id, question, option_a, option_b, option_c, option_d,
                      correct_option, explanation, difficulty, stem_image_url)`;

      const flat = [];
      const placeholders = values
        .map((row, i) => {
          const base = i * row.length;
          row.forEach((v) => flat.push(v));
          return `(${row
            .map((_, j) => `$${base + j + 1}`)
            .join(",")})`;
        })
        .join(",");

      await pool.query(`INSERT INTO questions ${cols} VALUES ${placeholders}`, flat);

      res.json({ inserted, skipped, errors, message: "Upload finished" });

    } catch (err) {
      console.error("Bulk upload error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
