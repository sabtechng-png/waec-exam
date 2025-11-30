// =============================
// File: src/components/Navbar.jsx
// =============================
import { AppBar, Toolbar, Typography, Button, Stack, Container, Box } from "@mui/material";
import { Link } from "react-router-dom";
import MyLogo from "../assets/MyLogo.png";

export default function Navbar() {
  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: "1px solid", borderColor: "divider" }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: 72, gap: 2 }}>
          {/* ================= LOGO + TEXT ================= */}
          <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>

            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0.2, color: "black" }}>
              CBT <span style={{ color: "#1976d2" }}>Master</span>
            </Typography>
          </Link>

          {/* ================= NAV LINKS ================= */}
          <Stack direction="row" spacing={3} sx={{ ml: 4, display: { xs: "none", md: "flex" } }}>
            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>Home</Link>
            <Link to="/subjects" style={{ textDecoration: "none", color: "inherit" }}>Subjects</Link>
            <Link to="/faq" style={{ textDecoration: "none", color: "inherit" }}>FAQ</Link>
            <Link to="/contact" style={{ textDecoration: "none", color: "inherit" }}>Contact</Link>
          </Stack>

          {/* ================= BUTTONS ================= */}
          <Stack direction="row" spacing={1.5} sx={{ ml: "auto" }}>
            <Button component={Link} to="/login" color="inherit">
              Login
            </Button>

            <Button
              component={Link}
              to="/register"
              variant="contained"
              sx={{ borderRadius: 2, textTransform: "none" }}
            >
              Register
            </Button>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
