import { useState } from "react";
import { Modal, Box, Typography, TextField, Button } from "@mui/material";
import api from "../utils/api";
import Toast from "./Toast";

export default function ResendVerifyModal({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    if (!email) return Toast.error("Enter your email");

    setLoading(true);

    try {
      await api.post("/auth/resend-verify-link", { email });
      Toast.success("Verification email sent!");
      onClose();
    } catch (err) {
      Toast.error("Unable to send verification email");
    }

    setLoading(false);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          p: 4,
          maxWidth: 400,
          mx: "auto",
          mt: "15vh",
          bgcolor: "white",
          borderRadius: 3,
        }}
      >
        <Typography variant="h6" fontWeight={700} mb={2}>
          Resend Verification Email
        </Typography>

        <TextField
          label="Email address"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Button
          fullWidth
          variant="contained"
          disabled={loading}
          onClick={handleResend}
          sx={{ py: 1.2 }}
        >
          {loading ? "Sending..." : "Send Link"}
        </Button>
      </Box>
    </Modal>
  );
}
