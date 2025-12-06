// ==========================================================
// Register.jsx — Final Updated Version
// ==========================================================
import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";

import { Link, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";

import GoogleAuthButton from "../components/GoogleAuthButton";
import Toast from "../components/Toast";
import Loader from "../components/Loader"; // ✔ Inline loader
import api from "../utils/api";

export default function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [snackbar, setSnackbar] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!fullName) return "Full name is required";
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Enter a valid email address";
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) return setSnackbar(v);

    setSnackbar("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/register", {
        full_name: fullName,
        email,
        password,
      });

      Toast.success("Registration successful! Please verify your email.");

      navigate("/registration-success", {
        state: { email },
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Failed to register. Please try again.";
      setSnackbar(msg);
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
            maxWidth: 430,
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "white",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ mb: 2, letterSpacing: -0.5, color: "primary.main" }}
          >
            Create an Account
          </Typography>

          <Typography sx={{ mb: 3, color: "text.secondary" }}>
            Join thousands of students preparing with CBT-Master.
          </Typography>

          <Snackbar
            open={!!snackbar}
            autoHideDuration={3500}
            onClose={() => setSnackbar("")}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert
              onClose={() => setSnackbar("")}
              severity="error"
              variant="filled"
              sx={{ width: "100%" }}
            >
              {snackbar}
            </Alert>
          </Snackbar>

          <GoogleAuthButton />

          <Typography sx={{ mt: 2, mb: 2, textAlign: "center" }}>or</Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Full Name"
              margin="normal"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <TextField
              fullWidth
              type="email"
              label="Email Address"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              fullWidth
              type="password"
              label="Password"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                mt: 3,
                py: 1.3,
                fontSize: 16,
                textTransform: "none",
                borderRadius: 2,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {loading ? <Loader /> : "Create Account"}
            </Button>
          </form>

          <Typography sx={{ mt: 3, fontSize: 14 }}>
            Already have an account?{" "}
            <Link
              to="/login"
              style={{ textDecoration: "none", color: "var(--primary)" }}
            >
              Login
            </Link>
          </Typography>
        </Paper>
      </Box>

      <Footer />
    </>
  );
}
