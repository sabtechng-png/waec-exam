// ============================
// 🌍 SIMPLE SERVER SETUP
// ============================

process.env.TZ = "UTC";
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

// ============================
// 🛠 AUTO DELETE UNVERIFIED USERS
// ============================
const cleanupUnverifiedUsers = require("./cron/cleanupUnverified");

// run once daily
setInterval(cleanupUnverifiedUsers, 24 * 60 * 60 * 1000);

// run on startup
cleanupUnverifiedUsers();

// ============================
// 🌐 CORS (VERY SIMPLE + CORRECT)
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
// 📦 MIDDLEWARE
// ============================
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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

// ============================
// 🎓 STUDENT ROUTES
// ============================
app.use("/api/student/subjects", require("./routes/studentSubjectsRoutes"));
app.use("/api/student/sessions", require("./routes/studentSessionRoutes"));
app.use("/student/results", require("./routes/studentResultsRoutes"));
app.use("/dashboard", require("./routes/dashboardRoutes"));

// Public homepage subjects
app.use("/public", require("./routes/publicSubjectRoutes"));

// ============================
// 🧪 EXAM ROUTES
// ============================
app.use("/exam", require("./routes/exam/examRoutes"));

// ============================
// 🔐 AUTH ROUTES
// ============================
app.use("/auth", require("./routes/authRoutes"));
app.use("/auth", require("./routes/passwordResetRoutes"));
app.use("/auth/google", require("./routes/authGoogleRoutes"));


// ============================
// 🚀 START SERVER
// ============================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} (UTC timezone enforced)`);
});
