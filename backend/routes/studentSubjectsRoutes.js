// ===============================================
// routes/studentSubjectsRoutes.js — FULL VERSION
// ===============================================
const express = require("express");
const router = express.Router();
const { pool } = require("../db");
const auth = require("../middleware/authMiddleware");

// -----------------------------------------------
// GET /api/student/subjects
// Returns all catalog subjects with student's
// registration status + counts summary
// registered_status ∈ { 'none', 'pending', 'in_progress', 'completed' }
// -----------------------------------------------
// -----------------------------------------------
// ✅ FIXED: GET /api/student/subjects
// -----------------------------------------------
router.get("/", auth, async (req, res) => {
  const studentId = req.user.userId;

  try {
    const result = await pool.query(
      `WITH latest_status AS (
          SELECT DISTINCT ON (subject_id)
              subject_id,
              status,
              archived,
              finished_at,
              created_at
          FROM student_subjects
          WHERE student_id = $1
          ORDER BY subject_id, created_at DESC
      )
      SELECT 
          s.id AS subject_id,
          s.name,
          s.code,
          CASE
              WHEN ls.archived IS TRUE THEN 'none'
              WHEN ls.status IS NULL THEN 'none'
              ELSE ls.status
          END AS registered_status,
          COALESCE(ls.archived, FALSE) AS archived,
          ls.finished_at,
          ls.created_at
      FROM subjects s
      LEFT JOIN latest_status ls
        ON s.id = ls.subject_id
      ORDER BY s.name ASC;`,
      [studentId]
    );

    const subjects = result.rows.map((r) => ({
      subject_id: r.subject_id,
      name: r.name,
      code: r.code,
      registered_status: r.registered_status,
      archived: r.archived,
      finished_at: r.finished_at,
      created_at: r.created_at,
    }));

    // summary counts
    const pending = subjects.filter((s) => s.registered_status === "pending").length;
    const in_progress = subjects.filter((s) => s.registered_status === "in_progress").length;
    const completed = subjects.filter((s) => s.registered_status === "completed").length;

    res.json({
      subjects,
      summary: {
        total: subjects.length,
        pending,
        in_progress,
        completed,
      },
    });
  } catch (err) {
    console.error("❌ Error fetching subjects:", err);
    res.status(500).json({ message: "Error fetching subjects" });
  }
});

// -----------------------------------------------------
// 📘 REGISTER SUBJECT
// -----------------------------------------------------
router.post("/register", auth, async (req, res) => {
  const studentId = req.user.userId;
  const { subject_id } = req.body;

  if (!subject_id) {
    return res.status(400).json({ message: "subject_id is required" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 🔍 Check if there’s any existing record for this student & subject
    const existing = await client.query(
      `SELECT id, status, archived 
         FROM student_subjects
        WHERE student_id=$1 AND subject_id=$2
          AND archived=FALSE
        ORDER BY created_at DESC
        LIMIT 1`,
      [studentId, subject_id]
    );

    // 🚫 If already registered or in progress, block registration
    if (
      existing.rowCount &&
      ["pending", "in_progress", "registered"].includes(existing.rows[0].status)
    ) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ message: "Subject already registered or in progress." });
    }

    // ✅ If the last record was completed, archive it before re-registration
    if (existing.rowCount && existing.rows[0].status === "completed") {
      await client.query(
        `UPDATE student_subjects SET archived=TRUE WHERE id=$1`,
        [existing.rows[0].id]
      );
    }

    // 🟢 Insert a fresh registration record
    await client.query(
      `INSERT INTO student_subjects (student_id, subject_id, status, archived, created_at)
       VALUES ($1, $2, 'pending', FALSE, NOW())`,
      [studentId, subject_id]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Subject registered successfully.",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error registering subject:", error);
    return res.status(500).json({ message: "Failed to register subject." });
  } finally {
    client.release();
  }
});

// -----------------------------------------------------
// 🔴 CLEAR / RESET SUBJECT
// -----------------------------------------------------
router.post("/reset", auth, async (req, res) => {
  const studentId = req.user.userId;
  const { subject_id } = req.body;

  if (!subject_id) {
    return res.status(400).json({ message: "subject_id is required" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 🔍 Check if subject registration exists and is active
    const reg = await client.query(
      `SELECT id, status 
         FROM student_subjects
        WHERE student_id=$1 AND subject_id=$2
          AND archived=FALSE
        ORDER BY created_at DESC
        LIMIT 1`,
      [studentId, subject_id]
    );

    if (!reg.rowCount) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ message: "No active registration found for this subject." });
    }

    const { id: regId, status } = reg.rows[0];

    // 🚫 Block reset for completed or in_progress subjects
    if (status === "completed" || status === "in_progress") {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ message: "Cannot clear a completed or ongoing subject." });
    }

    // ✅ Archive the subject (mark inactive)
    await client.query(`UPDATE student_subjects SET archived=TRUE WHERE id=$1`, [regId]);

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Subject cleared successfully. You can now re-register.",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error resetting subject:", error);
    return res.status(500).json({ message: "Failed to clear subject." });
  } finally {
    client.release();
  }
});


module.exports = router;
