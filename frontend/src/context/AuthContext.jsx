import { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("waec_token") || null);
  const [loading, setLoading] = useState(true);

  // ==========================
  // LOGIN (store user + token)
  // ==========================
  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);

    localStorage.setItem("waec_token", jwtToken);
    localStorage.setItem("waec_user", JSON.stringify(userData));
  };

  // ==========================
  // LOGOUT
  // ==========================
  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("waec_token");
    localStorage.removeItem("waec_user");
    window.location.href = "/login";
  };

  // ==========================
  // AUTO LOGIN (on page refresh)
  //  - Preload cached user (incl. role) to avoid flicker
  //  - Then validate with backend /auth/me
  // ==========================
  useEffect(() => {
    const storedUser = localStorage.getItem("waec_user");
    const storedToken = localStorage.getItem("waec_token");

    if (!storedToken || !storedUser) {
      setLoading(false);
      return;
    }

    // Preload cached user immediately (keeps role available for UI/guards)
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed && parsed.role) setUser(parsed);
    } catch {}

    api
      .get("/auth/me", {
        headers: { Authorization: `Bearer ${storedToken}` },
      })
      .then((res) => {
        // Ensure role persists from server truth
        setUser(res.data.user);
      })
      .catch(() => {
        logout(); // invalid token
      })
      .finally(() => {
        setLoading(false);
      });
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
