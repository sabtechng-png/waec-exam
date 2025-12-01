// ===============================================
// GoogleAuthButton.jsx — Premium + Safe Version
// ===============================================

import { useEffect, useState } from "react";
import { Button, CircularProgress, Snackbar, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const GoogleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.61l6.83-6.83C35.9 2.38 30.47 0 24 0c-9.38 0-17.49 5.44-21.44 13.28l7.94 6.15C12.6 13.35 17.79 9.5 24 9.5z"/>
    <path fill="#34A853" d="M46.5 24.5c0-1.57-.14-3.08-.41-4.5H24v9h12.85c-.55 2.96-2.22 5.48-4.72 7.19l7.45 5.77C43.75 38.03 46.5 31.73 46.5 24.5z"/>
    <path fill="#4A90E2" d="M9.5 28.43A14.48 14.48 0 0 1 9 24c0-1.58.27-3.1.75-4.5L1.81 13.35A23.88 23.88 0 0 0 0 24c0 3.9.93 7.58 2.56 10.72l7.94-6.29z"/>
    <path fill="#FBBC05" d="M24 48c6.48 0 11.96-2.14 15.95-5.81l-7.45-5.77c-2.13 1.41-4.85 2.33-8.5 2.33-6.21 0-11.4-3.85-13.5-9.28l-7.94 6.29C6.51 42.56 14.62 48 24 48z"/>
  </svg>
);

export default function GoogleAuthButton() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  // Load Google script once
  useEffect(() => {
    const existing = document.getElementById("google-identity");
    if (existing) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "google-identity";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      console.error("Failed to load Google Identity script");
      setScriptLoaded(false);
    };
    document.body.appendChild(script);
  }, []);

  const handleGoogleLogin = () => {
    if (!window.google || !scriptLoaded) {
      alert("Google login is still loading. Please try again.");
      return;
    }

    // safety timer so it never spins forever
    let safetyTimer;
    try {
      setLoading(true);
      safetyTimer = setTimeout(() => {
        setLoading(false);
      }, 10000); // 10s max

      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            const id_token = response?.credential;
            if (!id_token) {
              console.error("No credential returned from Google", response);
              alert("Could not complete Google sign-in. Please try again.");
              return;
            }

            const res = await api.post("/auth/google", { id_token });

            const user = res.data.user;
            const token = res.data.token;

            login(user, token);

            setSuccessOpen(true);

            setTimeout(() => {
              if (user?.role === "admin") navigate("/admin");
              else navigate("/dashboard");
            }, 1200);
          } catch (err) {
            console.error("GOOGLE LOGIN ERROR (frontend):", err);
            alert("Google login failed. Please try again.");
          } finally {
            clearTimeout(safetyTimer);
            setLoading(false);
          }
        },
      });

      window.google.accounts.id.prompt(); // open Google popup
    } catch (err) {
      console.error("Error initializing Google login:", err);
      clearTimeout(safetyTimer);
      setLoading(false);
      alert("Unable to start Google sign-in. Check console for details.");
    }
  };

  return (
    <>
      <Button
        onClick={handleGoogleLogin}
        fullWidth
        disabled={!scriptLoaded || loading}
        startIcon={!loading && <GoogleLogo />}
        sx={{
          textTransform: "none",
          borderRadius: 3,
          border: "1px solid #e0e0e0",
          backgroundColor: "#fff",
          color: "#444",
          fontWeight: 600,
          py: 1.3,
          mt: 1,
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
          transition: "all 0.25s",
          "&:hover": {
            backgroundColor: "#f9f9f9",
            boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
          },
        }}
      >
        {loading ? <CircularProgress size={22} color="inherit" /> : "Continue with Google"}
      </Button>

      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="filled"
          sx={{ width: "100%", fontSize: "16px" }}
        >
          ✓ Automatic sign-in successful! Redirecting...
        </Alert>
      </Snackbar>
    </>
  );
}
