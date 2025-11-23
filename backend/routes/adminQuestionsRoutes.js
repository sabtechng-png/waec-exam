// routes/adminQuestionsRoutes.js
const express = require("express");
const router = express.Router();

const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { parse } = require("csv-parse/sync");
const AdmZip = require("adm-zip");

const auth = require("../middleware/authMiddleware");
const { pool } = require("../db");

// -----------------------------------------------------
// Multer: keep CSV/ZIP in memory (25MB cap per part)
// -----------------------------------------------------
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

// -----------------------------------------------------
// Configuration & helpers
// -----------------------------------------------------
const REQUIRED_HEADERS = [
  "question",
  "stem_image_url",
  "option_a",
  "option_b",
  "option_c",
  "option_d",
  "option_a_image_url",
  "option_b_image_url",
  "option_c_image_url",
  "option_d_image_url",
  "correct_option",
  "explanation",
  "difficulty",
];

const DIFF_OK = new Set(["easy", "medium", "hard"]);

// tolerant header pick
function pick(row, k) {
  if (row[k] !== undefined) return row[k];
  const lower = k.toLowerCase();
  for (const key of Object.keys(row)) {
    if (key.toLowerCase() === lower) return row[key];
  }
  return undefined;
}

function normalizeRow(row) {
  return {
    question: (pick(row, "question") || "").trim(),
    stem_image_url: (pick(row, "stem_image_url") || "").trim(),
    option_a: (pick(row, "option_a") || "").trim(),
    option_b: (pick(row, "option_b") || "").trim(),
    option_c: (pick(row, "option_c") || "").trim(),
    option_d: (pick(row, "option_d") || "").trim(),
    option_a_image_url: (pick(row, "option_a_image_url") || "").trim(),
    option_b_image_url: (pick(row, "option_b_image_url") || "").trim(),
    option_c_image_url: (pick(row, "option_c_image_url") || "").trim(),
    option_d_image_url: (pick(row, "option_d_image_url") || "").trim(),
    correct_option: (pick(row, "correct_option") || "").trim().toUpperCase(),
    explanation: (pick(row, "explanation") || "").trim() || null,
    difficulty: (pick(row, "difficulty") || "medium").trim().toLowerCase(),
  };
}

