// ============================
// 🌍 HIGH-PERFORMANCE SERVER SETUP
// ============================

process.env.TZ = "UTC";
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const path = require("path");
const { pool } = require("./db");

const cleanupUnverifiedUsers = require("./cron/cleanupUnverified");
const englishAdminRoutes = require("./routes/admin/englishAdminRoutes");

// PASSWORD RESET (Load FIRST before /auth)
const passwordResetRoutes = require("./routes/auth/passwordResetRoutes");

const app = express();

// ============================
// ⚡ SERVER WARM-UP
// ============================

(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("🟢 Database connection warmed up");
  } catch (err) {
    console.error("🔴 DB warm-up failed:", err);
  }
})();

cleanupUnverifiedUsers();
setInterval(cleanupUnverifiedUsers, 24 * 60 * 60 * 1000);

// ============================
// 🌐 CORS CONFIG
// ============================

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:4000",
      "https://cbt-master.com.ng",
      "https://www.cbt-master.com.ng",
      "https://waec-frontend.onrender.com"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ============================
// SECURITY + PERFORMANCE
// ============================

app.use(helmet());
app.use(compression());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ============================
// 🔐 PASSWORD ROUTES (LOAD FIRST)
// ============================

app.use("/password", passwordResetRoutes);

// ============================
// 🔐 AUTH ROUTES
// ============================

app.use("/auth", require("./routes/authRoutes"));
app.use("/auth/google", require("./routes/authGoogleRoutes"));

// ============================
// 👤 USER PROFILE ROUTES
// ============================
app.use("/user", require("./routes/user/updateProfile"));

// ============================
// 📌 ADMIN ROUTES
// ============================

app.use("/admin/dashboard", require("./routes/adminDashboardRoutes"));
app.use("/admin/analytics", require("./routes/adminAnalyticsRoutes"));
app.use("/admin/users", require("./routes/adminUsersRoutes"));
app.use("/landing", require("./routes/landingRoutes"));
app.use("/admin/subjects", require("./routes/adminSubjectsRoutes"));
app.use("/admin/uploads", require("./routes/adminUploadsRoutes"));
app.use("/admin/questions", require("./routes/questionsManageRoutes"));
app.use("/admin/questions", require("./routes/questionsUploadRoutes"));
app.use("/admin/questions", require("./routes/questionsBulkOpsRoutes"));
app.use("/admin/english", englishAdminRoutes);

// ============================
// 🎓 STUDENT ROUTES
// ============================

app.use("/api/student/subjects", require("./routes/studentSubjectsRoutes"));
app.use("/api/student/sessions", require("./routes/studentSessionRoutes"));
app.use("/student/results", require("./routes/studentResultsRoutes"));
app.use("/dashboard", require("./routes/dashboardRoutes"));
app.use("/leaderboard/my-rank", require("./routes/leaderboard/myRankRoutes"));
app.use("/leaderboard", require("./routes/leaderboard/leaderboardRoutes"));

app.use("/public", require("./routes/publicSubjectRoutes"));
app.use("/public/exam", require("./routes/publicExamRoutes"));

// ============================
// 🧪 EXAM ROUTES
// ============================

app.use("/exam", require("./routes/exam/examRoutes"));

// ============================
// 📝 ENGLISH EXAM ROUTES
// ============================

app.use("/english-exam", require("./routes/exam/english/englishStartRoutes"));
app.use("/english-exam", require("./routes/exam/english/englishQuestionRoutes"));
app.use("/english-exam", require("./routes/exam/english/englishAnswerRoutes"));
app.use("/english-exam", require("./routes/exam/english/englishSubmitRoutes"));
app.use("/english-exam", require("./routes/exam/english/englishLoadRoutes"));

// ============================
// 🚀 START SERVER
// ============================

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} (UTC timezone enforced)`);
});
