// ======================================================================
// ResetPasswordSuccess.jsx — FINAL UPDATED VERSION
// Works perfectly with ResetPassword.jsx final flow
// ======================================================================

import { Box, Typography, Paper, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";

export default function ResetPasswordSuccess() {
  const navigate = useNavigate();

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
            border: "1px solid #e0e0e0",
            backgroundColor: "white",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ mb: 2, color: "primary.main" }}
          >
            Password Reset Successful 🎉
          </Typography>

          <Typography
            sx={{
              mb: 3,
              color: "text.secondary",
              fontSize: 16,
              lineHeight: 1.6,
            }}
          >
            Your password has been successfully updated.
            <br />
            You can now log in to your account using your new password.
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
            onClick={() => navigate("/")}
          >
            Return to Home
          </Button>
        </Paper>
      </Box>

      <Footer />
    </>
  );
}
