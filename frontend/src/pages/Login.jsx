// Login.jsx (Upgraded UI — Logic 100% preserved)
import { useState, useEffect } from "react";
import {
  TextField, Button, Snackbar, Alert, Link as MLink,
  InputAdornment, IconButton, Box
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";
import AuthCard from "../components/AuthCard";
import GoogleAuthButton from "../components/GoogleAuthButton";

import { useAuth } from "../context/AuthContext";
import api from "../utils/api";   // keep your axios instance

export default function Login() {
  const navigate = useNavigate();
  const { login, token } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // redirect if already logged in
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

      // your original logic preserved
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
      {/* TOP NAVBAR */}
      <Navbar />

      {/* CENTER CONTAINER */}
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
        <AuthCard title="Login to Your Account">
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

          {/* GOOGLE SIGN-IN (Disabled for now) */}
          <GoogleAuthButton />

          <form onSubmit={handleSubmit} noValidate>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              required
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

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
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
                mt: 2,
                py: 1.2,
                borderRadius: 2,
                textTransform: "none",
                fontSize: "16px",
              }}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <MLink
            component={Link}
            to="/forgot-password"
            underline="hover"
            sx={{ mt: 2, fontSize: 14, display: "block" }}
          >
            Forgot password?
          </MLink>

          <MLink
            component={Link}
            to="/register"
            underline="hover"
            sx={{ mt: 1, fontSize: 14, display: "block" }}
          >
            Don’t have an account? Register
          </MLink>
        </AuthCard>
      </Box>

      {/* FOOTER */}
      <Footer />
    </>
  );
}
