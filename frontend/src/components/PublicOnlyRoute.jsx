import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FullScreenLoader from "./FullScreenLoader";

export default function PublicOnlyRoute({ children }) {
  const { user, token, loading } = useAuth();

  if (loading) return <FullScreenLoader />;

  // If logged in → redirect by role
  if (token && user) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ User not logged in → allow page
  return children;
}
