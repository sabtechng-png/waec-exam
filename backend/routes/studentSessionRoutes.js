// ======================================================
// 📘 studentSessionRoutes.js — FINAL (Batch Session Logic)
// ======================================================
//
// Endpoints:
//   POST /api/student/sessions/register  → Register 5–9 subjects as a batch
//   GET  /api/student/sessions           → Get all past session batches
//   GET  /api/student/sessions/active    → Get current active batch subjects
//
// Each session is independent of single-mode subjects.
// ======================================================

const express = require("express");
const router = express.Router();
const { pool } = require("../db");
const auth = require("../middleware/authMiddleware");

// Helper
function fail(res, code, message) {
  return res.status(code).json({ message });
}

// ======================================================
// 1️⃣ REGISTER NEW SESSION (Batch 5–9 Subjects)
// ======================================================
router.post("/register", auth, async (req, res) => {
  const studentId = req.user.userId;
  const { subject_ids } = req.body || {};

  if (!Array.isArray(subject_ids) || subject_ids.length < 5 || subject_ids.length > 9)
    return fail(res, 400, "Select between 5 and 9 subjects for a session.");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 🚫 Prevent overlapping active session
    const active = await client.query(
      `SELECT id FROM student_sessions
        WHERE student_id=$1 AND status='active' LIMIT 1`,
      [studentId]
    );
    if (active.rowCount) {
      await client.query("ROLLBACK");
      return fail(res, 400, "Finish or reset your active session first.");
    }

    // ✅ Create session record
    const ses = await client.query(
      `INSERT INTO student_sessions (student_id, status, created_at)
       VALUES ($1, 'active', NOW()) RETURNING id`,
      [studentId]
    );
    const sessionId = ses.rows[0].id;

    // ✅ Insert subjects for this session
    await client.query(
      `INSERT INTO student_subjects (student_id, subject_id, mode, status, session_id, archived)
       SELECT $1, sid, 'session', 'pending', $2, FALSE
       FROM UNNEST($3::int[]) AS sid`,
      [studentId, sessionId, subject_ids]
    );

    await client.query("COMMIT");
    res.json({ message: "Session registered successfully.", session_id: sessionId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Error registering session:", err.message);
    res.status(500).json({ message: "Error registering session" });
  } finally {
    client.release();
  }
});

// ======================================================
// 2️⃣ GET ALL SESSION HISTORY (Past Batches)
// ======================================================
router.get("/", auth, async (req, res) => {
  const studentId = req.user.userId;
  try {
    const result = await pool.query(
      `SELECT ss.id AS session_id,
              ss.status AS session_status,
              ss.created_at,
              json_agg(
                json_build_object(
                  'subject_id', ssub.subject_id,
                  'status', ssub.status
                )
                ORDER BY ssub.subject_id
              ) AS subjects
         FROM student_sessions ss
         LEFT JOIN student_subjects ssub ON ssub.session_id = ss.id
        WHERE ss.student_id=$1
        GROUP BY ss.id
        ORDER BY ss.created_at DESC`,
      [studentId]
    );
    res.json({ sessions: result.rows });
  } catch (err) {
    console.error("❌ Error fetching sessions:", err.message);
    res.status(500).json({ message: "Error fetching session history" });
  }
});

// ======================================================
// 3️⃣ GET ACTIVE SESSION SUBJECTS (Current Batch)
// ======================================================
router.get("/active", auth, async (req, res) => {
  const studentId = req.user.userId;
  try {
    const result = await pool.query(
      `SELECT ssub.id AS student_subject_id,
              subj.id AS subject_id,
              subj.name AS subject_name,
              subj.code AS subject_code,
              ssub.status,
              ss.id AS session_id,
              ss.created_at
         FROM student_subjects ssub
         JOIN subjects subj ON subj.id = ssub.subject_id
         JOIN student_sessions ss ON ss.id = ssub.session_id
        WHERE ssub.student_id = $1
          AND ssub.archived = FALSE
          AND ss.status = 'active'
        ORDER BY subj.name ASC`,
      [studentId]
    );

    if (!result.rowCount)
      return res.json({ active: [], message: "No active session found." });

    res.json({ active: result.rows });
  } catch (err) {
    console.error("❌ Error fetching active session subjects:", err.message);
    res.status(500).json({ message: "Error fetching active session subjects" });
  }
});


// ======================================================
// 4️⃣ RESET ACTIVE SESSION — Keep completed, cancel pending
// ======================================================
router.post("/reset", auth, async (req, res) => {
  const studentId = req.user.userId;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Find active session
    const active = await client.query(
      `SELECT id FROM student_sessions
        WHERE student_id=$1 AND status='active' LIMIT 1`,
      [studentId]
    );

    if (!active.rowCount) {
      await client.query("ROLLBACK");
      return fail(res, 404, "No active session to reset.");
    }

    const sessionId = active.rows[0].id;

    // Check if any subject in progress
    const inProgress = await client.query(
      `SELECT COUNT(*) AS c FROM student_subjects
         WHERE session_id=$1 AND status='in_progress' AND archived=FALSE`,
      [sessionId]
    );

    if (Number(inProgress.rows[0].c) > 0) {
      await client.query("ROLLBACK");
      return fail(res, 400, "Cannot reset while an exam is in progress. Submit first.");
    }

    // 🧮 Cancel all pending/unattempted subjects
    await client.query(
      `UPDATE student_subjects
          SET status='cancelled', archived=TRUE
        WHERE session_id=$1 AND status IN ('pending')
          AND archived=FALSE`,
      [sessionId]
    );

    // ✅ Keep completed subjects (preserve score, archived=FALSE)
    //    Nothing to update here; they stay as historical results.

    // ✅ Close session
    await client.query(
      `UPDATE student_sessions
          SET status='archived', finished_at=NOW()
        WHERE id=$1`,
      [sessionId]
    );

    await client.query("COMMIT");
    res.json({ message: "Session reset successfully. Completed subjects kept; pending cancelled." });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Reset session error:", err.message);
    res.status(500).json({ message: "Error resetting session" });
  } finally {
    client.release();
  }
});

module.exports = router;
