// ==================================
// File: src/pages/TermsPage.jsx
// AdSense-friendly, full Terms & Conditions
// ==================================
import { Box, Container, Typography, Paper } from "@mui/material";
import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Helmet } from "react-helmet";

export default function TermsPage() {
  return (
    <Box sx={{ bgcolor: "#f7f9fc", minHeight: "100vh" }}>
      {/* ==================== CLEAN META ONLY (NO CHAT WIDGETS) ===================== */}
      <Helmet>
        <title>Terms &amp; Conditions - CBT Master</title>
        <meta
          name="description"
          content="Read the terms and conditions governing the use of CBT Master, an online CBT practice platform for WAEC, NECO, JAMB and school exams."
        />
      </Helmet>

      <Navbar />

      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Terms &amp; Conditions
          </Typography>

          <Typography variant="body1" sx={{ mt: 3, lineHeight: 1.85 }}>
            These Terms &amp; Conditions (“Terms”) govern your access to and
            use of CBT Master (“we”, “our”, or “us”) and all related services,
            including practice exams, analytics and account features. By
            accessing or using CBT Master, you agree to be bound by these Terms.
            If you do not agree, you must stop using the platform immediately.
          </Typography>

          {/* 1. ELIGIBILITY */}
          <Typography variant="h5" fontWeight={700} sx={{ mt: 4 }}>
            1. Eligibility
          </Typography>
          <Typography sx={{ mt: 1.5, lineHeight: 1.85 }}>
            You may use CBT Master only if you have the legal capacity to enter
            into a binding agreement under applicable law, or if you are using
            the platform under the supervision and consent of a parent, guardian
            or school representative.
          </Typography>

          {/* 2. USER ACCOUNTS */}
          <Typography variant="h5" fontWeight={700} sx={{ mt: 4 }}>
            2. User Accounts
          </Typography>
          <Typography sx={{ mt: 1.5, lineHeight: 1.85 }}>
            You are responsible for maintaining the confidentiality of your
            login details and for all activities that occur under your account.
            You agree to:
            <br />
            • Provide accurate and up-to-date information during registration{" "}
            <br />
            • Notify us promptly of any unauthorized access or security breach{" "}
            <br />
            CBT Master is not liable for any loss or damage arising from your
            failure to protect your account credentials.
          </Typography>

          {/* 3. USE OF MATERIALS */}
          <Typography variant="h5" fontWeight={700} sx={{ mt: 4 }}>
            3. Use of Content and Materials
          </Typography>
          <Typography sx={{ mt: 1.5, lineHeight: 1.85 }}>
            All questions, explanations, exam interfaces, graphics, code and
            other content on the platform are owned by CBT Master or its
            licensors and are protected by copyright and other intellectual
            property laws. You are granted a limited, non-exclusive,
            non-transferable license to use the platform for personal study
            purposes only. You may not copy, reproduce, distribute, modify,
            resell or publicly display any part of the platform without our
            prior written consent.
          </Typography>

          {/* 4. PROHIBITED ACTIVITIES */}
          <Typography variant="h5" fontWeight={700} sx={{ mt: 4 }}>
            4. Prohibited Activities
          </Typography>
          <Typography sx={{ mt: 1.5, lineHeight: 1.85 }}>
            You agree not to:
            <br />
            • Attempt to hack, bypass or interfere with the platform&apos;s
            security or scoring systems <br />
            • Share your account with others or allow unauthorized access{" "}
            <br />
            • Use bots, scripts or automated tools to take tests or scrape data{" "}
            <br />
            • Upload or transmit any harmful, abusive, illegal or infringing
            content <br />
            • Use CBT Master in any manner that could damage, disable or impair
            the service or its infrastructure
          </Typography>

          {/* 5. SUBSCRIPTIONS & PAYMENTS */}
          <Typography variant="h5" fontWeight={700} sx={{ mt: 4 }}>
            5. Subscriptions and Payments
          </Typography>
          <Typography sx={{ mt: 1.5, lineHeight: 1.85 }}>
            If CBT Master offers paid plans or subscriptions, you agree to pay
            all applicable fees as displayed at the point of purchase. Payment
            processing may be handled by third-party providers subject to their
            own terms and privacy policies. Access to premium features may be
            suspended or terminated if payment is not completed or reversed.
          </Typography>

          {/* 6. REFUNDS */}
          <Typography variant="h5" fontWeight={700} sx={{ mt: 4 }}>
            6. Refund Policy
          </Typography>
          <Typography sx={{ mt: 1.5, lineHeight: 1.85 }}>
            Where applicable, refund requests will be considered in line with
            our refund policy as published on the platform. Certain fees may be
            non-refundable except where required by law.
          </Typography>

          {/* 7. DISCLAIMER */}
          <Typography variant="h5" fontWeight={700} sx={{ mt: 4 }}>
            7. Disclaimer of Warranties
          </Typography>
          <Typography sx={{ mt: 1.5, lineHeight: 1.85 }}>
            CBT Master provides examination practice resources “as is” and “as
            available” without any warranties, express or implied. We do not
            guarantee that:
            <br />
            • Your exam results will improve or that you will pass any exam{" "}
            <br />
            • The platform will be error-free, uninterrupted or always
            available <br />
            • All questions will exactly match future exam questions
          </Typography>

          {/* 8. LIMITATION OF LIABILITY */}
          <Typography variant="h5" fontWeight={700} sx={{ mt: 4 }}>
            8. Limitation of Liability
          </Typography>
          <Typography sx={{ mt: 1.5, lineHeight: 1.85 }}>
            To the maximum extent permitted by law, CBT Master and its officers,
            employees and partners shall not be liable for any indirect,
            incidental, consequential or punitive damages arising from your use
            of, or inability to use, the platform.
          </Typography>

          {/* 9. TERMINATION */}
          <Typography variant="h5" fontWeight={700} sx={{ mt: 4 }}>
            9. Suspension or Termination
          </Typography>
          <Typography sx={{ mt: 1.5, lineHeight: 1.85 }}>
            We may suspend or terminate your access to CBT Master at any time,
            with or without notice, if we believe you have violated these Terms
            or engaged in fraudulent or abusive behaviour. Upon termination, any
            rights granted to you under these Terms will immediately cease.
          </Typography>

          {/* 10. CHANGES TO TERMS */}
          <Typography variant="h5" fontWeight={700} sx={{ mt: 4 }}>
            10. Changes to These Terms
          </Typography>
          <Typography sx={{ mt: 1.5, lineHeight: 1.85 }}>
            We may update or revise these Terms from time to time. The updated
            version will be posted on this page with the effective date. Your
            continued use of the platform after changes are made constitutes
            acceptance of the revised Terms.
          </Typography>

          {/* 11. GOVERNING LAW */}
          <Typography variant="h5" fontWeight={700} sx={{ mt: 4 }}>
            11. Governing Law
          </Typography>
          <Typography sx={{ mt: 1.5, lineHeight: 1.85 }}>
            These Terms shall be governed by and construed in accordance with
            the laws of the Federal Republic of Nigeria, without regard to its
            conflict of law provisions.
          </Typography>

          {/* CONTACT */}
          <Typography sx={{ mt: 5, lineHeight: 1.85 }}>
            For questions or concerns about these Terms &amp; Conditions,
            please contact:
            <br />
            <br />
            <strong>Email:</strong> support@cbt-master.com.ng
          </Typography>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
}
