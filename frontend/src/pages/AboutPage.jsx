// ==================================
// File: src/pages/AboutPage.jsx
// AdSense-friendly, SEO-optimized About Page
// ==================================
import { Box, Container, Typography, Paper, Stack } from "@mui/material";
import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Helmet } from "react-helmet";

export default function AboutPage() {
  return (
    <Box sx={{ bgcolor: "#f7f9fc", minHeight: "100vh" }}>
      {/* ==================== SEO META (NO CHAT WIDGETS HERE) ===================== */}
      <Helmet>
        <title>About CBT Master - WAEC, NECO & JAMB CBT Practice Platform</title>
        <meta
          name="description"
          content="CBT Master is an online CBT practice platform that helps students prepare for WAEC, NECO, JAMB and school exams using realistic computer-based tests, instant marking and performance analytics."
        />
      </Helmet>

      <Navbar />

      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            About CBT Master
          </Typography>

          <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.85 }}>
            CBT Master is a dedicated online examination practice platform
            designed to help students prepare confidently for WAEC, NECO, JAMB
            UTME and school-based assessments. We provide a structured,
            computer-based testing environment that mirrors real exam conditions
            so that students are familiar with the CBT format before the actual
            examination day.
          </Typography>

          {/* ==================== MISSION ==================== */}
          <Typography variant="h5" fontWeight={700} sx={{ mt: 5 }}>
            Our Mission
          </Typography>
          <Typography variant="body1" sx={{ mt: 1.5, lineHeight: 1.85 }}>
            Our mission is to make high–quality exam preparation accessible to
            every student, regardless of location or background. By combining
            past questions, realistic CBT simulations and clear feedback, we
            aim to reduce exam anxiety and help learners build the consistency,
            speed and accuracy required to excel.
          </Typography>

          {/* ==================== WHAT WE OFFER ==================== */}
          <Typography variant="h5" fontWeight={700} sx={{ mt: 5 }}>
            What We Offer
          </Typography>

          <Stack spacing={1.5} sx={{ mt: 2, lineHeight: 1.7 }}>
            <Typography>
              • A growing bank of carefully curated WAEC, NECO and JAMB
              questions
            </Typography>
            <Typography>
              • Realistic computer-based tests with smart timing and navigation
            </Typography>
            <Typography>
              • Instant marking and clear score summaries after each session
            </Typography>
            <Typography>
              • Performance insights to highlight strengths and topics that need
              more revision
            </Typography>
            <Typography>
              • Flexible practice modes for both quick revision and full mock
              exams
            </Typography>
            <Typography>
              • A mobile-friendly interface so students can practice anytime,
              anywhere
            </Typography>
          </Stack>

          {/* ==================== HOW CBT MASTER HELPS STUDENTS ==================== */}
          <Typography variant="h5" fontWeight={700} sx={{ mt: 5 }}>
            How CBT Master Helps Students
          </Typography>
          <Typography variant="body1" sx={{ mt: 1.5, lineHeight: 1.85 }}>
            With repeated exposure to real exam-style questions and timed CBT
            sessions, students become more comfortable with the interface, the
            question style and the time pressure they will face in the hall.
            This familiarity allows them to focus on what really matters on exam
            day: applying what they have learned.
          </Typography>

          {/* ==================== OUR VISION ==================== */}
          <Typography variant="h5" fontWeight={700} sx={{ mt: 5 }}>
            Our Vision
          </Typography>
          <Typography variant="body1" sx={{ mt: 1.5, lineHeight: 1.85 }}>
            We envision CBT Master as a trusted digital companion for schools,
            parents and students across Africa. Our long–term goal is to
            support millions of learners with reliable CBT practice tools,
            high–quality questions and data-driven insights that contribute to
            better educational outcomes.
          </Typography>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
}
