// ======================================================
// VerifyEmail.jsx (Improved UI — Logic Preserved)
// Source: :contentReference[oaicite:5]{index=5}
// ======================================================

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";

import { Box, Paper, Typography, Button } from "@mui/material";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email...");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    axios
      .get(`${process.env.REACT_APP_API_URL}/auth/verify-email?token=${token}`)
      .then((res) => {
        const msg = res.data?.message;

        if (msg === "Email already verified") {
          setStatus("success");
          setMessage("Your email is already verified!");
          return;
        }

        setStatus("success");
        setMessage("Your email has been verified successfully!");
      })
      .catch((err) => {
        const msg = err?.response?.data?.message;
        setStatus("error");
        setMessage(msg || "Verification link expired or invalid.");
      });
  }, [token, navigate]);

  const resendEmail = async () => {
    setResending(true);
    try {
      const email = localStorage.getItem("pending_email");
      await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/resend-verify-link`,
        { email }
      );
      alert("A new verification email has been sent.");
    } catch {
      alert("Unable to resend verification email.");
    }
    setResending(false);
  };

  const renderIcon = () => {
    if (status === "loading")
      return <div className="spinner-border text-primary mb-3"></div>;

    if (status === "success")
      return <FaCheckCircle size={60} color="#28a745" className="mb-3" />;

    return <FaTimesCircle size={60} color="#dc3545" className="mb-3" />;
  };

  return (
    <>
      <Navbar />

      <Box
        sx={{
          minHeight: "78vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: 2,
          py: 5,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 480,
            p: 4,
            textAlign: "center",
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          {renderIcon()}

          <Typography variant="h5" fontWeight={800} mb={1}>
            Email Verification
          </Typography>

          <Typography variant="body1" color="text.secondary" mb={3}>
            {message}
          </Typography>

          {status === "success" && (
            <Button
              fullWidth
              variant="contained"
              sx={{ py: 1.2, borderRadius: 2 }}
              onClick={() => navigate("/login")}
            >
              Go to Login
            </Button>
          )}

          {status === "error" && (
            <>
              <Button
                fullWidth
                variant="contained"
                sx={{ py: 1.2, borderRadius: 2, mb: 2 }}
                onClick={() => navigate("/login")}
              >
                Back to Login
              </Button>

              <Button
                fullWidth
                disabled={resending}
                variant="outlined"
                sx={{ py: 1.2, borderRadius: 2 }}
                onClick={resendEmail}
              >
                {resending ? "Resending..." : "Resend Verification Email"}
              </Button>
            </>
          )}
        </Paper>
      </Box>

      <Footer />
    </>
  );
}
