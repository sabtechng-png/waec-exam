// frontend/src/pages/Register.jsx
import { useState } from "react";
import {
  TextField,
  Button,
  Snackbar,
  Alert,
  InputAdornment,
  IconButton,
  Box,
  Link as MLink,
} from "@mui/material";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";
import AuthCard from "../components/AuthCard";
import GoogleAuthButton from "../components/GoogleAuthButton";

import api from "../utils/api";

export default function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const validate = () => {
    if (!fullName) return "Full name is required";
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Enter a valid email";
    if (!password) return "Password is required";
    if (password.length < 6)
      return "Password must be at least 6 characters";
    if (password !== confirm) return "Passwords do not match";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) return setError(v);

    setLoading(true);
    setError("");

    try {
      await api.post("/auth/register", {
        full_name: fullName,
        email,
        password,
      });

      // Save for resend link usage
      localStorage.setItem("pending_email", email);

      // Redirect to registration success page
      navigate("/registration-success", {
        state: { email },
      });

      // Clear form
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirm("");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <Box
        sx={{
          minHeight: "85vh",
          background: "#f4f6fb",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: 2,
        }}
      >
        <AuthCard title="Create Your Account">
          {/* ERROR MESSAGE */}
          <Snackbar
            open={!!error}
            autoHideDuration={5000}
            onClose={() => setError("")}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert severity="error" variant="filled">
              {error}
            </Alert>
          </Snackbar>

          {/* SUCCESS MESSAGE (if you ever want to show it) */}
          <Snackbar
            open={!!successMsg}
            autoHideDuration={6000}
            onClose={() => setSuccessMsg("")}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert
              severity="success"
              variant="filled"
              sx={{
                width: "100%",
                background: "#0d6efd",
                color: "white",
                fontSize: "16px",
                fontWeight: "600",
                borderRadius: "8px",
              }}
            >
              {successMsg}
            </Alert>
          </Snackbar>

          <GoogleAuthButton />

          <form onSubmit={handleSubmit}>
            <TextField
              label="Full Name"
              fullWidth
              margin="normal"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <TextField
              label="Email Address"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              label="Password"
              type={showPass ? "text" : "password"}
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPass(!showPass)}>
                      {showPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Confirm Password"
              type={showConfirm ? "text" : "password"}
              fullWidth
              margin="normal"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              disabled={loading}
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                py: 1.2,
                textTransform: "none",
                borderRadius: 2,
                fontSize: "16px",
              }}
            >
              {loading ? "Creating Account..." : "Register"}
            </Button>
          </form>

          <Box sx={{ textAlign: "center", mt: 2 }}>
            Already have an account?{" "}
            <MLink component={Link} to="/login">
              Login
            </MLink>
          </Box>
        </AuthCard>
      </Box>

      <Footer />
    </>
  );
}
