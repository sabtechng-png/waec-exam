// ==================================
// File: src/pages/ContactPage.jsx
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
import { Helmet } from "react-helmet";   // ⭐ ADDED

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

  const showToast = (msg, type = "success") => {
    setSnack({ open: true, msg, type });
  };

  const handleSend = async () => {
    if (!name || !email || !message) {
      showToast("Please fill all fields.", "error");
      return;
    }

    try {
      setSending(true);

      const res = await api.post("/contact/send", {
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
    } catch (err) {
      console.error("Contact form error:", err);
      showToast("Failed to send message. Try again.", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <Box sx={{ bgcolor: "#f7f9fc", minHeight: "100vh" }}>
	{/* ==================== TAWK.TO SCRIPT VIA HELMET ===================== */}
      <Helmet>
        <script type="text/javascript">
          {`
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/6919e24095920719593c9dfc/1ja6hnjj4';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
            })();
          `}
        </script>
      </Helmet>
      {/* ==================================================================== */}
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
            elevation={3}
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
              We received your message. A confirmation email has been sent.
            </Typography>
          </Paper>
        </Box>
      )}

      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Contact & Support
          </Typography>

          <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.8 }}>
            Need help? Want to report an issue or ask a question?
            Fill out the form below or send us an email.
          </Typography>

          <Typography sx={{ mt: 2 }}>
            <strong>Email:</strong> support@cbt-master.com.ng
          </Typography>

          <Typography sx={{ mt: 0.5 }}>

          </Typography>

          <Typography sx={{ mt: 0.5 }}>
            <strong>Working Hours:</strong> Mon–Fri, 9AM–5PM
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
