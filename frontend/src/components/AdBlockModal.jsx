// =====================================
// AdBlockModal.jsx
// Soft-block modal when ads are disabled
// =====================================

import {
  Backdrop,
  Box,
  Button,
  Typography,
  Paper,
  Stack,
} from "@mui/material";

export default function AdBlockModal({ open, onClose }) {
  if (!open) return null;

  return (
    <Backdrop
      open={open}
      sx={{
        zIndex: (theme) => theme.zIndex.modal + 10,
        bgcolor: "rgba(15,23,42,0.85)", // slate-900 with opacity
      }}
    >
      <Paper
        sx={{
          maxWidth: 520,
          mx: 2,
          p: 4,
          borderRadius: 4,
          textAlign: "center",
          boxShadow: "0 24px 60px rgba(15,23,42,0.45)",
        }}
      >
        <Typography variant="h5" fontWeight={800} gutterBottom>
          Please Enable Ads for CBT Master
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          CBT Master is completely free for students because it is funded by ads.
          When ads are blocked, we cannot sustain our servers and development.
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Kindly whitelist <strong>cbt-master.com.ng</strong> in your ad blocker
          or disable it for this site, then refresh the page.
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="center"
          sx={{ mt: 4 }}
        >
          <Button
            variant="contained"
            sx={{ borderRadius: 999, px: 3 }}
            onClick={() => window.location.reload()}
          >
            I Disabled AdBlock – Refresh
          </Button>

          <Button
            variant="text"
            sx={{ textTransform: "none" }}
            onClick={onClose}
          >
            Continue anyway (limited access)
          </Button>
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: "block" }}>
          Premium users will not see ads or this message once subscribed.
        </Typography>
      </Paper>
    </Backdrop>
  );
}
