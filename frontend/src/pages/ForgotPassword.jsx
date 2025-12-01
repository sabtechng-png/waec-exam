// ======================================================
// ForgotPassword.jsx (Improved UI — Logic Preserved)
// Source: :contentReference[oaicite:1]{index=1}
// ======================================================

import { useState } from "react";
import {
  TextField,
  Button,
  Snackbar,
  Alert,
  Box,
  Paper,
  Typography,
} from "@mui/material";

import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";
import api from "../utils/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) return setError("Email is required");

    setLoading(true);
    setError("");

    try {
      await api.post("/auth/password/request", { email });

      setSuccessMsg(
        "A password reset link has been sent to your email. Please check your inbox."
      );

      setEmail("");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Unable to process your request. Please try again.";
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
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: 2,
          py: 6,
          bgcolor: "#f4f6fb",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 430,
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            textAlign: "center",
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "white",
          }}
        >
          <Typography variant="h5" fontWeight={800} mb={1}>
            Forgot Password?
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3, lineHeight: 1.7 }}
          >
            Enter your registered email address and we will send you a
            password reset link.
          </Typography>

          {/* ERROR SNACKBAR */}
          <Snackbar
            open={!!error}
            autoHideDuration={5000}
            onClose={() => setError("")}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert severity="error" variant="filled" sx={{ width: "100%" }}>
              {error}
            </Alert>
          </Snackbar>

          {/* SUCCESS SNACKBAR */}
          <Snackbar
            open={!!successMsg}
            autoHideDuration={5000}
            onClose={() => setSuccessMsg("")}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert
              severity="success"
              variant="filled"
              sx={{ width: "100%", bgcolor: "#0d6efd", color: "#fff" }}
            >
              {successMsg}
            </Alert>
          </Snackbar>

          {/* FORM */}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Enter your email"
              type="email"
              required
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                mt: 2,
                py: 1.3,
                borderRadius: 2,
                fontSize: "16px",
              }}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>

            <Box sx={{ mt: 2, fontSize: 14 }}>
              <Link to="/login">Back to Login</Link>
            </Box>
          </form>
        </Paper>
      </Box>

      <Footer />
    </>
  );
}
