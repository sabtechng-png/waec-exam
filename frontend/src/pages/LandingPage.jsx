// =====================================
// LandingPage.jsx
// Wrapper for modular landing page
// =====================================

import { Box, Fab } from "@mui/material";
import { Helmet } from "react-helmet";
import ChatIcon from "@mui/icons-material/Chat";
import { Footer } from "../components/Footer";

import LandingHero from "../sections/landing/LandingHero";
import LandingSocial from "../sections/landing/LandingSocial";

export default function LandingPage() {
  return (
    <Box sx={{ bgcolor: "#f7f9fc", minHeight: "100vh" }}>
      {/* SEO */}
      <Helmet>
        <title>CBT Master – Free WAEC, JAMB & NECO CBT Practice</title>
        <meta
          name="description"
          content="Practice real WAEC, JAMB and NECO CBT questions online with instant scoring, analytics and real exam simulation."
        />
      </Helmet>

      {/* HERO SECTION */}
      <LandingHero />

      {/* SOCIAL / BLOG / FAQ SECTION */}
      <LandingSocial />

      {/* CHAT SCRIPT */}
      <script
        async
        src="https://embed.tawk.to/6919e24095920719593c9dfc/1ja6hnjj4"
        charset="UTF-8"
        crossOrigin="*"
      ></script>

      {/* FLOATING CHAT BUTTON */}
      <Fab color="primary" sx={{ position: "fixed", bottom: 24, right: 24 }}>
        <ChatIcon />
      </Fab>

      {/* FOOTER */}
      <Footer />
    </Box>
  );
}
