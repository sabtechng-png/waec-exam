// routes/adminSubjectsRoutes.js
const express = require("express");
const router = express.Router();
const { pool } = require("../db");
const auth = require("../middleware/authMiddleware");

// -------------------------------
// Helpers
// -------------------------------
function normalizeCode(input) {
  if (!input) return null;
  // Trim, collapse spaces, keep A-Z 0-9 - _
  const cleaned = String(input)
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")            // remove spaces
    .replace(/[^A-Z0-9\-_]/g, "");  // keep only A–Z 0–9 - _
  return cleaned.length ? cleaned : null;
}

function mustBeAdmin(req, res) {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({ message: "Forbidden" });
    return true;
  }
  return false;
}

// -------------------------------
// GET /admin/subjects
// Return ALL subjects with code + status
// -------------------------------
router.get("/", auth, async (req, res) => {
  try {
    if (mustBeAdmin(req, res)) return;
    const q = await pool.query(
      "SELECT id, name, code, status FROM subjects ORDER BY name ASC"
    );
    res.json({ subjects: q.rows });
  } catch (err) {
    console.error("GET /admin/subjects error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------------------
// POST /admin/subjects
// Body: { name, code? , status? }
// code is OPTIONAL (you chose B previously).
// If provided, auto TRIM+UPPERCASE (choice A).
// -------------------------------
router.post("/", auth, async (req, res) => {
  try {
    if (mustBeAdmin(req, res)) return;

    const name = String(req.body?.name || "").trim();
    let code = normalizeCode(req.body?.code);
    const status =
      typeof req.body?.status === "boolean" ? req.body.status : true;

    if (!name) {
      return res.status(400).json({ message: "Subject name is required" });
    }

    const q = await pool.query(
      `INSERT INTO subjects (name, code, status)
       VALUES ($1, $2, $3)
       RETURNING id, name, code, status`,
      [name, code, status]
    );

    res.status(201).json({
      message: "Subject created",
      subject: q.rows[0],
    });
  } catch (err) {
    console.error("POST /admin/subjects error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------------------
// PUT /admin/subjects/:id
// Body: { name?, code?, status? }
// code optional; normalize if provided; allow longer codes.
// -------------------------------
router.put("/:id", auth, async (req, res) => {
  try {
    if (mustBeAdmin(req, res)) return;

    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ message: "Invalid subject id" });

    const name =
      typeof req.body?.name === "string" ? req.body.name.trim() : undefined;
    const code =
      req.body?.code === undefined ? undefined : normalizeCode(req.body.code);
    const status =
      typeof req.body?.status === "boolean" ? req.body.status : undefined;

    // Build dynamic update
    const sets = [];
    const vals = [];
    let idx = 1;

    if (name !== undefined) {
      if (!name) return res.status(400).json({ message: "Name cannot be empty" });
      sets.push(`name = $${idx++}`);
      vals.push(name);
    }
    if (code !== undefined) {
      sets.push(`code = $${idx++}`); // may be NULL
      vals.push(code);
    }
    if (status !== undefined) {
      sets.push(`status = $${idx++}`);
      vals.push(status);
    }

    if (!sets.length) {
      return res.status(400).json({ message: "No fields to update" });
    }

    vals.push(id);
    const q = await pool.query(
      `UPDATE subjects SET ${sets.join(", ")} WHERE id = $${idx}
       RETURNING id, name, code, status`,
      vals
    );

    if (!q.rowCount) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.json({ message: "Subject updated", subject: q.rows[0] });
  } catch (err) {
    console.error("PUT /admin/subjects/:id error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------------------
// PATCH /admin/subjects/:id/toggle
// Flip status only (row remains in list).
// -------------------------------
router.patch("/:id/toggle", auth, async (req, res) => {
  try {
    if (mustBeAdmin(req, res)) return;

    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ message: "Invalid subject id" });

    const q = await pool.query(
      `UPDATE subjects
         SET status = NOT COALESCE(status, TRUE)
       WHERE id = $1
       RETURNING id, name, code, status`,
      [id]
    );

    if (!q.rowCount) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.json({ message: "Status toggled", subject: q.rows[0] });
  } catch (err) {
    console.error("PATCH /admin/subjects/:id/toggle error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------------------
// DELETE /admin/subjects/:id
// -------------------------------
router.delete("/:id", auth, async (req, res) => {
  try {
    if (mustBeAdmin(req, res)) return;

    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ message: "Invalid subject id" });

    const q = await pool.query("DELETE FROM subjects WHERE id = $1", [id]);

    if (!q.rowCount) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.json({ message: "Subject deleted" });
  } catch (err) {
    console.error("DELETE /admin/subjects/:id error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
