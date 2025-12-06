// =========================================================
// db.js — Using Destructuring-Friendly Export { pool }
// =========================================================

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false, // NeonDB / Render requirement
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Connection warm-up
pool.on("connect", () => {
  console.log("Database connection warmed up");
});

module.exports = { pool };   // ⬅⬅⬅ ENABLES: const { pool } = require("../db");
