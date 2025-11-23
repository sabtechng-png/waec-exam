// ======================= ForgotPassword.jsx (FINAL) =======================
import { useState } from "react";
import { TextField, Button, Snackbar, Alert, Box } from "@mui/material";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";
import AuthCard from "../components/AuthCard";
import api from "../utils/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      return setError("Email is required");
    }

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
          background: "#f4f6fb",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: 2,
        }}
      >
        <AuthCard title="Forgot Password">
          {/* ERROR */}
          <Snackbar
            open={!!error}
            autoHideDuration={5000}
            onClose={() => setError("")}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert variant="filled" severity="error">
              {error}
            </Alert>
          </Snackbar>

          {/* SUCCESS */}
          <Snackbar
            open={!!successMsg}
            autoHideDuration={6000}
            onClose={() => setSuccessMsg("")}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert
              variant="filled"
              severity="success"
              sx={{
                background: "#0d6efd",
                color: "white",
                fontSize: "16px",
                borderRadius: "8px",
              }}
            >
              {successMsg}
            </Alert>
          </Snackbar>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="Enter your email"
              type="email"
              required
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
                py: 1.2,
                borderRadius: 2,
                fontSize: "16px",
              }}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Link to="/login">Back to Login</Link>
            </Box>
          </form>
        </AuthCard>
      </Box>

      <Footer />
    </>
  );
}
