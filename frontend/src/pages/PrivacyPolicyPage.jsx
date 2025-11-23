// ==================================
// File: src/pages/PrivacyPolicyPage.jsx
// ==================================
import { Box, Container, Typography, Paper } from "@mui/material";
import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Helmet } from "react-helmet";   // ⭐ ADDED

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </Typography>

          <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.8 }}>
            Your privacy is important to us. This policy explains what 
            information we collect, how we use it, and how we keep it safe. 
            By using CBT Master, you agree to the practices described below.
          </Typography>

          <Typography variant="h5" fontWeight={700} sx={{ mt: 5 }}>
            Information We Collect
          </Typography>
          <Typography variant="body1" sx={{ mt: 1.5, lineHeight: 1.8 }}>
            • Account details (name, email, school if provided) <br />
            • CBT performance data (scores, time spent, attempts) <br />
            • Device and usage analytics to improve platform performance <br />
            • Optional Google login profile details (name + email only)
          </Typography>

          <Typography variant="h5" fontWeight={700} sx={{ mt: 5 }}>
            How We Use Your Information
          </Typography>
          <Typography variant="body1" sx={{ mt: 1.5, lineHeight: 1.8 }}>
            • To personalize your learning experience <br />
            • To track progress and generate analytics <br />
            • To secure your account and improve platform safety <br />
            • To notify you of new features or updates (optional)
          </Typography>

          <Typography variant="h5" fontWeight={700} sx={{ mt: 5 }}>
            Data Protection
          </Typography>
          <Typography variant="body1" sx={{ mt: 1.5, lineHeight: 1.8 }}>
            All user data is encrypted at rest and in transit. We do not sell 
            or share your personal information with third parties. Your account 
            credentials, password, and exam records are strictly confidential.
          </Typography>

          <Typography variant="h5" fontWeight={700} sx={{ mt: 5 }}>
            Third-Party Services
          </Typography>
          <Typography variant="body1" sx={{ mt: 1.5, lineHeight: 1.8 }}>
            • Google OAuth login <br />
            • Payment gateways (if used in future) <br />
            • Analytics tools for app performance tracking
          </Typography>

          <Typography variant="h5" fontWeight={700} sx={{ mt: 5 }}>
            Contact Us
          </Typography>
          <Typography variant="body1" sx={{ mt: 1.5, lineHeight: 1.8 }}>
            If you have any questions about this Privacy Policy, please contact 
            support at <strong>support@cbtmaster.com</strong>.
          </Typography>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
}
