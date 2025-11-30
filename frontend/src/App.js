// ===============================
// File: src/App.js (Refined)
// ===============================

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ---------- Public Pages ----------
import LandingPage from "./pages/LandingPage";
import BlogPage from "./pages/BlogPage";
import BlogArticlePage from "./pages/BlogArticlePage";
import WAECPage from "./pages/WaecPage";
import JAMBPage from "./pages/JAMBPage";
import NECOPage from "./pages/NECOPage";
import CookieConsent from "./components/CookieConsent";

import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";

import AboutPage from "./pages/AboutPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import ContactPage from "./pages/ContactPage";
import FAQPage from "./pages/FAQPage";
import ResetPasswordSuccess from "./pages/ResetPasswordSuccess";

// ---------- Layouts ----------
import DashboardLayout from "./layout/DashboardLayout";
import AdminLayout from "./layout/AdminLayout";
import TermsPage from "./pages/TermsPage";
import ForgotPassword from "./pages/ForgotPassword";
import EmailVerificationNotice from "./pages/EmailVerificationNotice";
import RegistrationSuccess from "./pages/RegistrationSuccess";

// ---------- Dashboard Pages ----------
import DashboardPage from "./pages/dashboard/DashboardPage";
import StudentResultsPage from "./pages/dashboard/StudentResultsPage";
import StudentSubjectsPage from "./pages/student/StudentSubjectsPage";
import SubjectPage from "./pages/student/ManageSubjectsPage.jsx";
import LeaderboardPage from "./pages/dashboard/LeaderboardPage";

import ResetPassword from "./pages/ResetPassword";
import PublicSubjects from "./pages/PublicSubjects";

// ---------- Admin Pages ----------
import AdminDashboard from "./pages/admin/AdminDashboard";
import UploadQuestionsPage from "./pages/admin/UploadQuestionsPage";
import ManageSubjectsPage from "./pages/admin/ManageSubjectsPage";
import AdminManageUsers from "./pages/admin/AdminManageUsers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminQuestionsPage from "./pages/admin/AdminQuestionsPage";

// ---------- Exam Pages ----------
import ExamPage from "./pages/exam/ExamPage";
import AttemptHistory from "./pages/exam/AttemptHistory";
import ReviewPage from "./pages/exam/ReviewPage";
import StudentResultDetailsPage from "./pages/dashboard/StudentResultDetailsPage";
import SettingsPage from "./pages/dashboard/SettingsPage";

// ---------- Auth & Context ----------
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ======================= */}
          {/* ✅ ADMIN ROUTES         */}
          {/* ======================= */}
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminManageUsers />} />
            <Route path="subjects" element={<ManageSubjectsPage />} />
            <Route path="questions" element={<UploadQuestionsPage />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="manage-questions" element={<AdminQuestionsPage />} />
          </Route>

          {/* ======================= */}
          {/* ✅ PUBLIC ROUTES        */}
          {/* ======================= */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:articleId" element={<BlogArticlePage />} />
          <Route path="/waec" element={<WAECPage />} />
          <Route path="/jamb" element={<JAMBPage />} />
          <Route path="/neco" element={<NECOPage />} />

          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <Register />
              </PublicOnlyRoute>
            }
          />

          <Route
            path="/verify-email"
            element={
              <PublicOnlyRoute>
                <VerifyEmail />
              </PublicOnlyRoute>
            }
          />

          {/* ======================= */}
          {/* ✅ EXAM ROUTES          */}
          {/* ======================= */}
          <Route
            path="/exam/:subjectId"
            element={
              <ProtectedRoute role="student">
                <ExamPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/exam/history/:subjectId"
            element={
              <ProtectedRoute role="student">
                <AttemptHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/exam/review/:sessionId"
            element={
              <ProtectedRoute role="student">
                <ReviewPage />
              </ProtectedRoute>
            }
          />

          {/* ======================= */}
          {/* ✅ STUDENT DASHBOARD    */}
          {/* ======================= */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="student">
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route
              path="result/:examId"
              element={
                <ProtectedRoute role="student">
                  <StudentResultDetailsPage />
                </ProtectedRoute>
              }
            />

            <Route index element={<DashboardPage />} />
            <Route path="subjects" element={<StudentSubjectsPage />} />
            <Route path="results" element={<StudentResultsPage />} />
            <Route path="manage-subject" element={<SubjectPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="settings" element={<SettingsPage />} />

          </Route>

          {/* ======================= */}
          {/* 🔁 FALLBACK 404          */}
          {/* ======================= */}
          <Route path="*" element={<Navigate to="/" replace />} />

          {/* ======================= */}
          {/* 🔁 PUBLIC EXTRA PAGES    */}
          {/* ======================= */}
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-success" element={<ResetPasswordSuccess />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/subjects" element={<PublicSubjects />} />
          <Route path="/email-verification-notice" element={<EmailVerificationNotice />} />
          <Route path="/registration-success" element={<RegistrationSuccess />} />

        </Routes>

        {/* ======================= */}
        {/* 🍪 COOKIE CONSENT BAR   */}
        {/* ======================= */}
        <CookieConsent />

      </BrowserRouter>
    </AuthProvider>
  );
}