// Ensure uploads/<SUBJECT_CODE> exists
function ensureUploadsDirForSubject(subjectCode) {
  const base = path.join(__dirname, "..", "uploads");
  const dir = path.join(base, subjectCode);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function publicUrlFor(req, subjectCode, filename) {
  return `${req.protocol}://${req.get("host")}/uploads/${subjectCode}/${filename}`;
}

// overwrite policy w/ original filename kept
function writeSubjectImage(req, subjectCode, originalName, buf) {
  const safeName = path.basename(originalName).replace(/[^A-Za-z0-9._-]/g, "_");
  const dir = ensureUploadsDirForSubject(subjectCode);
  const full = path.join(dir, safeName);
  fs.writeFileSync(full, buf); // overwrite
  return publicUrlFor(req, subjectCode, safeName);
}

// --- Auto-detect CSV delimiter (',' or ';') ---
// Scans first ~10 non-empty lines and counts occurrences.
function autoDetectDelimiter(buffer) {
  const sample = buffer.toString("utf8").split(/\r?\n/).slice(0, 10).join("\n");
  const commaCount = (sample.match(/,/g) || []).length;
  const semiCount = (sample.match(/;/g) || []).length;
  // Prefer semicolon if more semicolons than commas, otherwise comma
  return semiCount > commaCount ? ";" : ",";
}

// -----------------------------------------------------
// POST /admin/questions/upload
// Form-Data: subject_id (int), file (CSV), images_zip (optional ZIP)
// -----------------------------------------------------
router.post(
  "/upload",
  auth,
  upload.fields([{ name: "file" }, { name: "images_zip" }]),
  async (req, res) => {
    try {
      if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }

      // subject_id required
      const subject_id = parseInt(String(req.body.subject_id || ""), 10);
      if (!subject_id) {
        return res.status(400).json({ message: "subject_id is required" });
      }

      // lookup subject code
      const s = await pool.query("SELECT code FROM subjects WHERE id = $1", [subject_id]);
      if (!s.rowCount) return res.status(400).json({ message: "Invalid subject_id" });
      const subjectCode = (s.rows[0].code || "").toUpperCase().trim();
      if (!subjectCode) return res.status(400).json({ message: "Subject has no code" });

      // CSV file
      const csvPart = req.files?.file?.[0];
      if (!csvPart) return res.status(400).json({ message: "CSV file is required (field: file)" });

      const isCsv =
        /text\/csv/i.test(csvPart.mimetype) ||
        /\.csv$/i.test(csvPart.originalname);
      if (!isCsv) {
        return res.status(400).json({ message: "Invalid CSV file type" });
      }

      // Parse CSV with auto delimiter + relaxed rules (silent fixes)
      let rows;
      try {
        const delimiter = autoDetectDelimiter(csvPart.buffer);
        rows = parse(csvPart.buffer, {
          columns: true,
          skip_empty_lines: true,
          bom: true,
          relax_quotes: true,
          relax_column_count: true,
          delimiter, // ',' or ';' detected from content
        });
      } catch (e) {
        return res.status(400).json({ message: "Failed to parse CSV" });
      }

      if (!Array.isArray(rows) || rows.length === 0) {
        return res.status(400).json({ message: "CSV is empty" });
      }
      if (rows.length > 5000) {
        return res.status(400).json({ message: "Row limit exceeded (max 5000 per upload)" });
      }

      // Validate headers (tolerant)
      const headerKeys = Object.keys(rows[0] || {});
      const missing = REQUIRED_HEADERS.filter(
        (h) => !headerKeys.some((k) => k.toLowerCase() === h.toLowerCase())
      );
      if (missing.length) {
        return res
          .status(400)
          .json({ message: `CSV missing required headers: ${missing.join(", ")}` });
      }

      // Optional images ZIP
      let zipMap = new Map();
      const zipPart = req.files?.images_zip?.[0];
      if (zipPart) {
        const isZip =
          /zip/i.test(zipPart.mimetype) || /\.zip$/i.test(zipPart.originalname);
        if (!isZip) {
          return res.status(400).json({ message: "images_zip is not a ZIP file" });
        }
        try {
          const zip = new AdmZip(zipPart.buffer);
          for (const entry of zip.getEntries()) {
            if (entry.isDirectory) continue;
            const fname = path.basename(entry.entryName);
            zipMap.set(fname.toLowerCase(), entry.getData()); // Buffer
          }
        } catch {
          return res.status(400).json({ message: "Failed to read ZIP file" });
        }
      }

      // Map filename -> URL (if in ZIP), keep http(s) URLs as-is
      const toUrl = (val) => {
        if (!val) return "";
        if (/^https?:\/\//i.test(val)) return val;
        const key = path.basename(val).toLowerCase();
        const buf = zipMap.get(key);
        if (!buf) return val; // not in ZIP; leave value as provided
        return writeSubjectImage(req, subjectCode, key, buf);
      };

      let inserted = 0;
      let skipped = 0;
      const errors = [];
      const values = [];

      rows.forEach((raw, i) => {
        const r = normalizeRow(raw);

        // resolve ZIP images to URLs (overwrite policy)
        r.stem_image_url = toUrl(r.stem_image_url);
        r.option_a_image_url = toUrl(r.option_a_image_url);
        r.option_b_image_url = toUrl(r.option_b_image_url);
        r.option_c_image_url = toUrl(r.option_c_image_url);
        r.option_d_image_url = toUrl(r.option_d_image_url);

        // validations
        const hasStem =
          (r.question && r.question.length) || (r.stem_image_url && r.stem_image_url.length);
        const correctOK = ["A", "B", "C", "D"].includes(r.correct_option);
        const difficultyOK = DIFF_OK.has(r.difficulty || "medium");

        const optAok = !!(r.option_a || r.option_a_image_url);
        const optBok = !!(r.option_b || r.option_b_image_url);
        const optCok = !!(r.option_c || r.option_c_image_url);
        const optDok = !!(r.option_d || r.option_d_image_url);
        const optionsOK = optAok && optBok && optCok && optDok;

        if (!hasStem || !correctOK || !optionsOK || !difficultyOK) {
          skipped++;
          errors.push({
            row: i + 2, // +1 header +1 base-1
            error: !hasStem
              ? "Missing question text or stem_image_url"
              : !correctOK
              ? "correct_option must be A/B/C/D"
              : !optionsOK
              ? "Each option must have text or image"
              : "difficulty must be easy|medium|hard",
          });
          return;
        }

        values.push([
          subject_id,
          r.question || null,
          r.stem_image_url || null,
          r.option_a || null,
          r.option_a_image_url || null,
          r.option_b || null,
          r.option_b_image_url || null,
          r.option_c || null,
          r.option_c_image_url || null,
          r.option_d || null,
          r.option_d_image_url || null,
          r.correct_option,
          r.explanation || null,
          r.difficulty || "medium",
        ]);
        inserted++;
      });

      if (!inserted) {
        return res.status(400).json({
          inserted: 0,
          skipped,
          errors,
          message: "No valid rows to insert",
        });
      }

      // batch insert (parameterized)
      const cols = `(subject_id, question, stem_image_url,
                     option_a, option_a_image_url,
                     option_b, option_b_image_url,
                     option_c, option_c_image_url,
                     option_d, option_d_image_url,
                     correct_option, explanation, difficulty)`;

      const flat = [];
      const placeholders = values
        .map((row, i) => {
          const base = i * row.length;
          row.forEach((v) => flat.push(v));
          const idxs = row.map((_, j) => `$${base + j + 1}`).join(",");
          return `(${idxs})`;
        })
        .join(",");

      const sql = `INSERT INTO questions ${cols} VALUES ${placeholders}`;
      await pool.query(sql, flat);

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

module.exports = router;
