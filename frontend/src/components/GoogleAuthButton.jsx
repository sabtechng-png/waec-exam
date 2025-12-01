// ===============================================
// GoogleAuthButton.jsx — Correct ID Token Version
// ===============================================

import { useEffect, useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.61l6.83-6.83C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.44 2.56 13.28l7.94 6.15C12.6 13.35 17.79 9.5 24 9.5z"/>
    <path fill="#34A853" d="M46.5 24.5c0-1.57-.14-3.08-.41-4.5H24v9h12.85c-.55 2.96-2.22 5.48-4.72 7.19l7.45 5.77C43.75 38.03 46.5 31.73 46.5 24.5z"/>
    <path fill="#4A90E2" d="M9.5 28.43A14.48 14.48 0 0 1 9 24c0-1.58.27-3.1.75-4.5L1.81 13.35A23.88 23.88 0 0 0 0 24c0 3.9.93 7.58 2.56 10.72l7.94-6.29z"/>
    <path fill="#FBBC05" d="M24 48c6.48 0 11.96-2.14 15.95-5.81l-7.45-5.77c-2.13 1.41-4.85 2.33-8.5 2.33-6.21 0-11.4-3.85-13.5-9.28l-7.94 6.29C6.51 42.56 14.62 48 24 48z"/>
  </svg>
);

export default function GoogleAuthButton() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!window.google) {
      const script = document.createElement("script");
      script.src =
        "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleGoogleLogin = () => {
    if (!window.google) {
      alert("Google system loading... try again.");
      return;
    }

    setLoading(true);

    window.google.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          const id_token = response.credential; // <-- REAL JWT TOKEN

          const res = await api.post("/auth/google", { id_token });

          login(res.data.user, res.data.token); // login user

        } catch (err) {
          console.error(err);
          alert("Google login failed.");
        }

        setLoading(false);
      },
    });

    window.google.accounts.id.prompt(); // opens Google sign-in dialog
  };

  return (
    <Button
      onClick={handleGoogleLogin}
      fullWidth
      disabled={loading}
      startIcon={!loading && <GoogleLogo />}
      sx={{
        textTransform: "none",
        borderRadius: 2,
        border: "1px solid #dadce0",
        backgroundColor: "#fff",
        color: "#3c4043",
        py: 1.3,
      }}
    >
      {loading ? <CircularProgress size={22}/> : "Continue with Google"}
    </Button>
  );
}
