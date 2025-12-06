// =======================================================
// ResetPasswordSuccess.jsx — Final Updated Version
// =======================================================
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
            Password Reset Successful
          </Typography>

          <Typography sx={{ mb: 3, color: "text.secondary", lineHeight: 1.6 }}>
            Your password has been updated successfully.
            <br />
            You can now log in with your new password.
          </Typography>

          <Button
            variant="contained"
            fullWidth
            sx={{ py: 1.2, fontSize: 15 }}
            onClick={() => navigate("/login")}
          >
            Go to Login
          </Button>
        </Paper>
      </Box>

      <Footer />
    </>
  );
}
