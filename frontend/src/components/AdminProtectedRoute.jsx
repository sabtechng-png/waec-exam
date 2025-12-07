import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FullScreenLoader from "./FullScreenLoader";

export default function AdminProtectedRoute({ children }) {
  const { user, token, loading } = useAuth();

  // Wait until AuthContext finishes restoring user & token
  if (loading) return <FullScreenLoader />;

  // No token → not logged in
  if (!token) return <Navigate to="/login" replace />;

  // Still loading user after token restoration
  if (!user) return <FullScreenLoader />;

  // Check role safely (case insensitive)
  if (user.role?.toLowerCase() !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
