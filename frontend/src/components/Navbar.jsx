// =============================
// File: src/components/Navbar.jsx (Improved)
// =============================
import { AppBar, Toolbar, Typography, Button, Stack, Container } from "@mui/material";
import { Link } from "react-router-dom";
//import MyLogo from "../assets/MyLogo.png";

export default function Navbar() {
  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
        backdropFilter: "blur(10px)",
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: 72, gap: 2 }}>
          
          {/* ================= LOGO & BRAND ================= */}
          <Link
            to="/"
            aria-label="CBT Master Home"
            style={{ display: "flex", alignItems: "center", textDecoration: "none" }}
          >
            {/* TEXT-BASED LOGO (cleaner + scalable) */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                letterSpacing: 0.3,
                color: "black",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              CBT <span style={{ color: "#1976d2" }}>Master</span>
            </Typography>
          </Link>

          {/* ================= NAVIGATION LINKS ================= */}
          <Stack
            direction="row"
            spacing={3}
            sx={{
              ml: 4,
              display: { xs: "none", md: "flex" },
              alignItems: "center",
            }}
          >
            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>Home</Link>
            <Link to="/subjects" style={{ textDecoration: "none", color: "inherit" }}>Subjects</Link>
            <Link to="/faq" style={{ textDecoration: "none", color: "inherit" }}>FAQ</Link>
            <Link to="/blog" style={{ textDecoration: "none", color: "inherit" }}>Blog</Link>
            <Link to="/contact" style={{ textDecoration: "none", color: "inherit" }}>Contact</Link>
          </Stack>

          {/* ================= ACTION BUTTONS ================= */}
          <Stack direction="row" spacing={1.5} sx={{ ml: "auto" }}>
            <Button
              component={Link}
              to="/login"
              color="inherit"
              sx={{ textTransform: "none" }}
            >
              Login
            </Button>

            <Button
              component={Link}
              to="/register"
              variant="contained"
              sx={{
                borderRadius: 2,
                textTransform: "none",
                px: 2.5,
              }}
            >
              Register
            </Button>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
