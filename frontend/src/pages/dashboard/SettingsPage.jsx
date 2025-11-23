// SettingsPage.jsx
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Divider,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";
import api from "../../utils/api";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  // Snackbar states
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");
  const [snackType, setSnackType] = useState("success");

  const showToast = (msg, type = "success") => {
    setSnackMsg(msg);
    setSnackType(type);
    setSnackOpen(true);
  };

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/user/me");
        setName(data.full_name);
        setEmail(data.email);
      } catch (err) {
        console.error("Error loading profile:", err);
        showToast("Failed to load profile information.", "error");
      }
    })();
  }, []);

  const updateProfile = async () => {
    setSaving(true);
    try {
      await api.post("/user/update-profile", { full_name: name });
      showToast("Profile updated successfully.", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to update profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  const sendResetEmail = async () => {
    try {
      await api.post("/auth/password/request", { email });
      showToast("Password reset link sent to your email.", "success");
    } catch (err) {
      console.error(err);
      showToast("Error sending reset link.", "error");
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        ⚙️ Settings
      </Typography>

      {/* PROFILE INFORMATION */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Profile Information
        </Typography>

        <Box mt={2}>
          <TextField
            label="Full Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Email Address"
            fullWidth
            value={email}
            disabled
            sx={{ mb: 2 }}
          />

          <Button variant="contained" onClick={updateProfile} disabled={saving}>
            Save Changes
          </Button>
        </Box>
      </Paper>

      {/* CHANGE PASSWORD */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Change Password
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          A secure link will be emailed to you to reset your password.
        </Typography>

        <Button variant="outlined" sx={{ mt: 2 }} onClick={sendResetEmail}>
          Send Password Reset Email
        </Button>
      </Paper>

      {/* ABOUT / SUPPORT */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          About & Support
        </Typography>

        <Stack spacing={2} sx={{ mt: 2 }}>
          <Box>
            <Typography fontWeight={600}>Version</Typography>
            <Typography>EXAM Master CBT — v1.0.0</Typography>
          </Box>

          <Divider />

          <Box>
            <Typography fontWeight={600}>Contact Support</Typography>
            <Typography>Email: sabtech.ng@gmail.com</Typography>
            <Typography>WhatsApp: +234-703-473-3390</Typography>
          </Box>

          <Divider />

          <Box>
            <Typography fontWeight={600}>Terms & Conditions</Typography>
            <Button variant="text" onClick={() => window.open("/terms", "_blank")}>
              View Terms & Conditions
            </Button>
          </Box>
        </Stack>
      </Paper>

      {/* SNACKBAR NOTIFICATION */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={snackType} variant="filled" sx={{ width: "100%" }}>
          {snackMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
