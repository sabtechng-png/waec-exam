// ======================================================
// ForgotPassword.jsx — Final Updated Version
// ======================================================
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

import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";

import api from "../utils/api";
import Toast from "../components/Toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [snackbar, setSnackbar] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Please enter a valid email address";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const v = validate();
    if (v) {
      setSnackbar(v);
      return;
    }

    setSnackbar("");
    setLoading(true);

    try {
      await api.post("/auth/password/request", { email });

      Toast.success(
        "If an account exists, a reset link has been sent to your email."
      );

      setEmail("");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Failed to send reset link. Please try again.";
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
            maxWidth: 420,
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "white",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h5"
            fontWeight={800}
            sx={{ mb: 2, letterSpacing: -0.5 }}
          >
            Forgot Password
          </Typography>

          <Typography sx={{ mb: 3, color: "text.secondary" }}>
            Enter your email address and we’ll send you a reset link.
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

          <form onSubmit={handleSubmit}>
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
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
              }}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </Paper>
      </Box>

      <Footer />
    </>
  );
}
