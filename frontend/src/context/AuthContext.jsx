import { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("waec_token"));
  const [loading, setLoading] = useState(true);

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);

    localStorage.setItem("waec_token", jwtToken);
    localStorage.setItem("waec_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("waec_token");
    localStorage.removeItem("waec_user");
    window.location.href = "/login";
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("waec_user");
    const storedToken = localStorage.getItem("waec_token");

    // No session
    if (!storedToken || !storedUser) {
      setLoading(false);
      return;
    }

    // Load cached user immediately (instant dashboard)
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed && parsed.role) setUser(parsed);
    } catch {}

    setLoading(false); // UI ready immediately

    // Background token validation
    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => logout());
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        role: user?.role || null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
