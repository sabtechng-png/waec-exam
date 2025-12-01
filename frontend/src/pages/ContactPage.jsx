// ==================================
// File: src/pages/ContactPage.jsx
// Improved, AdSense-safe, SEO-friendly, logic preserved
// ==================================

import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";
import { useState } from "react";
import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";
import api from "../utils/api";
import { Helmet } from "react-helmet";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    type: "success",
  });

  // Success animation overlay
  const [successScreen, setSuccessScreen] = useState(false);

  const showToast = (msg, type = "error") => {
    setSnack({ open: true, msg, type });
  };

  const handleSend = async () => {
    if (!name || !email || !message) {
      showToast("Please fill in all fields.");
      return;
    }

    try {
      setSending(true);

      await api.post("/contact/send", {
        name,
        email,
        message,
      });

      // Show success animation
      setSuccessScreen(true);
      setTimeout(() => setSuccessScreen(false), 3000);

      // Reset form
      setName("");
      setEmail("");
      setMessage("");

      showToast("Message sent successfully!", "success");
    } catch (err) {
      console.error("Contact form error:", err);
      showToast("Failed to send message. Please try again.", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <Box sx={{ bgcolor: "#f7f9fc", minHeight: "100vh" }}>
      {/* ==================== SEO METADATA ONLY (No Tawk or third-party scripts) ===================== */}
      <Helmet>
        <title>Contact & Support - CBT Master</title>
        <meta
          name="description"
          content="Contact CBT Master for support, questions, feedback, or technical assistance. Our team is available Monday to Friday, 9AM to 5PM."
        />
      </Helmet>

      <Navbar />

      {/* Success Overlay */}
      {successScreen && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            bgcolor: "rgba(0,0,0,0.45)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}
        >
          <Paper
            sx={{
              p: 4,
              borderRadius: 3,
              textAlign: "center",
              maxWidth: 350,
            }}
            elevation={4}
          >
            {/* Checkmark animation */}
            <svg width="90" height="90" viewBox="0 0 120 120" style={{ marginBottom: 16 }}>
              <circle cx="60" cy="60" r="50" fill="#e7f7ed" />
              <path
                d="M40 62 L55 75 L82 45"
                stroke="#2ea44f"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <animate
                  attributeName="stroke-dasharray"
                  from="0, 200"
                  to="200, 0"
                  dur="0.6s"
                  fill="freeze"
                />
              </path>
            </svg>

            <Typography variant="h6" fontWeight={700}>
              Message Sent!
            </Typography>
            <Typography sx={{ mt: 1, color: "text.secondary" }}>
              Thank you for reaching out. We will get back to you shortly.
            </Typography>
          </Paper>
        </Box>
      )}

      {/* Main Content */}
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Contact & Support
          </Typography>

          <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.8 }}>
            Have a question, need help with your account, or want to report an issue?
            Our support team is here to assist you.
          </Typography>

          <Typography sx={{ mt: 3 }}>
            <strong>Email:</strong> support@cbt-master.com.ng
          </Typography>

          <Typography sx={{ mt: 0.5 }}>
            <strong>Working Hours:</strong> Monday – Friday, 9:00 AM to 5:00 PM
          </Typography>

          {/* Contact Form */}
          <Stack spacing={2} sx={{ mt: 4 }}>
            <TextField
              label="Your Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <TextField
              label="Email Address"
              fullWidth
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              label="Message"
              fullWidth
              multiline
              minRows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleSend}
              disabled={sending}
              sx={{ py: 1.5, textTransform: "none", borderRadius: 2 }}
            >
              {sending ? "Sending..." : "Send Message"}
            </Button>
          </Stack>
        </Paper>
      </Container>

      <Footer />

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert variant="filled" severity={snack.type} sx={{ width: "100%" }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
