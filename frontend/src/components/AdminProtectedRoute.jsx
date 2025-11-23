import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FullScreenLoader from "./FullScreenLoader";

export default function AdminProtectedRoute({ children }) {
  const { token, user, loading } = useAuth();

  if (loading) return <FullScreenLoader />;

  // Not logged in → go to login
  if (!token) return <Navigate to="/login" replace />;

  // Logged in but not admin → send to student dashboard
  if (user?.role !== "admin") return <Navigate to="/dashboard" replace />;

  return children;
}
