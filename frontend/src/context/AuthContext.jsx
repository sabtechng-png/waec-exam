import { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("waec_token"));
  const [loading, setLoading] = useState(true);

  // LOGIN
  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);

    localStorage.setItem("waec_token", jwtToken);
    localStorage.setItem("waec_user", JSON.stringify(userData));
  };

  // LOGOUT
  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("waec_token");
    localStorage.removeItem("waec_user");

    window.location.href = "/login";
  };

  // AUTO SESSION RESTORE
  useEffect(() => {
    const storedUser = localStorage.getItem("waec_user");
    const storedToken = localStorage.getItem("waec_token");

    // 1️⃣ Restore instantly
    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch {}
    }

    setLoading(false); // UI can load now

    // 2️⃣ Background check (NO LOGOUT ON FAIL)
    if (storedToken) {
      api
        .get("/auth/me")
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem("waec_user", JSON.stringify(res.data.user));
        })
        .catch(() => {
          console.warn("Auth validation failed (ignored). Keeping session alive.");
        });
    }
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
