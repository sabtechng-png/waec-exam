// =============================
// File: src/components/Navbar.jsx
// =============================
import { AppBar, Toolbar, Typography, Button, Stack, Container, Link as MLink, Box } from "@mui/material";
import { Link } from "react-router-dom";
import MyLogo from "../assets/MyLogo.png";   // Make sure this path is correct

export default function Navbar() {
  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: 72, gap: 2 }}>

          {/* ================= LOGO + TEXT ================= */}
          <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <Box
              component="img"
              src={MyLogo}
              alt="CBT Master Logo"
              sx={{
                height: 45,
                width: "auto",
                mr: 1.5,
                cursor: "pointer"
              }}
            />
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: .2, color: "black" }}>
              CBT <span style={{ color: '#1976d2' }}>Master</span>
            </Typography>
          </Link>

          {/* ================= NAV LINKS ================= */}
          <Stack direction="row" spacing={3} sx={{ ml: 4, display: { xs: 'none', md: 'flex' } }}>
            <MLink href="/" underline="none" color="text.primary">Home</MLink>
            <MLink href="/subjects" underline="none" color="text.primary">Subjects</MLink>
            <MLink href="/faq" underline="none" color="text.primary">FAQ</MLink>
            <MLink href="/contact" underline="none" color="text.primary">Contact</MLink>
          </Stack>

          {/* ================= BUTTONS ================= */}
          <Stack direction="row" spacing={1.5} sx={{ ml: 'auto' }}>
            <Button href="/login" color="inherit">Login</Button>
            <Button href="/register" variant="contained" sx={{ borderRadius: 2, textTransform: 'none' }}>
              Register
            </Button>
          </Stack>

        </Toolbar>
      </Container>
    </AppBar>
  );
}
