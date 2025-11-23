
// =============================
// File: src/components/Footer.jsx
// =============================
import { Box, Container, Stack, Typography, Link as MLink } from "@mui/material";

export function Footer() {
  return (
    <Box component="footer" sx={{ borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', py: 4, mt: 8 }}>
      <Container maxWidth="lg">
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
          <Typography variant="body2">© {new Date().getFullYear()} CBT Master. All rights reserved.</Typography>
          <Stack direction="row" spacing={3}>
            <MLink href="/about" underline="none" color="text.secondary">About</MLink>
            <MLink href="/privacy-policy" underline="none" color="text.secondary">Privacy</MLink>
            <MLink href="/terms" underline="none" color="text.secondary">Terms</MLink>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}