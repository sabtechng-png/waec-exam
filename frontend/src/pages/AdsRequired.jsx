// =====================================
// AdsRequired.jsx
// Full page fallback when ads are blocked
// =====================================

import { Container, Paper, Typography, Button, Stack } from "@mui/material";

export default function AdsRequired() {
  return (
    <Container maxWidth="sm" sx={{ mt: 10, mb: 6 }}>
      <Paper
        sx={{
          p: 4,
          borderRadius: 4,
          textAlign: "center",
          boxShadow: "0 20px 50px rgba(15,23,42,0.25)",
        }}
      >
        <Typography
          variant="overline"
          sx={{ letterSpacing: "0.12em" }}
          color="primary"
        >
          CBT MASTER
        </Typography>

        <Typography variant="h4" fontWeight={800} gutterBottom>
          Ads Keep CBT Master Free
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          You&apos;re seeing this page because your browser is blocking ads.
          CBT Master relies on ad revenue to stay online and remain free for
          all students preparing for WAEC, NECO and JAMB.
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Please whitelist <strong>cbt-master.com.ng</strong> in your ad blocker
          or disable it on this site. After that, click the button below to
          continue.
        </Typography>

        <Stack spacing={2} sx={{ mt: 4 }} alignItems="center">
          <Button
            variant="contained"
            sx={{ borderRadius: 999, px: 4 }}
            onClick={() => window.location.assign("/")}
          >
            I Disabled Ads – Go Back Home
          </Button>

          <Button
            variant="text"
            sx={{ textTransform: "none" }}
            onClick={() => window.location.assign("/login")}
          >
            I have Premium / Remove Ads →
          </Button>
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: "block" }}>
          Premium members can enjoy CBT Master completely ad-free without
          seeing this page.
        </Typography>
      </Paper>
    </Container>
  );
}
