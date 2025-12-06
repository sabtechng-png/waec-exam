// ===========================================================
// RegistrationSuccess.jsx — Final Updated Version
// Matches new backend verification logic perfectly
// ===========================================================

import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import { Box, Typography, Paper, Button } from "@mui/material";

import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";

import ResendVerifyModal from "../components/ResendVerifyModal";
import Toast from "../components/Toast";

export default function RegistrationSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  // Email passed from Register.jsx
  const emailState = location?.state?.email;

  // Fallback email in case page is refreshed
  const pendingEmail = localStorage.getItem("pending_email");

  const email = emailState || pendingEmail || "";

  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    // If no email info → go back to register (prevents blank page)
    if (!email) {
      Toast.error("Email not found. Please register again.");
      navigate("/register");
    }
  }, [email, navigate]);

  const handleOpenModal = () => {
    if (!email) {
      Toast.error("Email not available.");
      return;
    }
    setModalOpen(true);
  };

  return (
    <>
      <Navbar />

      {/* Resend Verification Modal */}
      <ResendVerifyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultEmail={email}
      />

      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: 2,
          py: 4,
          backgroundColor: "#f4f6fb",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 480,
            textAlign: "center",
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "white",
          }}
        >
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ mb: 2, color: "primary.main" }}
          >
            Registration Successful 🎉
          </Typography>

          <Typography
            sx={{
              mb: 3,
              color: "text.secondary",
              lineHeight: 1.6,
              fontSize: 16,
            }}
          >
            A verification link has been sent to:
            <br />
            <strong>{email}</strong>
            <br />
            <br />
            Please check your Inbox and Spam folder to verify your account.
            <br />
            You must verify before you can log in.
          </Typography>

          <Button
            variant="contained"
            fullWidth
            sx={{ py: 1.2, mb: 2 }}
            onClick={() => navigate("/login")}
          >
            Go to Login
          </Button>

          <Button
            variant="outlined"
            fullWidth
            sx={{ py: 1.2 }}
            onClick={handleOpenModal}
          >
            Resend Verification Email
          </Button>

          <Typography
            sx={{ mt: 3, fontSize: 14, color: "text.secondary" }}
          >
            Didn’t receive the email? Click <strong>Resend</strong>.
          </Typography>
        </Paper>
      </Box>

      <Footer />
    </>
  );
}
