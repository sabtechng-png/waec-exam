// ===============================
// App.js — Fully Updated Version
// ===============================

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LoadingProvider, useGlobalLoading } from "./context/LoadingContext";

import { ToastContainer } from "react-toastify";

// Global Loader
import FullPageLoader from "./components/FullPageLoader";

import ProtectedRoute from "./components/ProtectedRoute";

// ---------- Analytics ----------
import AnalyticsTracker from "./components/AnalyticsTracker";

// ---------- Public Pages ----------
import LandingPage from "./pages/LandingPage";
import BlogPage from "./pages/BlogPage";
import BlogArticlePage from "./pages/BlogArticlePage";
import WAECPage from "./pages/WaecPage";
import JAMBPage from "./pages/JAMBPage";
import NECOPage from "./pages/NECOPage";
import PracticePage from "./components/PracticePage/PracticePage";
import CookieConsent from "./components/CookieConsent";
import PublicSubjects from "./pages/PublicSubjects";
import PublicExamPage from "./pages/PublicExamPage";

// ---------- Auth ----------
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ResetPasswordSuccess from "./pages/ResetPasswordSuccess";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import EmailVerificationNotice from "./pages/EmailVerificationNotice";
import RegistrationSuccess from "./pages/RegistrationSuccess";

// ---------- Misc ----------
import AboutPage from "./pages/AboutPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import ContactPage from "./pages/ContactPage";
import FAQPage from "./pages/FAQPage";
import TermsPage from "./pages/TermsPage";
import GoogleSuccess from "./pages/GoogleSuccess";


// ---------- Dashboard ----------
import DashboardLayout from "./layout/DashboardLayout";
import DashboardPage from "./pages/dashboard/DashboardPage";
import StudentResultsPage from "./pages/dashboard/StudentResultsPage";
import StudentResultDetailsPage from "./pages/dashboard/StudentResultDetailsPage";
import StudentSubjectsPage from "./pages/student/StudentSubjectsPage";
import SubjectPage from "./pages/student/ManageSubjectsPage";
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

import EnglishManagerPage from "./pages/admin/english/EnglishManagerPage";
import PassageList from "./pages/admin/english/PassageList";
import PassageForm from "./pages/admin/english/PassageForm";
import PassageQuestionsForm from "./pages/admin/english/PassageQuestionsForm";
import ObjectiveQuestionsForm from "./pages/admin/english/ObjectiveQuestionsForm";
import ObjectiveQuestionsList from "./pages/admin/english/ObjectiveQuestionsList";
import SectionConfigPage from "./pages/admin/english/SectionConfigPage";

// ---------- Exam ----------
import ExamPage from "./pages/exam/ExamPage";
import EnglishExamPage from "./pages/exam/EnglishExamPage";
import AttemptHistory from "./pages/exam/AttemptHistory";
import ReviewPage from "./pages/exam/ReviewPage";

// ===============================
// GLOBAL WRAPPER
// ===============================
function AppWrapper() {
  const { globalLoading } = useGlobalLoading();

  return (
    <>
      {/* GLOBAL SPINNER */}
      <FullPageLoader show={globalLoading} />

      {/* GLOBAL TOASTER */}
      <ToastContainer />

      <Routes>
        {/* ---------------- ADMIN ROUTES ---------------- */}
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

          {/* English Manager */}
          <Route path="english" element={<EnglishManagerPage />} />
          <Route path="english/passages" element={<PassageList />} />
          <Route path="english/passages/new" element={<PassageForm />} />
          <Route path="english/passages/:id" element={<PassageForm />} />

          <Route
            path="english/passages/questions/:passageId"
            element={<PassageQuestionsForm />}
          />

          <Route path="english/objectives" element={<ObjectiveQuestionsForm />} />
          <Route
            path="english/objectives/list"
            element={<ObjectiveQuestionsList />}
          />
          <Route path="english/config" element={<SectionConfigPage />} />
        </Route>

        {/* ---------------- PUBLIC ROUTES ---------------- */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:articleId" element={<BlogArticlePage />} />
        <Route path="/waec" element={<WAECPage />} />
        <Route path="/jamb" element={<JAMBPage />} />
        <Route path="/neco" element={<NECOPage />} />

        {/* Public Page for Ads */}
        <Route path="/practice" element={<PublicExamPage />} />

        {/* AUTH ROUTES */}
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
        <Route path="/email-verification-notice" element={<EmailVerificationNotice />} />
        <Route path="/registration-success" element={<RegistrationSuccess />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-success" element={<ResetPasswordSuccess />} />
		<Route path="/google-success" element={<GoogleSuccess />} />


        {/* ---------------- EXAM ROUTES ---------------- */}
        <Route
          path="/exam/:subjectId"
          element={
            <ProtectedRoute role="student">
              <ExamPage />
            </ProtectedRoute>
          }
        />

        <Route path="/english-exam/:examId" element={<EnglishExamPage />} />

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

        {/* ---------------- STUDENT DASHBOARD ---------------- */}
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

        {/* ---------------- EXTRA PUBLIC PAGES ---------------- */}
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/subjects" element={<PublicSubjects />} />

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <CookieConsent />
    </>
  );
}

// ===============================
// MAIN APP EXPORT
// ===============================
export default function App() {
  return (
    <LoadingProvider>
      <AuthProvider>
        <BrowserRouter>
          <AnalyticsTracker />
          <AppWrapper />
        </BrowserRouter>
      </AuthProvider>
    </LoadingProvider>
  );
}

