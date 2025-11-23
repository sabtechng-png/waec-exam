import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FullScreenLoader from "./FullScreenLoader";

export default function ProtectedRoute({ children, role }) {
  const { token, user, loading } = useAuth();

  // wait for auto-login check
  if (loading) return <FullScreenLoader />;

  // not logged in → go to login page
  if (!token) return <Navigate to="/login" replace />;

  // if email not verified → send to verification page
  if (user && user.is_verified === false) {
    return <Navigate to="/verify-email" replace />;
  }

  // ✅ enforce role if provided
  if (role && user?.role?.toLowerCase() !== role.toLowerCase()) {
    return <Navigate to="/" replace />;
  }

  return children;
}
