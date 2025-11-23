// routes/studentResultsRoutes.js
const express = require("express");
const router = express.Router();
const { pool } = require("../db");
const auth = require("../middleware/authMiddleware");

// 🧩 Middleware to ensure user is student (or admin viewing as student)
function mustBeStudent(req, res) {
  if (!req.user || (req.user.role !== "student" && req.user.role !== "admin")) {
    res.status(403).json({ message: "Forbidden — student access only" });
    return true;
  }
  return false;
}

/**
 * ============================================================
 *  GET /student/results
 *  ------------------------------------------------------------
 *  Returns all subjects attempted by the student with:
 *   - subject_id, subject_name
 *   - attempts count
 *   - latest result
 *   - best result
 *   - current status (not_started, in_progress, completed)
 * ============================================================
 */
router.get("/", auth, async (req, res) => {
  if (mustBeStudent(req, res)) return;
  const studentId = req.user.userId;

  try {
    const query = `
      WITH registered AS (
        SELECT DISTINCT ss.subject_id
        FROM student_subjects ss
        WHERE ss.student_id = $1
      )
      SELECT
        s.id AS subject_id,
        s.name AS subject_name,
        COALESCE(es_count.cnt, 0) AS attempts,
        COALESCE(es_prog.has_in_progress, false) AS has_in_progress,

        -- latest exam
        lat.id AS latest_exam_id,
        lat.score AS latest_score,
        lat.total AS latest_total,
        lat.submitted_at AS latest_date,

        -- best exam
        best.id AS best_exam_id,
        best.score AS best_score,
        best.total AS best_total,
        best.submitted_at AS best_date

      FROM registered r
      JOIN subjects s ON s.id = r.subject_id

      LEFT JOIN LATERAL (
        SELECT COUNT(*)::int AS cnt
        FROM exam_sessions es
        WHERE es.student_id = $1
          AND es.subject_id = s.id
          AND es.status = 'submitted'
      ) es_count ON TRUE

      LEFT JOIN LATERAL (
        SELECT EXISTS (
          SELECT 1 FROM exam_sessions es
          WHERE es.student_id = $1
            AND es.subject_id = s.id
            AND es.status = 'in_progress'
        ) AS has_in_progress
      ) es_prog ON TRUE

      LEFT JOIN LATERAL (
        SELECT es.id, es.score, es.total, es.submitted_at
        FROM exam_sessions es
        WHERE es.student_id = $1
          AND es.subject_id = s.id
          AND es.status = 'submitted'
        ORDER BY es.submitted_at DESC NULLS LAST, es.id DESC
        LIMIT 1
      ) lat ON TRUE

      LEFT JOIN LATERAL (
        SELECT es.id, es.score, es.total, es.submitted_at
        FROM exam_sessions es
        WHERE es.student_id = $1
          AND es.subject_id = s.id
          AND es.status = 'submitted'
        ORDER BY es.score DESC NULLS LAST, es.submitted_at DESC NULLS LAST, es.id DESC
        LIMIT 1
      ) best ON TRUE

      ORDER BY s.name ASC;
    `;

    const { rows } = await pool.query(query, [studentId]);

    const results = rows.map((r) => {
      let status = "not_started";
      if (r.has_in_progress) status = "in_progress";
      else if (r.attempts > 0) status = "completed";

      const latest = r.latest_exam_id
        ? {
            exam_id: r.latest_exam_id,
            score: r.latest_score,
            total: r.latest_total,
            date: r.latest_date,
          }
        : null;

      const best = r.best_exam_id
        ? {
            exam_id: r.best_exam_id,
            score: r.best_score,
            total: r.best_total,
            date: r.best_date,
          }
        : null;

      return {
        subject_id: r.subject_id,
        subject_name: r.subject_name,
        attempts: r.attempts,
        status,
        latest,
        best,
      };
    });

    res.json({ results });
  } catch (err) {
    console.error("❌ /student/results error:", err);
    res.status(500).json({ message: "Server error while fetching student results." });
  }
});

/**
 * ============================================================
 *  GET /student/results/trends
 *  ------------------------------------------------------------
 *  Returns subject-wise performance history over time
 *  for chart visualization (score vs. date)
 * ============================================================
 */
router.get("/trends", auth, async (req, res) => {
  if (mustBeStudent(req, res)) return;
  const studentId = req.user.userId;

  try {
    const query = `
      SELECT
        s.name AS subject_name,
        es.score,
        es.submitted_at
      FROM exam_sessions es
      JOIN subjects s ON s.id = es.subject_id
      WHERE es.student_id = $1
        AND es.status = 'submitted'
      ORDER BY s.name ASC, es.submitted_at ASC;
    `;
    const { rows } = await pool.query(query, [studentId]);

    // Group by subject for easy chart plotting
    const grouped = rows.reduce((acc, row) => {
      if (!acc[row.subject_name]) acc[row.subject_name] = [];
      acc[row.subject_name].push({
        score: row.score,
        date: row.submitted_at,
      });
      return acc;
    }, {});

    res.json({ trends: grouped });
  } catch (err) {
    console.error("❌ /student/results/trends error:", err);
    res.status(500).json({ message: "Failed to load trend data." });
  }
});

module.exports = router;
