// =====================================
// 🚀 Optimized PostgreSQL Connection
// =====================================

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false, // Needed for Render/NeonDB SSL
  },
  max: 20,        // More pooled connections for faster queries
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Graceful handling of connection errors
pool.on("error", (err) => {
  console.error("🔴 Unexpected PostgreSQL idle client error", err);
});

module.exports = { pool };
