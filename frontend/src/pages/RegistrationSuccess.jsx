// ======================================================
// RegistrationSuccess.jsx (Improved UI — Logic Preserved)
// Source: :contentReference[oaicite:1]{index=1}
// ======================================================

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";

import { Box, Paper, Typography, Button } from "@mui/material";
import { FaEnvelopeOpenText } from "react-icons/fa";

export default function RegistrationSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location?.state?.email;

  const [cooldown, setCooldown] = useState(60);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!email) navigate("/register");

    let timer = setInterval(() => {
      setCooldown((v) => {
        if (v <= 1) {
          clearInterval(timer);
          return 0;
        }
        return v - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const maskEmail = (e) => {
    if (!e) return "";
    const [user, domain] = e.split("@");
    return `${user.slice(0, 2)}***@${domain}`;
  };

  const resendEmail = async () => {
    if (cooldown > 0) return;

    setSending(true);

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/resend-verify-link`,
        { email }
      );

      alert("Verification email resent!");
      setCooldown(60);
    } catch (err) {
      alert("Error sending verification email.");
    }

    setSending(false);
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
          bgcolor: "#f4f6fb",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 480,
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            textAlign: "center",
            backgroundColor: "white",
          }}
        >
          {/* Icon */}
          <FaEnvelopeOpenText size={60} color="#0d6efd" style={{ marginBottom: 15 }} />

          {/* Title */}
          <Typography variant="h5" fontWeight={800} gutterBottom>
            Almost There!
          </Typography>

          {/* Description */}
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, lineHeight: 1.7 }}
          >
            A verification link has been sent to:
            <br />
            <strong>{maskEmail(email)}</strong>
          </Typography>

          {/* Open Email App Button */}
          <Button
            variant="contained"
            fullWidth
            size="large"
            sx={{
              py: 1.3,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "16px",
              mb: 2,
            }}
            onClick={() => window.open("https://mail.google.com", "_blank")}
          >
            Open Email App
          </Button>

          <Typography variant="body2" sx={{ mt: 1, mb: 1 }} color="text.secondary">
            Didn’t receive the email?
          </Typography>

          {/* Resend Verification Email */}
          <Button
            fullWidth
            size="large"
            variant="contained"
            disabled={sending || cooldown > 0}
            onClick={resendEmail}
            sx={{
              py: 1.3,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "16px",
              bgcolor: sending || cooldown > 0 ? "#6c757d" : "#0d6efd",
              ":hover": {
                bgcolor:
                  sending || cooldown > 0 ? "#6c757d" : "#0b5ed7",
              },
              mb: 2,
            }}
          >
            {sending
              ? "Sending..."
              : cooldown > 0
              ? `Resend in ${cooldown}s`
              : "Resend Verification Email"}
          </Button>

          <Typography variant="caption" color="text.secondary">
            Check your Spam/Junk folder if you don’t see the email.
          </Typography>
        </Paper>
      </Box>

      <Footer />
    </>
  );
}
