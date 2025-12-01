// ===============================================
// Improved Login.jsx (UI Upgrade — Logic Preserved)
// Source: :contentReference[oaicite:1]{index=1}
// ===============================================
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
import api from "../utils/api";

export default function Login() {
  const navigate = useNavigate();
  const { login, token } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      // Original logic preserved
      login(data.user, data.token);

      if (data?.user?.role === "admin") {
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

      {/* ========================= Main Section ========================= */}
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

          {/* Error Snackbar */}
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

          {/* Google Sign In */}
          <GoogleAuthButton />

          <Divider sx={{ my: 3 }}>or</Divider>

          {/* ======================== FORM START ======================== */}
          <form onSubmit={handleSubmit} noValidate>
            {/* EMAIL */}
            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
              margin="normal"
              error={
                !!error &&
                (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
              }
              helperText={
                !!error &&
                (!email
                  ? "Email is required"
                  : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                  ? "Enter a valid email"
                  : "")
              }
            />

            {/* PASSWORD */}
            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
              margin="normal"
              error={!!error && (!password || password.length < 6)}
              helperText={
                !!error &&
                (!password
                  ? "Password is required"
                  : password.length < 6
                  ? "Minimum 6 characters"
                  : "")
              }
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

            {/* LOGIN BUTTON */}
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

          {/* EXTRA LINKS */}
          <MLink
            component={Link}
            to="/forgot-password"
            underline="hover"
            sx={{ mt: 2, fontSize: 14, display: "block", textAlign: "center" }}
          >
            Forgot password?
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
