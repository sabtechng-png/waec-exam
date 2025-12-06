// ===============================================
// VerifyEmail.jsx — Final Updated Version
// ===============================================
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Box, Typography, Paper, Button } from "@mui/material";

import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";

import api from "../utils/api";
import Toast from "../components/Toast";
import ResendVerifyModal from "../components/ResendVerifyModal";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading"); 
  // loading | success | error

  const [modalOpen, setModalOpen] = useState(false);

  // Extract email from backend after token verification (optional)
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    const verify = async () => {
      try {
        const { data } = await api.post("/auth/verify-email", { token });

        setStatus("success");

        if (data?.email) setEmail(data.email);

        Toast.success("Email verified successfully!");
        
        // Auto redirect after 3 seconds
        setTimeout(() => navigate("/login"), 2500);

      } catch (err) {
        setStatus("error");
        Toast.error(
          err?.response?.data?.message ||
            "Verification link is invalid or expired."
        );
      }
    };

    verify();
  }, [token, navigate]);

  const openResendModal = () => {
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
            maxWidth: 480,
            textAlign: "center",
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "white",
          }}
        >
          {/* ====================== */}
          {/* SUCCESS STATE */}
          {/* ====================== */}
          {status === "success" && (
            <>
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{ mb: 2, color: "primary.main" }}
              >
                Email Verified 🎉
              </Typography>

              <Typography sx={{ mb: 3, color: "text.secondary", lineHeight: 1.6 }}>
                Your email has been successfully verified.
                <br />
                Redirecting you to login…
              </Typography>

              <Button
                fullWidth
                variant="contained"
                sx={{ py: 1.2 }}
                onClick={() => navigate("/login")}
              >
                Go to Login
              </Button>
            </>
          )}

          {/* ====================== */}
          {/* LOADING STATE */}
          {/* ====================== */}
          {status === "loading" && (
            <>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                Verifying Email…
              </Typography>
              <Typography sx={{ mb: 3, color: "text.secondary" }}>
                Please wait a moment.
              </Typography>

              <Box
                className="spinner"
                sx={{
                  mx: "auto",
                  width: 55,
                  height: 55,
                  border: "5px solid rgba(0,0,0,0.2)",
                  borderTopColor: "primary.main",
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                }}
              />

              <style>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </>
          )}

          {/* ====================== */}
          {/* ERROR STATE */}
          {/* ====================== */}
          {status === "error" && (
            <>
              <Typography
                variant="h5"
                fontWeight={800}
                sx={{ mb: 2, color: "error.main" }}
              >
                Verification Failed
              </Typography>

              <Typography sx={{ mb: 3, lineHeight: 1.6, color: "text.secondary" }}>
                The verification link is invalid or has expired.
                <br />
                You can request a new verification email.
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
                onClick={openResendModal}
              >
                Resend Verification Email
              </Button>
            </>
          )}
        </Paper>
      </Box>

      <Footer />
    </>
  );
}
