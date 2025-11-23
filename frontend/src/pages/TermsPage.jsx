// ==================================
// File: src/pages/TermsPage.jsx
// ==================================
import { Box, Container, Typography, Paper } from "@mui/material";
import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Helmet } from "react-helmet";   // ⭐ ADDED

export default function TermsPage() {
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
            Terms & Conditions
          </Typography>

          <Typography variant="body1" sx={{ mt: 3, lineHeight: 1.8 }}>
            By using CBT Master, you agree to comply with and be bound by the
            following terms and conditions. These terms govern all access to
            our services, including practice exams, performance analytics, and
            account-related features.
          </Typography>

          <Typography variant="h5" fontWeight={700} sx={{ mt: 4 }}>
            1. Acceptance of Use
          </Typography>
          <Typography sx={{ mt: 1.5, lineHeight: 1.8 }}>
            Accessing or using the platform constitutes acceptance of these
            terms. If you do not agree, you must stop using the service
            immediately.
          </Typography>

          <Typography variant="h5" fontWeight={700} sx={{ mt: 4 }}>
            2. User Accounts
          </Typography>
          <Typography sx={{ mt: 1.5, lineHeight: 1.8 }}>
            You are responsible for maintaining the confidentiality of your
            account details. CBT Master is not liable for unauthorized access
            caused by negligence in managing login credentials.
          </Typography>

          <Typography variant="h5" fontWeight={700} sx={{ mt: 4 }}>
            3. Use of Materials
          </Typography>
          <Typography sx={{ mt: 1.5, lineHeight: 1.8 }}>
            All questions, answers, content, and analytics belong to CBT Master.
            Users may not copy, distribute, or sell any part of the platform
            without permission.
          </Typography>

          <Typography variant="h5" fontWeight={700} sx={{ mt: 4 }}>
            4. Prohibited Activities
          </Typography>
          <Typography sx={{ mt: 1.5, lineHeight: 1.8 }}>
            • Attempting to hack, bypass, or manipulate results  
            • Sharing accounts with others  
            • Using bots or scripts to take tests  
            • Uploading harmful or illegal content  
          </Typography>

          <Typography variant="h5" fontWeight={700} sx={{ mt: 4 }}>
            5. Limitation of Liability
          </Typography>
          <Typography sx={{ mt: 1.5, lineHeight: 1.8 }}>
            CBT Master provides practice resources but does not guarantee exam
            scores. Users are responsible for how they apply the material.
          </Typography>

          <Typography variant="h5" fontWeight={700} sx={{ mt: 4 }}>
            6. Updates to Terms
          </Typography>
          <Typography sx={{ mt: 1.5, lineHeight: 1.8 }}>
            We may update these terms occasionally. Continued use of the
            platform signifies acceptance of the updated version.
          </Typography>

          <Typography sx={{ mt: 5 }}>
            For inquiries, contact:  
            <strong>support@cbtmaster.com</strong>
          </Typography>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
}
