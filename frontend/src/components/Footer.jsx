// =============================
// File: src/components/Footer.jsx (Improved)
// =============================
import { Box, Container, Stack, Typography, Link as MLink } from "@mui/material";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        borderTop: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        py: 5,
        mt: 8,
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={3}
        >
          {/* COPYRIGHT */}
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} CBT Master — All rights reserved.
          </Typography>

          {/* FOOTER LINKS */}
          <Stack direction="row" spacing={3} sx={{ flexWrap: "wrap" }}>
            <MLink component={Link} to="/about" underline="none" color="text.secondary">
              About
            </MLink>

            <MLink component={Link} to="/privacy-policy" underline="none" color="text.secondary">
              Privacy
            </MLink>

            <MLink component={Link} to="/terms" underline="none" color="text.secondary">
              Terms
            </MLink>

            <MLink component={Link} to="/faq" underline="none" color="text.secondary">
              FAQ
            </MLink>

            <MLink component={Link} to="/contact" underline="none" color="text.secondary">
              Contact
            </MLink>

            <MLink component={Link} to="/blog" underline="none" color="text.secondary">
              Blog
            </MLink>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
