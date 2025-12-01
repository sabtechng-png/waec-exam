// ======================================================
// EmailVerificationNotice.jsx (Improved UI — Logic Preserved)
// Source: :contentReference[oaicite:3]{index=3}
// ======================================================

import { Box, Typography, Button, Paper } from "@mui/material";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import { Link, useLocation } from "react-router-dom";

import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";

export default function EmailVerificationNotice() {
  const location = useLocation();
  const email = location.state?.email;

  return (
    <>
      <Navbar />

      <Box
        sx={{
          minHeight: "80vh",
          background: "#f4f6fb",
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
            maxWidth: 450,
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            textAlign: "center",
            border: "1px solid",
            borderColor: "divider",
            background: "white",
          }}
        >
          <MarkEmailReadIcon sx={{ fontSize: 70, color: "#0d6efd", mb: 2 }} />

          <Typography variant="h5" fontWeight={800} mb={1}>
            Verify Your Email
          </Typography>

          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
            A 6-digit verification code has been sent to:
            <br />
            <strong>{email}</strong>
            <br />
            Enter the code to activate your account.
          </Typography>

          <Button
            variant="contained"
            fullWidth
            sx={{ py: 1.2, borderRadius: 2, mb: 2 }}
            onClick={() => window.open("https://mail.google.com", "_blank")}
          >
            Open Gmail
          </Button>

          <Button
            variant="outlined"
            component={Link}
            to={`/verify-email?email=${encodeURIComponent(email)}`}
            fullWidth
            sx={{ py: 1.2, borderRadius: 2 }}
          >
            Enter Verification Code
          </Button>
        </Paper>
      </Box>

      <Footer />
    </>
  );
}
