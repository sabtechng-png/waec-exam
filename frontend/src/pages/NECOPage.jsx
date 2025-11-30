// =====================================================
// File: src/pages/NECOPage.jsx
// NECO Examination Guide Page (Apple-style Minimal)
// SEO-optimized, AdSense-friendly, clean UI
// =====================================================

import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Stack,
  Divider,
  Chip,
} from "@mui/material";
import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Helmet } from "react-helmet";

export default function NECOPage() {
  return (
    <Box sx={{ bgcolor: "#f7f9fc", minHeight: "100vh" }}>
      {/* SEO */}
      <Helmet>
        <title>NECO Guide – Free NECO CBT Practice | CBT Master</title>
        <meta
          name="description"
          content="Prepare for NECO with free CBT practice, high-yield topics, exam format breakdown, and strategies to score high using CBT Master."
        />
      </Helmet>

      <Navbar />

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Header */}
        <Typography variant="h3" fontWeight={800} gutterBottom>
          NECO (SSCE) Examination Guide
        </Typography>

        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ maxWidth: 800, mb: 6 }}
        >
          Learn the NECO exam structure, key topics, and effective preparation
          strategies — plus free NECO-style CBT practice on CBT Master.
        </Typography>

        {/* What is NECO? */}
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            mb: 5,
            borderColor: "rgba(148,163,184,0.3)",
          }}
        >
          <Typography variant="h5" fontWeight={700} gutterBottom>
            What is NECO SSCE?
          </Typography>

          <Typography sx={{ lineHeight: 1.8, mb: 2 }}>
            The National Examinations Council (NECO) conducts the Senior School
            Certificate Examination (SSCE) for students in Nigeria. It tests
            candidates in core subjects like English, Mathematics, Biology,
            Chemistry, Physics, Government, and more.
          </Typography>

          <Typography sx={{ lineHeight: 1.8 }}>
            CBT Master offers NECO-style practice CBT questions that help you
            prepare with real-time scoring, review tools, and topic analytics.
          </Typography>
        </Paper>

        {/* NECO Format */}
        <Typography variant="h5" fontWeight={700} gutterBottom>
          NECO Exam Structure (Updated)
        </Typography>

        <Grid container spacing={3} sx={{ mt: 1, mb: 6 }}>
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Typography fontWeight={700}>Paper 1</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Objective multiple-choice questions for all subjects.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Typography fontWeight={700}>Paper 2</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Theory and essay-type questions depending on the subject.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Typography fontWeight={700}>Paper 3</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Practical exams for sciences and ORAL tests for English.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* High-Yield NECO Topics */}
        <Typography variant="h5" fontWeight={700} gutterBottom>
          High-Yield NECO Topics to Focus On
        </Typography>

        <Paper
          variant="outlined"
          sx={{
            p: 3,
            borderRadius: 3,
            borderColor: "rgba(148,163,184,0.3)",
            mb: 6,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography fontWeight={700} sx={{ mb: 1 }}>
                English Language
              </Typography>
              <Typography component="ul" sx={{ pl: 3 }}>
                <li>Comprehension & Summary</li>
                <li>Lexis & Structure</li>
                <li>Oral English</li>
                <li>Writing Skills</li>
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography fontWeight={700} sx={{ mb: 1 }}>
                Mathematics
              </Typography>
              <Typography component="ul" sx={{ pl: 3 }}>
                <li>Algebra & Functions</li>
                <li>Statistics</li>
                <li>Geometry</li>
                <li>Mensuration</li>
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography fontWeight={700} sx={{ mb: 1 }}>
                Biology / Chemistry
              </Typography>
              <Typography component="ul" sx={{ pl: 3 }}>
                <li>Cell Biology</li>
                <li>Genetics</li>
                <li>Organic Chemistry</li>
                <li>Energy & Reactions</li>
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Strategies */}
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Best Strategies to Pass NECO Successfully
        </Typography>

        <Paper
          variant="outlined"
          sx={{
            p: 3,
            borderRadius: 3,
            borderColor: "rgba(148,163,184,0.3)",
            mb: 6,
            lineHeight: 1.8,
          }}
        >
          <Typography component="ul" sx={{ pl: 3 }}>
            <li>Practice NECO-style questions frequently.</li>
            <li>Use a simple study timetable and follow it consistently.</li>
            <li>Focus on high-yield topics appearing frequently in past exams.</li>
            <li>Review mistakes and attempt weak topics again.</li>
            <li>Write summaries after studying each topic.</li>
            <li>Take full mock CBT exams weekly.</li>
            <li>Prepare early — avoid last-minute pressure.</li>
          </Typography>
        </Paper>

        {/* CTA */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            bgcolor: "white",
            border: "1px solid rgba(148,163,184,0.3)",
            mb: 6,
            textAlign: "center",
          }}
        >
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Ready to start practicing NECO questions?
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Use real NECO-style CBT tests with instant scoring and smart
            analytics.
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
          >
            <Button
              variant="contained"
              size="large"
              href="/practice"
              sx={{ borderRadius: 999, textTransform: "none", px: 4 }}
            >
              Start NECO Practice
            </Button>

            <Button
              variant="outlined"
              size="large"
              href="/blog"
              sx={{ borderRadius: 999, textTransform: "none", px: 4 }}
            >
              Read Study Tips
            </Button>
          </Stack>
        </Paper>

        {/* Internal links */}
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Explore other exams
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mb: 5 }} flexWrap="wrap">
          <Chip label="WAEC Guide" component="a" href="/waec" clickable />
          <Chip label="JAMB Guide" component="a" href="/jamb" clickable />
          <Chip label="CBT Blog" component="a" href="/blog" clickable />
        </Stack>

        <Divider />
      </Container>

      <Footer />
    </Box>
  );
}
