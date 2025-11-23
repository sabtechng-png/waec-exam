// backend/cron/cleanupUnverified.js
const { pool } = require("../db");

async function cleanupUnverifiedUsers() {
  try {
    const result = await pool.query(
      `DELETE FROM users
       WHERE is_verified = false
       AND created_at < NOW() - INTERVAL '24 hours'
       RETURNING email`
    );

    if (result.rowCount > 0) {
      console.log("🗑 Deleted unverified accounts:", result.rows);
    } else {
      console.log("🗑 No unverified accounts to delete today.");
    }
  } catch (err) {
    console.error("Cleanup job error:", err);
  }
}

module.exports = cleanupUnverifiedUsers;
