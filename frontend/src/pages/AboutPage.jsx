// ==================================
// File: src/pages/AboutPage.jsx
// ==================================
import { Box, Container, Typography, Paper, Stack } from "@mui/material";
import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Helmet } from "react-helmet";   // ⭐ ADDED

export default function AboutPage() {
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

      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            About CBT Master
          </Typography>

          <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.8 }}>
            CBT Master is an advanced online exam preparation platform designed 
            to help secondary school students practice and master expected 
            WAEC and JAMB computer-based tests. Our goal is to make exam 
            preparation accessible, interactive, and highly effective using 
            real-time practice, performance tracking, smart analytics, and 
            AI-enhanced feedback.
          </Typography>

          <Typography variant="h5" fontWeight={700} sx={{ mt: 5 }}>
            Our Mission
          </Typography>
          <Typography variant="body1" sx={{ mt: 1.5, lineHeight: 1.8 }}>
            To empower students with the tools, confidence, and practice 
            resources they need to excel in major standardized examinations. 
            We believe that consistent practice and real exam simulations are 
            the best ways to overcome exam anxiety and build mastery.
          </Typography>

          <Typography variant="h5" fontWeight={700} sx={{ mt: 5 }}>
            What We Offer
          </Typography>

          <Stack spacing={1.5} sx={{ mt: 2 }}>
            <Typography>• Over 10,000 curated WAEC & JAMB questions</Typography>
            <Typography>• Smart timed practice (CBT format)</Typography>
            <Typography>• Instant marking and detailed explanations</Typography>
            <Typography>• Leaderboard & performance insights</Typography>
            <Typography>• Personalized study recommendations</Typography>
            <Typography>• Mobile-friendly design for studying anywhere</Typography>
          </Stack>

          <Typography variant="h5" fontWeight={700} sx={{ mt: 5 }}>
            Our Vision
          </Typography>
          <Typography variant="body1" sx={{ mt: 1.5, lineHeight: 1.8 }}>
            To become the leading digital education platform for exam 
            preparation across Africa, giving every student — regardless of 
            background — the opportunity to succeed and unlock their potential.
          </Typography>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
}
