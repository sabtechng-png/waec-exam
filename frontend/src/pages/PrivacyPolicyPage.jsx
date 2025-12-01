// ==================================
// File: src/pages/PrivacyPolicyPage.jsx
// Fully AdSense-Compliant Privacy Policy
// ==================================
import { Box, Container, Typography, Paper } from "@mui/material";
import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Helmet } from "react-helmet";

export default function PrivacyPolicyPage() {
  return (
    <Box sx={{ bgcolor: "#f7f9fc", minHeight: "100vh" }}>
      {/* ==================== CLEAN PAGE FOR ADSENSE (NO CHAT WIDGETS) ===================== */}
      <Helmet>
        <title>Privacy Policy - CBT Master</title>
        <meta
          name="description"
          content="Learn how CBT Master collects, uses, and protects your personal information when you use our examination practice platform."
        />
      </Helmet>

      <Navbar />

      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Privacy Policy
          </Typography>

          <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.85 }}>
            This Privacy Policy explains how CBT Master (“we”, “our”, or
            “us”) collects, uses, stores, and protects your personal
            information. By accessing or using our platform, you agree to the
            practices outlined in this policy.
          </Typography>

          {/* ========================= WHAT WE COLLECT ========================= */}
          <Typography variant="h5" fontWeight={700} sx={{ mt: 5 }}>
            Information We Collect
          </Typography>
          <Typography variant="body1" sx={{ mt: 1.5, lineHeight: 1.85 }}>
            We may collect the following information when you use CBT Master:
            <br />
            • Personal details such as name and email address <br />
            • Login data including Google OAuth profile (name & email only){" "}
            <br />
            • CBT performance data such as scores, attempts, and timing <br />
            • Device information including browser type and IP address <br />
            • Usage analytics to improve platform performance <br />
            • Payment information (if subscription or payment services are
            activated)
          </Typography>

          {/* ========================= HOW WE USE INFO ========================= */}
          <Typography variant="h5" fontWeight={700} sx={{ mt: 5 }}>
            How We Use Your Information
          </Typography>
          <Typography variant="body1" sx={{ mt: 1.5, lineHeight: 1.85 }}>
            • To create and manage your account <br />
            • To personalize your exam practice experience <br />
            • To track performance and generate progress analytics <br />
            • To maintain platform security and prevent fraud <br />
            • To communicate updates, improvements, and important notices{" "}
            <br />
            • To comply with regulatory or legal obligations
          </Typography>

          {/* ========================= COOKIES ========================= */}
          <Typography variant="h5" fontWeight={700} sx={{ mt: 5 }}>
            Cookies and Tracking Technologies
          </Typography>
          <Typography variant="body1" sx={{ mt: 1.5, lineHeight: 1.85 }}>
            CBT Master uses cookies and similar technologies to:
            <br />
            • Keep users logged in <br />
            • Enable core platform functionality <br />
            • Analyze site usage and performance <br />
            • Support Google Analytics measurement <br />
            • Enhance user experience
            <br />
            You may disable cookies in your browser settings, but some features
            may not work properly.
          </Typography>

          {/* ========================= ADSENSE DISCLOSURE ========================= */}
          <Typography variant="h5" fontWeight={700} sx={{ mt: 5 }}>
            Google AdSense and Third-Party Advertising
          </Typography>
          <Typography variant="body1" sx={{ mt: 1.5, lineHeight: 1.85 }}>
            We use Google AdSense to display advertising. Google may use
            cookies, including the DoubleClick cookie, to:
            <br />
            • Serve personalized ads based on your activity <br />
            • Limit repetitive ads <br />
            • Measure ad performance
            <br />
            Users may opt out of personalized advertising by visiting Google’s
            Ads Settings page.
          </Typography>

          {/* ========================= DATA PROTECTION ========================= */}
          <Typography variant="h5" fontWeight={700} sx={{ mt: 5 }}>
            How We Protect Your Data
          </Typography>
          <Typography variant="body1" sx={{ mt: 1.5, lineHeight: 1.85 }}>
            Your information is protected using:
            <br />
            • Encrypted storage (at rest and in transit) <br />
            • Secure authentication protocols <br />
            • Restricted access to personal data <br />
            • Regular security updates and monitoring
            <br />
            We do not sell, rent, or trade your personal information.
          </Typography>

          {/* ========================= CHILDREN ========================= */}
          <Typography variant="h5" fontWeight={700} sx={{ mt: 5 }}>
            Children’s Privacy
          </Typography>
          <Typography variant="body1" sx={{ mt: 1.5, lineHeight: 1.85 }}>
            CBT Master is intended for students preparing for WAEC, NECO,
            JAMB, and similar examinations. We do not knowingly collect data
            from children under the age of 13 without parental consent.
          </Typography>

          {/* ========================= USER RIGHTS ========================= */}
          <Typography variant="h5" fontWeight={700} sx={{ mt: 5 }}>
            Your Rights
          </Typography>
          <Typography variant="body1" sx={{ mt: 1.5, lineHeight: 1.85 }}>
            Subject to applicable laws, you may request to:
            <br />
            • Access your personal information <br />
            • Update or correct your data <br />
            • Request deletion of your account <br />
            • Opt out of marketing emails <br />
            • Request an export of your data
          </Typography>

          {/* ========================= CONTACT US ========================= */}
          <Typography variant="h5" fontWeight={700} sx={{ mt: 5 }}>
            Contact Us
          </Typography>
          <Typography variant="body1" sx={{ mt: 1.5, lineHeight: 1.85 }}>
            For questions, concerns, or privacy-related requests, please
            contact:
            <br />
            <br />
            <strong>Email:</strong> support@cbt-master.com.ng <br />
            <strong>Website:</strong> https://www.cbt-master.com.ng
          </Typography>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
}
