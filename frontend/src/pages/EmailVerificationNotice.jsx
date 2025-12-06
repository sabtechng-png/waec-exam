// ===============================================
// EmailVerificationNotice.jsx — Final Updated
// ===============================================
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

import { Box, Typography, Paper, Button } from "@mui/material";

import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";

import ResendVerifyModal from "../components/ResendVerifyModal";
import Toast from "../components/Toast";

export default function EmailVerificationNotice() {
  const location = useLocation();
  const navigate = useNavigate();

  // Email passed from Login.jsx or Register.jsx
  const email = location?.state?.email || "";

  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => {
    if (!email) {
      Toast.error("Email not available. Please enter it manually in the modal.");
      setModalOpen(true);
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
          minHeight: "75vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: 2,
          backgroundColor: "#f4f6fb",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 460,
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            textAlign: "center",
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
            Verify Your Email
          </Typography>

          <Typography sx={{ mb: 3, lineHeight: 1.6, color: "text.secondary" }}>
            We have sent a verification link to:
            <br />
            <strong>{email ? email : "your email address"}</strong>
            <br />
            Please check your email (and spam folder) to verify your account.
          </Typography>

          <Button
            variant="contained"
            fullWidth
            sx={{ py: 1.2, mb: 2 }}
            onClick={() => navigate("/login")}
          >
            Back to Login
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
