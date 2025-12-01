// ======================================================
// Improved Register.jsx (UI Upgrade — Logic Preserved)
// Source: :contentReference[oaicite:1]{index=1}
// ======================================================
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
  Divider,
  Typography,
  Paper
} from "@mui/material";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";
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

      navigate("/registration-success", { state: { email } });

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
          py: 6
        }}
      >
        {/* ==================== CARD ==================== */}
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 430,
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "white"
          }}
        >
          <Typography
            variant="h5"
            fontWeight={800}
            textAlign="center"
            mb={3}
            sx={{ letterSpacing: -0.5 }}
          >
            Create Your Account
          </Typography>

          {/* ERROR TOAST */}
          <Snackbar
            open={!!error}
            autoHideDuration={4500}
            onClose={() => setError("")}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert severity="error" variant="filled">
              {error}
            </Alert>
          </Snackbar>

          {/* SUCCESS TOAST */}
          <Snackbar
            open={!!successMsg}
            autoHideDuration={5000}
            onClose={() => setSuccessMsg("")}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert
              severity="success"
              variant="filled"
              sx={{ width: "100%" }}
            >
              {successMsg}
            </Alert>
          </Snackbar>

          {/* GOOGLE SIGN UP */}
          <GoogleAuthButton />

          <Divider sx={{ my: 3 }}>or</Divider>

          {/* ==================== FORM ==================== */}
          <form onSubmit={handleSubmit}>

            {/* FULL NAME */}
            <TextField
              label="Full Name"
              fullWidth
              margin="normal"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              error={!!error && !fullName}
              helperText={!!error && !fullName ? "Full name is required" : ""}
            />

            {/* EMAIL */}
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              type={showPass ? "text" : "password"}
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={
                !!error &&
                (!password || password.length < 6)
              }
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
                    <IconButton onClick={() => setShowPass(!showPass)}>
                      {showPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* CONFIRM PASSWORD */}
            <TextField
              label="Confirm Password"
              type={showConfirm ? "text" : "password"}
              fullWidth
              margin="normal"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              error={!!error && password !== confirm}
              helperText={
                !!error && password !== confirm
                  ? "Passwords do not match"
                  : ""
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* SUBMIT BUTTON */}
            <Button
              disabled={loading}
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                py: 1.3,
                textTransform: "none",
                borderRadius: 2,
                fontSize: "16px",
              }}
            >
              {loading ? "Creating Account..." : "Register"}
            </Button>
          </form>

          {/* FOOTER LINK */}
          <Box sx={{ textAlign: "center", mt: 2 }}>
            Already have an account?{" "}
            <MLink component={Link} to="/login" underline="hover">
              Login
            </MLink>
          </Box>
        </Paper>
      </Box>

      <Footer />
    </>
  );
}
