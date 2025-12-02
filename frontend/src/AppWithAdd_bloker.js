// ===============================
// File: src/App.js (Updated with Global AdBlock Guard + Modal + Premium Support)
// ===============================

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// ---------- Analytics ----------
import AnalyticsTracker from "./components/AnalyticsTracker";

// ---------- AdBlock System ----------
import { useAdBlockGuard } from "./hooks/useAdBlockGuard";
import AdBlockModal from "./components/AdBlockModal";
import AdsRequired from "./pages/AdsRequired";
import PublicExamPage from "./pages/PublicExamPage";


// ---------- Public Pages ----------
import LandingPage from "./pages/LandingPage";
import BlogPage from "./pages/BlogPage";
import BlogArticlePage from "./pages/BlogArticlePage";
import WAECPage from "./pages/WaecPage";
import JAMBPage from "./pages/JAMBPage";
import NECOPage from "./pages/NECOPage";

import CookieConsent from "./components/CookieConsent";

// ---------- Auth ----------
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ResetPasswordSuccess from "./pages/ResetPasswordSuccess";
import PublicOnlyRoute from "./components/PublicOnlyRoute";

// ---------- Misc Pages ----------
import AboutPage from "./pages/AboutPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import ContactPage from "./pages/ContactPage";
import FAQPage from "./pages/FAQPage";
import TermsPage from "./pages/TermsPage";
import EmailVerificationNotice from "./pages/EmailVerificationNotice";
import RegistrationSuccess from "./pages/RegistrationSuccess";
import PublicSubjects from "./pages/PublicSubjects";

// ---------- Dashboard ----------
import DashboardLayout from "./layout/DashboardLayout";
import DashboardPage from "./pages/dashboard/DashboardPage";
import StudentResultsPage from "./pages/dashboard/StudentResultsPage";
import StudentResultDetailsPage from "./pages/dashboard/StudentResultDetailsPage";
import StudentSubjectsPage from "./pages/student/StudentSubjectsPage";
import SubjectPage from "./pages/student/ManageSubjectsPage.jsx";
import LeaderboardPage from "./pages/dashboard/LeaderboardPage";
import SettingsPage from "./pages/dashboard/SettingsPage";

// ---------- Admin ----------
import AdminLayout from "./layout/AdminLayout";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UploadQuestionsPage from "./pages/admin/UploadQuestionsPage";
import ManageSubjectsPage from "./pages/admin/ManageSubjectsPage";
import AdminManageUsers from "./pages/admin/AdminManageUsers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminQuestionsPage from "./pages/admin/AdminQuestionsPage";

// ---------- Exam ----------
import ExamPage from "./pages/exam/ExamPage";
import AttemptHistory from "./pages/exam/AttemptHistory";
import ReviewPage from "./pages/exam/ReviewPage";

// ---------- Protected Route ----------
import ProtectedRoute from "./components/ProtectedRoute";

// =====================================================
// WRAPPER: Global AdBlock Guard + Premium Exclusion
// =====================================================
function AppWrapper() {
  const { user } = useAuth();
  const isPremium = !!user?.isPremium;  // If premium → no ads & no AdBlock warnings

  const { showModal, setShowModal } = useAdBlockGuard({ isPremium });

  return (
    <>
      {/* Global less-aggressive modal */}
      <AdBlockModal open={showModal} onClose={() => setShowModal(false)} />

      <Routes>
        {/* ADMIN ROUTES */}
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

        {/* PUBLIC ROUTES (ad-protected pages included) */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:articleId" element={<BlogArticlePage />} />
        <Route path="/waec" element={<WAECPage />} />
        <Route path="/jamb" element={<JAMBPage />} />
        <Route path="/neco" element={<NECOPage />} />
		<Route path="/practice" element={<PublicExamPage />} />
   

        {/* HARD BLOCK PAGE */}
        <Route path="/ads-required" element={<AdsRequired />} />

        {/* AUTH ROUTES (never blocked) */}
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
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-success" element={<ResetPasswordSuccess />} />

        {/* EXAM ROUTES */}
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

        {/* STUDENT DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="student">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="subjects" element={<StudentSubjectsPage />} />
          <Route path="results" element={<StudentResultsPage />} />
          <Route path="result/:examId" element={<StudentResultDetailsPage />} />
          <Route path="manage-subject" element={<SubjectPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* EXTRA PUBLIC PAGES */}
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/email-verification-notice" element={<EmailVerificationNotice />} />
        <Route path="/registration-success" element={<RegistrationSuccess />} />
        <Route path="/subjects" element={<PublicSubjects />} />
		

        

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* COOKIE CONSENT */}
      <CookieConsent />
    </>
  );
}

// ===============================
// MAIN APP EXPORT
// ===============================
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AnalyticsTracker />
        <AppWrapper />
      </BrowserRouter>
    </AuthProvider>
  );
}
