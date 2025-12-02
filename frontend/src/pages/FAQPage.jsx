// ==================================
// File: src/pages/FAQPage.jsx
// ==================================
import {
  Box,
  Container,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Helmet } from "react-helmet";   // ⭐ ADDED
import AdBlockAtOptions from "../components/ads/AdBlockAtOptions";

export default function FAQPage() {
  const faqList = [
    {
      q: "Is CBT Master free?",
      a: "Yes, practicing is 100% free. Premium features may come later."
    },
    {
      q: "Can I practice without an account?",
      a: "Yes, but creating an account unlocks performance tracking and history."
    },
    {
      q: "Is this real WAEC format?",
      a: "Yes. The platform uses actual CBT format—timing, answering, marking, and review."
    },
    {
      q: "Will new questions be added?",
      a: "Yes, new questions and subjects are added regularly."
    },
    {
      q: "Can I use this on my phone?",
      a: "Yes, the entire platform is mobile-friendly."
    }
  ];

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
            Frequently Asked Questions
          </Typography>

          {faqList.map((item, i) => (
            <Accordion key={i} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={600}>{item.q}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{item.a}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>
      </Container>
  {/* ⭐ SECOND AD (ATOPTIONS FORMAT) */}
      <Box sx={{ mt: 6 }}>
        <AdBlockAtOptions
          adKey="efd800066af5754002a75671dd92ec61"
          id="ad-bottom-section"
          width={728}
          height={90}
        />
      </Box>
      <Footer />
    </Box>
  );
}
