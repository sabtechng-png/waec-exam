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
          minHeight: "85vh",
          background: "#f4f6fb",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: 2,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            maxWidth: 480,
            p: 4,
            textAlign: "center",
            borderRadius: 3,
          }}
        >
          <MarkEmailReadIcon sx={{ fontSize: 70, color: "#0d6efd", mb: 2 }} />

          <Typography variant="h5" fontWeight={700} gutterBottom>
            Verify Your Email
          </Typography>

          <Typography sx={{ mb: 3, color: "text.secondary" }}>
            A 6-digit verification code has been sent to:
            <br />
            <strong>{email}</strong>
            <br />
            Enter the code to activate your account.
          </Typography>

          <Button
            variant="contained"
            fullWidth
            sx={{ mb: 2, py: 1.2, borderRadius: 2 }}
            onClick={() => window.location.href = `https://mail.google.com`}
          >
            Open Gmail
          </Button>

          <Button
            variant="outlined"
            fullWidth
            sx={{ py: 1.2, borderRadius: 2 }}
            component={Link}
            to={`/verify-email?email=${encodeURIComponent(email)}`}
          >
            Enter Verification Code
          </Button>
        </Paper>
      </Box>

      <Footer />
    </>
  );
}
