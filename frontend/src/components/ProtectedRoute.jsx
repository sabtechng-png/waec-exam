import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FullScreenLoader from "./FullScreenLoader";

export default function ProtectedRoute({ children, role }) {
  const { user, token, loading } = useAuth();

  // Still restoring session from localStorage
  if (loading) return <FullScreenLoader />;

  // No token → not logged in
  if (!token) return <Navigate to="/login" replace />;

  // Token exists but user not yet restored
  if (!user) return <FullScreenLoader />;

  // If email is not verified
  if (user.is_verified === false) {
    return <Navigate to="/verify-email" replace />;
  }

  // If this route requires a specific role (student/admin)
  if (role) {
    const currentRole = user.role?.toLowerCase();
    const requiredRole = role.toLowerCase();

    if (currentRole !== requiredRole) {
      // Wrong role → redirect based on role
      return currentRole === "admin"
        ? <Navigate to="/admin" replace />
        : <Navigate to="/dashboard" replace />;
    }
  }

  // Everything OK → allow access
  return children;
}
