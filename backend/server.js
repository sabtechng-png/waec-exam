// =======================================================
// 🌍 SERVER SETUP — CLEAN, ORGANIZED & PRODUCTION READY
// =======================================================

// Always load environment variables FIRST
process.env.TZ = "UTC";
require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");


const app = express();


// =======================================================
// 🛠 CRON JOB — AUTO DELETE UNVERIFIED ACCOUNTS
// =======================================================
const cleanupUnverifiedUsers = require("./cron/cleanupUnverified");

// Run cleanup once every 24 hours
setInterval(() => {
  console.log("⏳ Running daily cleanup for unverified accounts...");
  cleanupUnverifiedUsers();
}, 24 * 60 * 60 * 1000);

// Run immediately on startup
cleanupUnverifiedUsers();

// =======================================================
// 🌐 GLOBAL MIDDLEWARE
// =======================================================
app.use(cors({
  //origin: "http://localhost:3000",
origin: 'http://localhost:3000' || 'https://cbt-master.com.ng',  // Adjust to your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.use(express.json());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));



// =======================================================
// 📌 ADMIN ROUTES
// =======================================================
const adminDashboardRoutes = require("./routes/adminDashboardRoutes");
const adminAnalyticsRoutes = require("./routes/adminAnalyticsRoutes");
app.use("/admin/dashboard", adminDashboardRoutes);
app.use("/admin/analytics", adminAnalyticsRoutes);

app.use("/admin/users", require("./routes/adminUsersRoutes"));
app.use("/landing", require("./routes/landingRoutes"));
app.use("/admin/subjects", require("./routes/adminSubjectsRoutes"));
app.use("/admin/uploads", require("./routes/adminUploadsRoutes"));
app.use("/admin/questions", require("./routes/adminQuestionsRoutes"));
app.use("/leaderboard", require("./routes/exam/leaderboardRoutes"));
app.use("/user", require("./routes/user/updateProfile"));
app.use("/contact", require("./routes/contactRoutes"));

// =======================================================
// 🎓 STUDENT ROUTES
// =======================================================
app.use("/api/student/subjects", require("./routes/studentSubjectsRoutes"));
app.use("/api/student/sessions", require("./routes/studentSessionRoutes"));
app.use("/student/results", require("./routes/studentResultsRoutes"));
app.use("/dashboard", require("./routes/dashboardRoutes"));


// Public subjects (homepage)
app.use("/public", require("./routes/publicSubjectRoutes"));

// =======================================================
// 🧩 EXAM ROUTES
// =======================================================
app.use("/exam", require("./routes/exam/examRoutes"));

// =======================================================
// 🔐 AUTH ROUTES
// =======================================================
app.use("/auth", require("./routes/authRoutes"));
app.use("/auth", require("./routes/passwordResetRoutes")); // added reset system

// =======================================================
// 🚀 START SERVER
// =======================================================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT} (UTC timezone enforced)`)
);
