// ======================================================
// ResetPassword.jsx (Improved UI — Logic Preserved)
// Source: :contentReference[oaicite:4]{index=4}
// ======================================================

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../utils/api";

import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Box, Paper, Typography, TextField, Button } from "@mui/material";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setValidated(false);
      setError("Invalid password reset link.");
      return;
    }

    api
      .post("/auth/password/validate-token", { token })
      .then(() => setValidated(true))
      .catch((err) => {
        const msg =
          err?.response?.data?.message ||
          "This reset link is invalid or has expired.";
        setValidated(false);
        setError(msg);
      });
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6)
      return setError("Password must be at least 6 characters long.");

    if (password !== confirm) return setError("Passwords do not match.");

    setLoading(true);
    setError("");

    try {
      await api.post("/auth/password/reset", { token, password });
      navigate("/reset-success");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Unable to reset your password. Link may have expired.";
      setError(msg);
    }

    setLoading(false);
  };

  return (
    <>
      <Navbar />

      <Box
        sx={{
          minHeight: "78vh",
          bgcolor: "#f4f6fb",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: 2,
          py: 6,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 450,
            p: 4,
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            background: "white",
          }}
        >
          <Typography variant="h5" fontWeight={800} textAlign="center" mb={1}>
            Reset Password
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            mb={3}
          >
            Enter your new password below.
          </Typography>

          {error && (
            <Box
              sx={{
                bgcolor: "#f8d7da",
                color: "#842029",
                p: 2,
                borderRadius: 2,
                mb: 2,
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              {error}
              {!validated && (
                <Button
                  onClick={() => navigate("/forgot-password")}
                  fullWidth
                  sx={{ mt: 2, borderRadius: 2 }}
                  variant="contained"
                >
                  Request New Reset Link
                </Button>
              )}
            </Box>
          )}

          {validated && (
            <form onSubmit={handleSubmit}>
              <TextField
                label="New Password"
                type="password"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <TextField
                label="Confirm Password"
                type="password"
                fullWidth
                margin="normal"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />

              <Button
                type="submit"
                fullWidth
                disabled={loading}
                variant="contained"
                sx={{ mt: 2, py: 1.2, borderRadius: 2 }}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}
        </Paper>
      </Box>

      <Footer />
    </>
  );
}
