// =====================================================
// File: src/pages/JAMBPage.jsx
// JAMB Examination Guide Page (Apple-style Minimal)
// AdSense-friendly, clean, SEO-optimized
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

export default function JAMBPage() {
  return (
    <Box sx={{ bgcolor: "#f7f9fc", minHeight: "100vh" }}>
      {/* SEO */}
      <Helmet>
        <title>JAMB Guide – Free JAMB CBT Practice | CBT Master</title>
        <meta
          name="description"
          content="Prepare for JAMB UTME with free CBT practice, past questions, high-yield topics, study strategies and exam-day techniques to help you score 250+."
        />
      </Helmet>

      <Navbar />

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Header */}
        <Typography variant="h3" fontWeight={800} gutterBottom>
          JAMB UTME Examination Guide
        </Typography>

        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ maxWidth: 800, mb: 6 }}
        >
          A complete guide to scoring high in JAMB — understand the exam
          structure, subject combinations, scoring patterns, and take free JAMB
          CBT practice using real exam simulation.
        </Typography>

        {/* What is JAMB UTME? */}
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
            What is JAMB UTME?
          </Typography>

          <Typography sx={{ lineHeight: 1.8, mb: 2 }}>
            The Joint Admissions and Matriculation Board (JAMB) conducts the
            Unified Tertiary Matriculation Examination (UTME), a computer-based
            test used for admissions into Nigerian universities, polytechnics,
            and colleges of education.
          </Typography>

          <Typography sx={{ lineHeight: 1.8 }}>
            CBT Master provides free JAMB-style CBT practice questions that
            simulate timing, scoring, navigation and difficulty levels of the
            real exam.
          </Typography>
        </Paper>

        {/* JAMB Structure */}
        <Typography variant="h5" fontWeight={700} gutterBottom>
          JAMB Exam Structure (2025-compliant)
        </Typography>

        <Grid container spacing={3} sx={{ mt: 1, mb: 6 }}>
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Typography fontWeight={700}>Subjects</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                English Language (compulsory) + 3 additional subjects depending
                on your course.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Typography fontWeight={700}>Questions</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                About 180–200 multiple choice questions across all subjects.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Typography fontWeight={700}>Time</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Approximately 120 minutes for the entire exam (CBT-based).
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* High yield topics */}
        <Typography variant="h5" fontWeight={700} gutterBottom>
          High-Yield JAMB Topics You Should Focus On
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
              <Typography component="ul" sx={{ pl: 3, mb: 2 }}>
                <li>Comprehension & Summary</li>
                <li>Lexis & Structure</li>
                <li>Oral English</li>
                <li>Cloze Test</li>
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography fontWeight={700} sx={{ mb: 1 }}>
                Mathematics
              </Typography>
              <Typography component="ul" sx={{ pl: 3, mb: 2 }}>
                <li>Algebra & Indices</li>
                <li>Logarithms</li>
                <li>Functions & Graphs</li>
                <li>Geometry & Trigonometry</li>
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography fontWeight={700} sx={{ mb: 1 }}>
                Physics / Chemistry
              </Typography>
              <Typography component="ul" sx={{ pl: 3, mb: 2 }}>
                <li>Motion, Forces & Energy</li>
                <li>Electricity & Waves</li>
                <li>Stoichiometry</li>
                <li>Organic Chemistry</li>
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Best strategies */}
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Best Strategies to Score 250+ in JAMB
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
          <Typography component="ul" sx={{ pl: 3, lineHeight: 1.9 }}>
            <li>Practice CBT daily (timed sessions).</li>
            <li>Study with a realistic timetable.</li>
            <li>Focus on high-yield topics first.</li>
            <li>Take full mock exams weekly.</li>
            <li>Review all wrong answers consistently.</li>
            <li>Use elimination technique for hard questions.</li>
            <li>Improve reading speed (very important for English).</li>
          </Typography>
        </Paper>

        {/* CTA section */}
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
            Ready to start practicing JAMB questions?
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Train yourself using real CBT exam simulation and smart performance
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
              Start JAMB Practice
            </Button>

            <Button
              variant="outlined"
              size="large"
              href="/blog/how-to-pass-jamb"
              sx={{ borderRadius: 999, textTransform: "none", px: 4 }}
            >
              Read JAMB Study Guide
            </Button>
          </Stack>
        </Paper>

        {/* Internal links */}
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Explore other exams
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mb: 5 }} flexWrap="wrap">
          <Chip label="WAEC Guide" component="a" href="/waec" clickable />
          <Chip label="NECO Guide" component="a" href="/neco" clickable />
          <Chip label="CBT Blog" component="a" href="/blog" clickable />
        </Stack>

        <Divider />
      </Container>

      <Footer />
    </Box>
  );
}
