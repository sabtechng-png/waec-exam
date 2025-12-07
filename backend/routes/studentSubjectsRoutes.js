// ===============================================
// routes/studentSubjectsRoutes.js — FINAL VERSION
// Hard-delete mode (No archived column logic)
// ===============================================
const express = require("express");
const router = express.Router();
const { pool } = require("../db");
const auth = require("../middleware/authMiddleware");

// --------------------------------------------------------
// GET /api/student/subjects
// Returns subjects + registration status for student
// registered_status ∈ { 'none', 'registered', 'in_progress', 'completed' }
// --------------------------------------------------------
// --------------------------------------------------------
// GET /api/student/subjects   (FILTER DISABLED SUBJECTS)
// Returns only ACTIVE subjects for the student
// --------------------------------------------------------
router.get("/", auth, async (req, res) => {
  const studentId = req.user.userId;

  try {
    const result = await pool.query(
      `
      WITH latest_status AS (
          SELECT DISTINCT ON (subject_id)
              subject_id,
              status,
              created_at,
              finished_at
          FROM student_subjects
          WHERE student_id = $1
          ORDER BY subject_id, created_at DESC
      )
      SELECT 
          s.id AS subject_id,
          s.name,
          s.code,
          COALESCE(ls.status, 'none') AS registered_status,
          ls.finished_at,
          ls.created_at
      FROM subjects s
      LEFT JOIN latest_status ls
        ON s.id = ls.subject_id
      WHERE s.status = TRUE             -- ✅ IMPORTANT FILTER
      ORDER BY s.name ASC;
      `,
      [studentId]
    );

    const subjects = result.rows.map((r) => ({
      subject_id: r.subject_id,
      name: r.name,
      code: r.code,
      registered_status: r.registered_status,
      finished_at: r.finished_at,
      created_at: r.created_at,
    }));

    // Summary counts
    const registered = subjects.filter(
      (s) => s.registered_status === "registered"
    ).length;

    const in_progress = subjects.filter(
      (s) => s.registered_status === "in_progress"
    ).length;

    const completed = subjects.filter(
      (s) => s.registered_status === "completed"
    ).length;

    res.json({
      subjects,
      summary: {
        total: subjects.length,
        registered,
        in_progress,
        completed,
      },
    });
  } catch (err) {
    console.error("❌ Error fetching subjects:", err);
    res.status(500).json({ message: "Error fetching subjects" });
  }
});

// --------------------------------------------------------
// REGISTER SUBJECT (clean mode)
// --------------------------------------------------------
router.post("/register", auth, async (req, res) => {
  const studentId = req.user.userId;
  const { subject_id } = req.body;

  if (!subject_id) {
    return res.status(400).json({ message: "subject_id is required" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check if subject exists for this student
    const existing = await client.query(
      `SELECT id, status 
       FROM student_subjects
       WHERE student_id=$1 AND subject_id=$2
       ORDER BY created_at DESC
       LIMIT 1`,
      [studentId, subject_id]
    );

    if (existing.rowCount) {
      const curr = existing.rows[0];

      // ❌ Block if already registered or exam in progress
      if (curr.status === "registered" || curr.status === "in_progress") {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: "Subject already registered or exam in progress.",
        });
      }

      // 🧹 If previous attempt was completed → delete old record
      if (curr.status === "completed") {
        await client.query(
          `DELETE FROM student_subjects WHERE id=$1`,
          [curr.id]
        );
      }
    }

    // 🟢 Create new fresh registration
    await client.query(
      `INSERT INTO student_subjects (student_id, subject_id, status, created_at)
       VALUES ($1, $2, 'registered', NOW())`,
      [studentId, subject_id]
    );

    await client.query("COMMIT");
    return res.status(200).json({
      success: true,
      message: "Subject registered successfully.",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error registering subject:", error);
    return res.status(500).json({ message: "Failed to register subject." });
  } finally {
    client.release();
  }
});

// --------------------------------------------------------
// CLEAR SUBJECT (Hard Delete Mode)
// --------------------------------------------------------
router.post("/reset", auth, async (req, res) => {
  const studentId = req.user.userId;
  const { subject_id } = req.body;

  if (!subject_id) {
    return res.status(400).json({ message: "subject_id is required" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const reg = await client.query(
      `SELECT id, status 
       FROM student_subjects
       WHERE student_id=$1 AND subject_id=$2
       ORDER BY created_at DESC
       LIMIT 1`,
      [studentId, subject_id]
    );

    // Nothing to clear
    if (!reg.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: "No active registration found for this subject.",
      });
    }

    const { id: regId, status } = reg.rows[0];

    // ❌ Block clearing when exam is in progress
    if (status === "in_progress") {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Cannot clear subject while exam is in progress.",
      });
    }

    // ❌ Block clearing after completion unless you want retakes
    if (status === "completed") {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Cannot clear a completed subject. (Use retake by re-registering)",
      });
    }

    // 🟢 HARD DELETE
    await client.query(
      `DELETE FROM student_subjects WHERE id=$1`,
      [regId]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Subject cleared successfully.",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error clearing subject:", error);
    return res.status(500).json({ message: "Failed to clear subject." });
  } finally {
    client.release();
  }
});

module.exports = router;
