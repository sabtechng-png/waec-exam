// ===========================================
// RegistrationSuccess.jsx — Final Updated
// ===========================================
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

import { Box, Typography, Paper, Button } from "@mui/material";

import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";

import ResendVerifyModal from "../components/ResendVerifyModal";
import Toast from "../components/Toast";

export default function RegistrationSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  // Email passed from Register.jsx via navigate()
  const email = location?.state?.email || "";

  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => {
    if (!email) return Toast.error("Email not found.");
    setModalOpen(true);
  };

  return (
    <>
      <Navbar />

      {/* Resend verification modal */}
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
          bgColor: "#f4f6fb",
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

          <Typography sx={{ mb: 3, color: "text.secondary", lineHeight: 1.6 }}>
            A verification link has been sent to:
            <br />
            <strong>{email}</strong>
            <br />
            <br />
            Please check your inbox (and spam folder) to verify your account.
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

          <Typography sx={{ mt: 3, fontSize: 14, color: "text.secondary" }}>
            Didn’t receive the email? Click <strong>Resend</strong>.
          </Typography>
        </Paper>
      </Box>

      <Footer />
    </>
  );
}
