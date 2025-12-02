// =====================================
// LandingHero.jsx (Updated: Image Removed + How It Works Added)
// =====================================

import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
  Avatar,
  Chip
} from "@mui/material";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Navbar from "../../components/Navbar";

import AdBlockRaw from "../../components/ads/AdBlockRaw";

export default function LandingHero() {
  const subjects = ["Math", "Physics", "Chemistry", "Biology", "English", "Geography"];

  return (
    <>
      <Navbar />

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        
        {/* ========================= HERO (Image Removed) ========================= */}
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12}>
            <Typography variant="h3" fontWeight={800} gutterBottom>
              Prepare for CBT exams the <strong>smart</strong> way.
            </Typography>

            <Typography variant="h6" color="text.secondary" sx={{ mb: 3, maxWidth: 600 }}>
              Practice real WAEC, JAMB and NECO CBT questions with instant scoring,
              performance analytics and topic-level insights — completely free.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button
                variant="contained"
                size="large"
                href="/practice"
                endIcon={<ArrowForwardIcon />}
                sx={{ borderRadius: 999, px: 4 }}
              >
                Try CBT Exam Free
              </Button>

              <Button
                variant="outlined"
                size="large"
                href="/register"
                sx={{ borderRadius: 999, px: 4 }}
              >
                Create Free Account
              </Button>
            </Stack>
          </Grid>
        </Grid>

        {/* ========================= QUICK LINKS ========================= */}
        <Box sx={{ mt: 7 }}>
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 999,
              px: { xs: 2, md: 4 },
              py: { xs: 1.5, md: 2 },
              display: "flex",
              flexWrap: "wrap",
              gap: 1.5,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Explore:
            </Typography>

            <Chip label="WAEC Guide" component="a" href="/waec" clickable variant="outlined" />
            <Chip label="JAMB Guide" component="a" href="/jamb" clickable variant="outlined" />
            <Chip label="NECO Guide" component="a" href="/neco" clickable variant="outlined" />
            <Chip label="CBT Blog" component="a" href="/blog" clickable variant="outlined" />
            <Chip label="Start Practice" component="a" href="/practice" clickable color="primary" />
          </Paper>
        </Box>

        {/* ========================= POPULAR SUBJECTS ========================= */}
        <Box sx={{ mt: 8 }}>
          <Typography variant="h5" fontWeight={800} gutterBottom>
            Popular Subjects
          </Typography>

          <Grid container spacing={2}>
            {subjects.map((sub, i) => (
              <Grid item xs={6} sm={4} md={2.4} key={i}>
                <Paper
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    textAlign: "center",
                    borderColor: "rgba(148,163,184,0.4)",
                  }}
                  variant="outlined"
                >
                  <Avatar sx={{ mx: "auto", mb: 1 }}>{sub[0]}</Avatar>
                  <Typography fontWeight={600}>{sub}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* ======================= WHY STUDENTS TRUST US ======================= */}
        <Box sx={{ mt: 10 }}>
          <Typography variant="h5" fontWeight={800} gutterBottom>
            Why students trust CBT Master
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700, mb: 4 }}>
            CBT Master combines real exam simulation, past questions and performance analytics
            to help you learn faster and score higher.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography fontWeight={700}>Real Exam Simulation</Typography>
                <Typography color="text.secondary">Timed CBT interface with navigation & scoring.</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography fontWeight={700}>Smart Insights</Typography>
                <Typography color="text.secondary">Identify weak topics and track progress.</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography fontWeight={700}>100% Free to Start</Typography>
                <Typography color="text.secondary">No sign-up required to begin practicing.</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* ========================= ⭐ HOW IT WORKS (NEW) ========================= */}
        <Box sx={{ mt: 12 }}>
          <Typography variant="h5" fontWeight={800} gutterBottom>
            How CBT Master Works
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600 }}>
            Start preparing for WAEC, JAMB and NECO in just three simple steps.
          </Typography>

          <Grid container spacing={4}>
            {/* Step 1 */}
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 3, textAlign: "center", borderRadius: 3 }}>
                <Typography variant="h4" color="primary" fontWeight={800}>1</Typography>
                <Typography variant="h6" fontWeight={700} sx={{ mt: 1 }}>Select Exam & Subject</Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  Choose WAEC, JAMB, NECO or any subject you want to practice.
                </Typography>
              </Paper>
            </Grid>

            {/* Step 2 */}
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 3, textAlign: "center", borderRadius: 3 }}>
                <Typography variant="h4" color="primary" fontWeight={800}>2</Typography>
                <Typography variant="h6" fontWeight={700} sx={{ mt: 1 }}>
                  Practice With Real CBT Interface
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  Timed exams, question navigation, flagging and instant scoring.
                </Typography>
              </Paper>
            </Grid>

            {/* Step 3 */}
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 3, textAlign: "center", borderRadius: 3 }}>
                <Typography variant="h4" color="primary" fontWeight={800}>3</Typography>
                <Typography variant="h6" fontWeight={700} sx={{ mt: 1 }}>
                  Get Instant Results & Improve
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  See your strengths and weaknesses, track your progress over time.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* ========================= FIRST AD ========================= */}
        <Box sx={{ mt: 6 }}>
          <AdBlockRaw
            scriptSrc="//pl28075655.effectivegatecpm.com/c9272b516636923aeedfc69498e5dd37/invoke.js"
            containerId="container-c9272b516636923aeedfc69498e5dd37"
          />
        </Box>

        {/* ========================= EXAM CATEGORIES ========================= */}
        <Box sx={{ mt: 10 }}>
          <Typography variant="h5" fontWeight={800} gutterBottom>
            Exam Categories
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700}>WAEC (SSCE)</Typography>
                <Typography color="text.secondary" sx={{ mt: 1.5 }}>
                  Practice WAEC-style questions across core subjects.
                </Typography>
                <Button href="/waec" sx={{ mt: 1 }}>Open WAEC →</Button>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700}>JAMB (UTME)</Typography>
                <Typography color="text.secondary" sx={{ mt: 1.5 }}>
                  Timed JAMB CBT practice with instant scoring.
                </Typography>
                <Button href="/jamb" sx={{ mt: 1 }}>Open JAMB →</Button>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700}>NECO</Typography>
                <Typography color="text.secondary" sx={{ mt: 1.5 }}>
                  Prepare for NECO using the same CBT engine.
                </Typography>
                <Button href="/neco" sx={{ mt: 1 }}>Open NECO →</Button>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
}
