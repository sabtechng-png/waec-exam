// =========================================
// Login.jsx — Updated with Email Verification Guard
// =========================================
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
  Divider,
  Typography,
  Paper,
} from "@mui/material";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";

import GoogleAuthButton from "../components/GoogleAuthButton";

import { useAuth } from "../context/AuthContext";
import api, { warmUpBackend } from "../utils/api";
import ResendVerifyModal from "../components/ResendVerifyModal";
import Toast from "../components/Toast";

export default function Login() {
  const navigate = useNavigate();
  const { login, token } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modal for resend verification
  const [modalOpen, setModalOpen] = useState(false);

  // 🚀 Warm backend
  useEffect(() => {
    warmUpBackend();
  }, []);

  // Redirect logged-in users
  useEffect(() => {
    if (token) navigate("/dashboard");
  }, [token, navigate]);

  const validate = () => {
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email";
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) return setError(v);

    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", { email, password });

      // 🔥 EMAIL VERIFICATION GUARD
      if (!data?.user?.is_verified) {
        setLoading(false);
        Toast.info("Your email is not verified. Please verify.");
        // redirect to notice page
        navigate("/email-verification-notice", { state: { email } });
        return;
      }

      // Normal login
      login(data.user, data.token);

      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      {/* Modal: Resend email verification */}
      <ResendVerifyModal open={modalOpen} onClose={() => setModalOpen(false)} />

      <Box
        sx={{
          minHeight: "85vh",
          background: "#f4f6fb",
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
            maxWidth: 420,
            p: { xs: 3, md: 5 },
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
            mb={3}
            sx={{ letterSpacing: -0.5 }}
          >
            Login to Your Account
          </Typography>

          <Snackbar
            open={!!error}
            autoHideDuration={4000}
            onClose={() => setError("")}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert
              onClose={() => setError("")}
              severity="error"
              variant="filled"
              sx={{ width: "100%" }}
            >
              {error}
            </Alert>
          </Snackbar>

          <GoogleAuthButton />

          <Divider sx={{ my: 3 }}>or</Divider>

          <form onSubmit={handleSubmit} noValidate>
            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
              margin="normal"
            />

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((s) => !s)}
                      edge="end"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
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
                fontSize: "16px",
                textTransform: "none",
                borderRadius: 2,
              }}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <MLink
            component={Link}
            to="/forgot-password"
            underline="hover"
            sx={{ mt: 2, fontSize: 14, display: "block", textAlign: "center" }}
          >
            Forgot password?
          </MLink>

          <MLink
            component="button"
            underline="hover"
            sx={{
              mt: 1,
              fontSize: 14,
              display: "block",
              textAlign: "center",
              color: "primary.main",
            }}
            onClick={() => setModalOpen(true)}
          >
            Resend verification email
          </MLink>

          <MLink
            component={Link}
            to="/register"
            underline="hover"
            sx={{ mt: 1, fontSize: 14, display: "block", textAlign: "center" }}
          >
            Don’t have an account? Register
          </MLink>
        </Paper>
      </Box>

      <Footer />
    </>
  );
}
