// =======================================================
// Login.jsx — Updated with FULL Google OAuth Redirect
// (No logic removed, no UI broken, ALL features preserved)
// =======================================================

import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Snackbar,
  Alert,
  Link as MLink,
  InputAdornment,
  IconButton,
  Box,
  Typography,
  Paper,
} from "@mui/material";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import api, { warmUpBackend } from "../utils/api";

import ResendVerifyModal from "../components/ResendVerifyModal";
import Toast from "../components/Toast";

import GoogleAuthButton from "../components/GoogleAuthButton";

export default function Login() {
  const navigate = useNavigate();
  const { login, token } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isUnverified, setIsUnverified] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Wake backend for instant response
  useEffect(() => {
    warmUpBackend();
  }, []);

  // If already logged in
  useEffect(() => {
    if (token) navigate("/dashboard");
  }, [token, navigate]);

  // ============================
  // VALIDATION
  // ============================
  const validate = () => {
    if (!email) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Enter a valid email address.";
    if (!password) return "Password is required.";
    if (password.length < 6)
      return "Password must be at least 6 characters.";
    return "";
  };

  // ============================
  // SUBMIT LOGIN FORM
  // ============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const v = validate();
    if (v) {
      setError(v);
      setIsUnverified(false);
      return;
    }

    setLoading(true);
    setError("");
    setIsUnverified(false);

    try {
      const res = await api.post("/auth/login", { email, password });
      const data = res.data;

      if (!data?.user?.is_verified) {
        setIsUnverified(true);
        setError("Your email is not verified.");
        Toast.info("Check your email and verify your account.");
        return;
      }

      login(data.user, data.token);

      navigate(
        data.user.role === "admin" ? "/admin" : "/dashboard"
      );
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;

      if (status === 403 && msg === "Email not verified") {
        setIsUnverified(true);
        setError("Your email is not verified.");
        return;
      }

      setError(msg || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <ResendVerifyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultEmail={email}
      />

      <Box
        sx={{
          minHeight: "85vh",
          background: "#f4f6fb",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" },
          alignItems: "stretch",
        }}
      >
        {/* ================= LEFT SIDE (FORM) ================= */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            px: { xs: 2, md: 6 },
            py: { xs: 4, md: 0 },
          }}
        >
          <Paper
            elevation={0}
            sx={{
              width: "100%",
              maxWidth: 420,
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "white",
            }}
          >
            <Typography
              variant="h5"
              fontWeight={800}
              textAlign="center"
              mb={1.5}
            >
              Login to Your Account
            </Typography>

            <Typography
              textAlign="center"
              sx={{ mb: 2.5, color: "text.secondary", fontSize: 14 }}
            >
              Continue your CBT practice and track your progress.
            </Typography>

            {/* ERROR BAR */}
            <Snackbar
              open={!!error}
              autoHideDuration={3000}
              onClose={() => setError("")}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
              <Alert
                onClose={() => setError("")}
                severity={isUnverified ? "warning" : "error"}
                variant="standard"
                sx={{
                  width: "100%",
                  bgcolor: isUnverified ? "#fff8e1" : "#fdecea",
                  color: "#3a3a3a",
                  border: "1px solid #e0e0e0",
                }}
              >
                {error}

                {isUnverified && (
                  <Typography sx={{ mt: 1, fontSize: 13, color: "#333" }}>
                    Check your email and verify your account, or{" "}
                    <MLink
                      sx={{ cursor: "pointer", fontWeight: 600 }}
                      onClick={() => setModalOpen(true)}
                    >
                      click here to resend the verification link.
                    </MLink>
                  </Typography>
                )}
              </Alert>
            </Snackbar>

            {/* FORM */}
            <form onSubmit={handleSubmit} noValidate>
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                required
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                required
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowPassword((prev) => !prev)
                        }
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
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
                  mt: 3,
                  py: 1.3,
                  borderRadius: 2,
                  fontSize: 16,
                }}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>

              {/* DIVIDER */}
              <Box sx={{ textAlign: "center", my: 2, color: "#666", fontSize: 13 }}>
                ─── or continue with ───
              </Box>

              {/* FULL GOOGLE OAUTH BUTTON */}
              <GoogleAuthButton />
            </form>

            {/* LINKS */}
            <MLink
              component={Link}
              to="/forgot-password"
              underline="hover"
              sx={{
                mt: 2,
                display: "block",
                textAlign: "center",
                fontSize: 14,
              }}
            >
              Forgot password?
            </MLink>

            <MLink
              component={Link}
              to="/register"
              underline="hover"
              sx={{
                mt: 1,
                display: "block",
                textAlign: "center",
                fontSize: 14,
              }}
            >
              Don’t have an account? Register
            </MLink>
          </Paper>
        </Box>

        {/* ================= RIGHT SIDE (HELP PANEL) ================= */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            justifyContent: "center",
            px: 6,
            py: 4,
            borderLeft: "1px solid #e0e0e0",
            background:
              "linear-gradient(135deg, rgba(13,110,253,0.08), rgba(13,110,253,0.02))",
          }}
        >
          <Typography variant="h4" fontWeight={900} mb={2}>
            Having Trouble Logging In?
          </Typography>

          <Typography sx={{ mb: 2, fontSize: 15, lineHeight: 1.8 }}>
            • Ensure your email and password are correct.
            <br />
            • Your email must be <b>verified</b> before access.
          </Typography>

          <Typography sx={{ mb: 2, fontSize: 15, lineHeight: 1.8 }}>
            Didn’t receive the verification mail?
            <br />
            Check your inbox or spam folder.
          </Typography>

          <Button
            variant="outlined"
            sx={{ mt: 1.5, maxWidth: 260 }}
            onClick={() => setModalOpen(true)}
          >
            Resend Verification Email
          </Button>
        </Box>
      </Box>

      <Footer />
    </>
  );
}
