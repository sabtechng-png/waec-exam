// ============================================================================
// VerifyEmail.jsx — FINAL BUG-FREE VERSION (duplicate toast removed, logic fixed)
// ============================================================================

import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
} from "@mui/material";

import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";

import api from "../utils/api";
import Toast from "../components/Toast";
import ResendVerifyModal from "../components/ResendVerifyModal";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  // STATES
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [expired, setExpired] = useState(false);
  const [already, setAlready] = useState(false);   // 🔥 FIX: track email already verified
  const [email, setEmail] = useState("");

  // prevents duplicate runs in React Strict Mode
  const effectExecuted = useRef(false); // 🔥 FIX

  const [modalOpen, setModalOpen] = useState(false);

  // ============================================================================  
  useEffect(() => {
    if (effectExecuted.current) return;     // 🔥 FIX
    effectExecuted.current = true;          // 🔥 FIX

    if (!token) {
      Toast.error("Invalid verification link.");
      navigate("/login");
      return;
    }

    verifyToken();
    // eslint-disable-next-line
  }, []);

  // ============================================================================
  const verifyToken = async () => {
    try {
      setLoading(true);

      const res = await api.post("/auth/verify-email", { token });
      const msg = res?.data?.message || "";

      // ----------------------------------------
      // 🔥 CASE 1 — Already verified
      // ----------------------------------------
      if (msg.toLowerCase().includes("already")) {
        setAlready(true);
        setVerified(false);

        if (res?.data?.email) setEmail(res.data.email);

        Toast.info("Email already verified.");
        return;
      }

      // ----------------------------------------
      // NORMAL SUCCESS
      // ----------------------------------------
      setVerified(true);
      setExpired(false);
      setAlready(false);

      if (res?.data?.email) {
        setEmail(res.data.email);
        localStorage.setItem("verified_email", res.data.email);
      }

      Toast.success("Email verified successfully!");

    } catch (err) {
      const msg = err?.response?.data?.message || "Verification failed.";

      // ----------------------------------------
      // 🔥 CASE 2 — EXPIRED
      // ----------------------------------------
      if (msg.toLowerCase().includes("expired")) {
        setExpired(true);
        setVerified(false);
        setAlready(false);

        Toast.error("Verification link has expired.");
      } else {
        // ----------------------------------------
        // 🔥 CASE 3 — INVALID TOKEN
        // ----------------------------------------
        setVerified(false);
        setExpired(false);
        setAlready(false);

        Toast.error("Invalid verification link.");
      }

      const stored = localStorage.getItem("pending_email");
      if (stored) setEmail(stored);

    } finally {
      setLoading(false);
    }
  };

  const openResendModal = () => {
    if (!email) {
      Toast.error("Email not available.");
      return;
    }
    setModalOpen(true);
  };

  // ============================================================================  
  return (
    <>
      <Navbar />

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
          backgroundColor: "#f4f6fb",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 480,
            p: { xs: 3, md: 5 },
            textAlign: "center",
            borderRadius: 4,
            border: "1px solid #e0e0e0",
            background: "white",
          }}
        >
          {loading && (
            <>
              <CircularProgress sx={{ mb: 3 }} />
              <Typography sx={{ color: "text.secondary" }}>
                Verifying your email, please wait...
              </Typography>
            </>
          )}

          {/* SUCCESS */}
          {!loading && verified && (
            <>
              <Typography variant="h4" fontWeight={800} sx={{ mb: 1, color: "primary.main" }}>
                Email Verified 🎉
              </Typography>
              <Typography sx={{ mb: 3, color: "text.secondary" }}>
                Your email <strong>{email}</strong> has been successfully verified.
              </Typography>
              <Button variant="contained" fullWidth sx={{ py: 1.2 }} onClick={() => navigate("/login")}>
                Go to Login
              </Button>
            </>
          )}

          {/* ALREADY VERIFIED */}
          {!loading && already && (
            <>
              <Typography variant="h4" fontWeight={800} sx={{ mb: 1, color: "primary.main" }}>
                Already Verified
              </Typography>
              <Typography sx={{ mb: 3, color: "text.secondary" }}>
                Your email <strong>{email}</strong> is already verified.
              </Typography>
              <Button variant="contained" fullWidth sx={{ py: 1.2 }} onClick={() => navigate("/login")}>
                Go to Login
              </Button>
            </>
          )}

          {/* EXPIRED */}
          {!loading && expired && (
            <>
              <Typography variant="h4" fontWeight={800} sx={{ mb: 1, color: "error.main" }}>
                Link Expired
              </Typography>
              <Typography sx={{ mb: 3, color: "text.secondary" }}>
                Your verification link has expired.
              </Typography>
              <Button variant="outlined" fullWidth sx={{ py: 1.2, mb: 2 }} onClick={openResendModal}>
                Resend Verification Email
              </Button>
              <Button variant="contained" fullWidth sx={{ py: 1.2 }} onClick={() => navigate("/login")}>
                Back to Login
              </Button>
            </>
          )}

          {/* INVALID */}
          {!loading && !verified && !expired && !already && (
            <>
              <Typography variant="h4" fontWeight={800} sx={{ mb: 1, color: "error.main" }}>
                Invalid Link
              </Typography>
              <Typography sx={{ mb: 3, color: "text.secondary" }}>
                This verification link is invalid or has already been used.
              </Typography>
              <Button variant="outlined" fullWidth sx={{ py: 1.2, mb: 2 }} onClick={openResendModal}>
                Resend Verification Email
              </Button>
              <Button variant="contained" fullWidth sx={{ py: 1.2 }} onClick={() => navigate("/login")}>
                Back to Login
              </Button>
            </>
          )}
        </Paper>
      </Box>

      <Footer />
    </>
  );
}
