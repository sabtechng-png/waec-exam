// =======================================================
// ResetPassword.jsx — Updated with Confirm Password
// =======================================================

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  InputAdornment,
} from "@mui/material";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";

import api from "../utils/api";
import Loader from "../components/Loader";
import Toast from "../components/Toast";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [validated, setValidated] = useState(false);
  const [validationLoading, setValidationLoading] = useState(true);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [loading, setLoading] = useState(false);

  // ==============================
  // VALIDATE RESET TOKEN
  // ==============================
  useEffect(() => {
    if (!token) {
      setValidated(false);
      setValidationLoading(false);
      Toast.error("Invalid or missing reset token.");
      return;
    }

    const validateToken = async () => {
      try {
        await api.post("/password/validate-token", { token });
        setValidated(true);
      } catch (err) {
        setValidated(false);
        Toast.error("This reset link is invalid or expired.");
      } finally {
        setValidationLoading(false);
      }
    };

    validateToken();
  }, [token]);

  // ==============================
  // SUBMIT NEW PASSWORD
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || password.length < 6) {
      Toast.error("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      Toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/password/reset", { token, password });
      Toast.success("Password reset successful!");
      navigate("/reset-success");
    } catch (err) {
      Toast.error(
        err?.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <Box
        sx={{
          minHeight: "75vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: 2,
          py: 6,
          backgroundColor: "#f4f6fb",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 420,
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "white",
            textAlign: "center",
          }}
        >
          {/* ======================== */}
          {/* LOADING WHILE VALIDATING */}
          {/* ======================== */}
          {validationLoading && (
            <>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
                Validating Link…
              </Typography>

              <Box
                sx={{
                  mx: "auto",
                  width: 55,
                  height: 55,
                  border: "5px solid rgba(0,0,0,0.2)",
                  borderTopColor: "primary.main",
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                }}
              />

              <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
              `}</style>
            </>
          )}

          {/* ======================== */}
          {/* INVALID TOKEN */}
          {/* ======================== */}
          {!validationLoading && !validated && (
            <>
              <Typography
                variant="h5"
                fontWeight={800}
                sx={{ mb: 2, color: "error.main" }}
              >
                Invalid or Expired Link
              </Typography>

              <Typography sx={{ mb: 3, color: "text.secondary" }}>
                The password reset link is invalid or expired.
              </Typography>

              <Button
                variant="contained"
                fullWidth
                sx={{ py: 1.2 }}
                onClick={() => navigate("/forgot-password")}
              >
                Try Again
              </Button>
            </>
          )}

          {/* ======================== */}
          {/* VALID TOKEN — SHOW FORM */}
          {/* ======================== */}
          {!validationLoading && validated && (
            <>
              <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
                Reset Your Password
              </Typography>

              <Typography sx={{ mb: 3, color: "text.secondary" }}>
                Enter your new password below.
              </Typography>

              <form onSubmit={handleSubmit}>
                {/* NEW PASSWORD */}
                <TextField
                  label="New Password"
                  type={showPw ? "text" : "password"}
                  fullWidth
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPw((s) => !s)} edge="end">
                          {showPw ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* CONFIRM PASSWORD */}
                <TextField
                  label="Confirm Password"
                  type={showConfirmPw ? "text" : "password"}
                  fullWidth
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPw((s) => !s)}
                          edge="end"
                        >
                          {showConfirmPw ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    mt: 2,
                    py: 1.3,
                    fontSize: 16,
                    textTransform: "none",
                    borderRadius: 2,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {loading ? <Loader /> : "Reset Password"}
                </Button>
              </form>
            </>
          )}
        </Paper>
      </Box>

      <Footer />
    </>
  );
}
