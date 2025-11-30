// =====================================================
// File: src/pages/WAECPage.jsx
// WAEC Information, Guide & Internal Links Page
// Apple-Style Minimal Layout (AdSense Friendly)
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

export default function WAECPage() {
  return (
    <Box sx={{ bgcolor: "#f7f9fc", minHeight: "100vh" }}>
      {/* SEO */}
      <Helmet>
        <title>WAEC Guide – Free WAEC CBT Practice | CBT Master</title>
        <meta
          name="description"
          content="Prepare for WAEC with free CBT practice, high-yield topics, exam structure, past questions, tips, and study strategies. 100% free on CBT Master."
        />
      </Helmet>

      <Navbar />

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Header */}
        <Typography variant="h3" fontWeight={800} gutterBottom>
          WAEC (SSCE) Examination Guide
        </Typography>

        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ maxWidth: 800, mb: 6 }}
        >
          Everything you need to prepare for WAEC — exam format, high-yield
          topics, study tips, and free CBT practice with real exam simulation.
        </Typography>

        {/* WAEC Overview */}
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
            What is WAEC (SSCE)?
          </Typography>

          <Typography sx={{ lineHeight: 1.8, mb: 2 }}>
            The West African Senior School Certificate Examination (WASSCE)
            evaluates final-year secondary school students across West Africa. It
            includes core subjects like English Language, Mathematics, Physics,
            Chemistry, Biology, and more.
          </Typography>

          <Typography sx={{ lineHeight: 1.8 }}>
            CBT Master provides free, high-quality WAEC-style practice questions
            to help students prepare smarter, faster, and more effectively.
          </Typography>
        </Paper>

        {/* WAEC Structure */}
        <Typography variant="h5" fontWeight={700} gutterBottom>
          WAEC Exam Structure (Updated)
        </Typography>

        <Grid container spacing={3} sx={{ mt: 1, mb: 6 }}>
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Typography fontWeight={700}>Paper 1</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Objective (Multiple Choice) questions for all subjects.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Typography fontWeight={700}>Paper 2</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Theory & essay questions depending on the subject.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Typography fontWeight={700}>Paper 3</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Practical questions for science subjects and ORAL for English.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* High-yield topics */}
        <Typography variant="h5" fontWeight={700} gutterBottom>
          High-Yield WAEC Topics You Must Focus On
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
                Mathematics
              </Typography>
              <Typography component="ul" sx={{ pl: 3, mb: 2 }}>
                <li>Indices & Logarithms</li>
                <li>Algebraic Expressions</li>
                <li>Mensuration</li>
                <li>Trigonometry</li>
                <li>Word Problems</li>
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography fontWeight={700} sx={{ mb: 1 }}>
                English Language
              </Typography>
              <Typography component="ul" sx={{ pl: 3, mb: 2 }}>
                <li>Comprehension</li>
                <li>Lexis & Structure</li>
                <li>Sentence Interpretation</li>
                <li>Oral English</li>
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography fontWeight={700} sx={{ mb: 1 }}>
                Physics
              </Typography>
              <Typography component="ul" sx={{ pl: 3, mb: 2 }}>
                <li>Motion & Forces</li>
                <li>Electricity</li>
                <li>Waves & Optics</li>
                <li>Heat & Thermodynamics</li>
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Practice CTA */}
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
            Ready to start practicing WAEC questions?
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Take free WAEC-style CBT tests with instant scoring and full
            analytics on your weak areas.
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              href="/practice"
              sx={{ borderRadius: 999, textTransform: "none", px: 4 }}
            >
              Start WAEC Practice
            </Button>

            <Button
              variant="outlined"
              size="large"
              href="/blog"
              sx={{ borderRadius: 999, textTransform: "none", px: 4 }}
            >
              Read WAEC Study Tips
            </Button>
          </Stack>
        </Paper>

        {/* Internal Links */}
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Explore other exams
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mb: 5 }} flexWrap="wrap">
          <Chip label="JAMB Guide" component="a" href="/jamb" clickable />
          <Chip label="NECO Guide" component="a" href="/neco" clickable />
          <Chip label="CBT Blog" component="a" href="/blog" clickable />
        </Stack>

        <Divider />
      </Container>

      <Footer />
    </Box>
  );
}
