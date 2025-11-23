// routes/adminUsersRoutes.js
const express = require("express");
const router = express.Router();
const { pool } = require("../db");
const auth = require("../middleware/authMiddleware");

// Admin-only guard
function mustBeAdmin(req, res) {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({ message: "Forbidden — Admin Only" });
    return true;
  }
  return false;
}

// ============================================================
// 🟢 GET ALL USERS (with search + filtering)
// ============================================================
router.get("/", auth, async (req, res) => {
  if (mustBeAdmin(req, res)) return;

  const { search = "", role = "", status = "" } = req.query;

  try {
    let query = `
      SELECT id, full_name, email, role, status, created_at
      FROM users
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (full_name ILIKE $${params.length} OR email ILIKE $${params.length})`;
    }
    if (role) {
      params.push(role);
      query += ` AND role = $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC`;

    const users = await pool.query(query, params);

    res.json({ users: users.rows });
  } catch (err) {
    console.error("ADMIN USERS ERROR:", err);
    res.status(500).json({ message: "Failed to load users" });
  }
});

// ============================================================
// 🟡 GET SINGLE USER DETAILS
// ============================================================
router.get("/:id", auth, async (req, res) => {
  if (mustBeAdmin(req, res)) return;

  try {
    const user = await pool.query(
      `SELECT id, full_name, email, role, status, created_at
       FROM users WHERE id=$1 LIMIT 1`,
      [req.params.id]
    );
    if (!user.rowCount) return res.status(404).json({ message: "User not found" });

    res.json(user.rows[0]);
  } catch (err) {
    console.error("GET USER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================================================
// 🔵 UPDATE ROLE (promote/demote admin)
// ============================================================
router.patch("/:id/role", auth, async (req, res) => {
  if (mustBeAdmin(req, res)) return;

  const { role } = req.body;
  if (!role) return res.status(400).json({ message: "role is required" });

  try {
    await pool.query(`UPDATE users SET role=$1 WHERE id=$2`, [role, req.params.id]);
    res.json({ message: "Role updated" });
  } catch (err) {
    console.error("UPDATE ROLE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================================================
// 🟠 UPDATE STATUS (activate / deactivate user)
// ============================================================
router.patch("/:id/status", auth, async (req, res) => {
  if (mustBeAdmin(req, res)) return;

  const { status } = req.body;
  if (!status) return res.status(400).json({ message: "status is required" });

  try {
    await pool.query(`UPDATE users SET status=$1 WHERE id=$2`, [
      status,
      req.params.id,
    ]);
    res.json({ message: "Status updated" });
  } catch (err) {
    console.error("UPDATE STATUS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================================================
// 🔴 SOFT DELETE USER
// ============================================================
router.delete("/:id", auth, async (req, res) => {
  if (mustBeAdmin(req, res)) return;

  try {
    await pool.query(`UPDATE users SET status='deleted' WHERE id=$1`, [
      req.params.id,
    ]);
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================================================
// 🟣 ADMIN TRIGGER PASSWORD RESET (force reset)
// ============================================================
router.post("/:id/reset-password", auth, async (req, res) => {
  if (mustBeAdmin(req, res)) return;

  try {
    // Assign a simple temporary password
    const tempPass = "Temp12345";

    await pool.query(
      `UPDATE users SET password=$1 WHERE id=$2`,
      [tempPass, req.params.id]
    );

    res.json({
      message: "Temporary password applied",
      tempPassword: tempPass,
    });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
