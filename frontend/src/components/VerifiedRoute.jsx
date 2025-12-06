import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function VerifiedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null; 

  if (!user) return <Navigate to="/login" replace />;

  if (!user.is_verified)
    return <Navigate to="/email-verification-notice" replace />;

  return children;
}
