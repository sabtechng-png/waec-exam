// ========================================================================
// ResendVerifyModal.jsx — FINAL SMART VERSION
// Detects: Already verified / Sent / Unknown email (safe non-enumeration)
// ========================================================================

import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";

import { useState, useEffect } from "react";
import api from "../utils/api";
import Toast from "./Toast";

export default function ResendVerifyModal({ open, onClose, defaultEmail }) {
  const [email, setEmail] = useState(defaultEmail || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEmail(defaultEmail || "");
  }, [defaultEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      Toast.error("Please enter your email.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/resend-verify-link", { email });

      const msg = res?.data?.message?.toLowerCase() || "";

      // ---------------------------------------------------------
      // 🔥 CASE 1 — Email is already verified
      // ---------------------------------------------------------
      if (msg.includes("already")) {
        Toast.info("Your email is already verified. Please log in.");
        localStorage.removeItem("pending_email");
        onClose();
        return;
      }

      // ---------------------------------------------------------
      // 🔥 CASE 2 — Normal resend (even if email doesn't exist)
      // ---------------------------------------------------------
      Toast.success(
        "If this email exists, a new verification link has been sent."
      );

      localStorage.setItem("pending_email", email);

      onClose();

    } catch (err) {
      // ---------------------------------------------------------
      // 🔥 CASE 3 — Server / network error
      // ---------------------------------------------------------
      Toast.error("Unable to resend link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: "90%",
          maxWidth: 420,
          bgcolor: "white",
          p: 4,
          borderRadius: 3,
          mx: "auto",
          mt: "15vh",
          boxShadow: 24,
        }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
          textAlign="center"
          sx={{ mb: 2 }}
        >
          Resend Verification Email
        </Typography>

        <Typography
          sx={{
            mb: 2,
            color: "text.secondary",
            fontSize: 14,
            textAlign: "center",
          }}
        >
          Enter your email to receive a new verification link.
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email Address"
            fullWidth
            margin="normal"
            value={email}
            type="email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button
            variant="contained"
            fullWidth
            sx={{ py: 1.2, mt: 2 }}
            disabled={loading}
            type="submit"
          >
            {loading ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "Resend Link"
            )}
          </Button>

          <Button
            variant="outlined"
            fullWidth
            sx={{ py: 1.2, mt: 1.5 }}
            onClick={onClose}
          >
            Cancel
          </Button>
        </form>
      </Box>
    </Modal>
  );
}
