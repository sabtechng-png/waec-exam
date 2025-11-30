// =====================================
// File: src/pages/LandingPage.jsx
// Modern Minimal (Apple-style) Landing
// =====================================

import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fab,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ChatIcon from "@mui/icons-material/Chat";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Helmet } from "react-helmet";

export default function LandingPage() {
  // Hardcoded content (can later be fetched from backend)
  const subjects = ["Math", "Physics", "Chemistry", "Biology", "English", "Geography"];

  const leaderboard = [
    { full_name: "John Doe", score: 98 },
    { full_name: "Jane Smith", score: 95 },
    { full_name: "Alice Brown", score: 92 },
  ];

  const testimonials = [
    { quote: "This is an amazing platform! I passed my exams with ease.", name: "John Doe" },
    { quote: "The practice tests were very helpful in boosting my confidence.", name: "Jane Smith" },
    { quote: "I love how interactive the platform is. Highly recommended!", name: "Alice Brown" },
  ];

  const faqList = [
    { q: "How do I start a test?", a: "Click on 'Try CBT Exam Free' to begin." },
    {
      q: "What subjects are available?",
      a: "We offer a wide range of subjects, including Math, Physics, Chemistry, and more.",
    },
    {
      q: "Is this the real WAEC / JAMB format?",
      a: "Yes. Our engine simulates real CBT timing, navigation, and scoring.",
    },
  ];

  const blogHighlights = [
    {
      title: "How to Pass JAMB 2025: Complete Strategy Guide",
      desc: "Learn the exact steps to boost your JAMB score using CBT practice, time management and past questions.",
      href: "/blog/how-to-pass-jamb", // future article route
    },
    {
      title: "Top 20 WAEC Physics Questions You Should Not Ignore",
      desc: "Handpicked WAEC-style questions with explanations to strengthen your Physics preparation.",
      href: "/blog/waec-physics-tips", // future article route
    },
    {
      title: "7 Study Habits of High-Scoring Students",
      desc: "Simple daily routines that dramatically improve focus, retention, and exam results.",
      href: "/blog/study-techniques", // future article route
    },
  ];

  return (
    <Box sx={{ bgcolor: "#f7f9fc", minHeight: "100vh" }}>
      {/* ==================== SEO + TAWK.TO SCRIPT VIA HELMET ===================== */}
      <Helmet>
        <title>CBT Master – Free WAEC, JAMB & NECO CBT Practice</title>
        <meta
          name="description"
          content="Prepare for WAEC, JAMB and NECO with CBT Master – a free CBT practice platform with real exam simulation, instant scoring, analytics and progress tracking."
        />
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

      {/* ============================== HERO =============================== */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={6} alignItems="center">
          {/* LEFT SIDE: TEXT + CTA */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="h3"
              fontWeight={800}
              gutterBottom
              sx={{ letterSpacing: "-0.02em" }}
            >
              Prepare for CBT exams
              <br />
              the **smart** way.
            </Typography>

            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 3, maxWidth: 500 }}
            >
              Practice real WAEC, JAMB and NECO CBT questions with instant scoring,
              performance analytics and progress tracking — completely free.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button
                variant="contained"
                size="large"
                href="/practice"
                endIcon={<ArrowForwardIcon />}
                sx={{ borderRadius: 999, textTransform: "none", px: 4, py: 1.2 }}
              >
                Try CBT Exam Free
              </Button>

              <Button
                variant="outlined"
                size="large"
                href="/register"
                sx={{ borderRadius: 999, textTransform: "none", px: 4, py: 1.2 }}
              >
                Create Free Account
              </Button>
            </Stack>

            {/* LIVE STATS */}
            <Stack
              direction="row"
              spacing={4}
              sx={{ mt: 5 }}
              alignItems="center"
            >
              <Box>
                <Typography variant="h4" fontWeight={800} color="primary">
                  10,200+
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Tests taken this week
                </Typography>
              </Box>

              <Box>
                <Typography variant="h4" fontWeight={800}>
                  5,000+
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Students practicing
                </Typography>
              </Box>
            </Stack>
          </Grid>

          {/* RIGHT SIDE: CBT PREVIEW CARD */}
          <Grid item xs={12} md={6}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 4,
                boxShadow: "0 20px 60px rgba(15, 23, 42, 0.08)",
                borderColor: "rgba(148, 163, 184, 0.3)",
              }}
            >
              <CardContent>
                <Typography
                  variant="overline"
                  color="primary"
                  sx={{ letterSpacing: 1 }}
                >
                  Live CBT Preview
                </Typography>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    mt: 2,
                    borderRadius: 3,
                    borderColor: "rgba(148, 163, 184, 0.5)",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Question 12 / 50 · Physics (WAEC Style)
                  </Typography>

                  <Typography variant="h6" sx={{ mt: 1.5 }}>
                    A body is projected vertically upwards with an initial velocity
                    <em> u</em>. What is its velocity at the maximum height?
                  </Typography>

                  <Stack spacing={1.5} sx={{ mt: 2 }}>
                    {["u", "0", "g", "2u"].map((opt, i) => (
                      <Paper
                        key={i}
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          display: "flex",
                          gap: 2,
                          alignItems: "center",
                          borderRadius: 2,
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            bgcolor: "transparent",
                            border: "1px solid",
                            borderColor: "divider",
                            fontSize: 13,
                          }}
                        >
                          {String.fromCharCode(65 + i)}
                        </Avatar>
                        <Typography>{opt}</Typography>
                      </Paper>
                    ))}
                  </Stack>
                </Paper>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1.5, display: "block" }}
                >
                  Simulated preview. Actual CBT includes timing, question review,
                  subject selection and full analytics.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ========================= QUICK LINKS BAR ========================== */}
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

            <Chip
              label="WAEC Guide"
              component="a"
              href="/waec"
              clickable
              variant="outlined"
            />
            <Chip
              label="JAMB Guide"
              component="a"
              href="/jamb"
              clickable
              variant="outlined"
            />
            <Chip
              label="NECO Guide"
              component="a"
              href="/neco"
              clickable
              variant="outlined"
            />
            <Chip
              label="CBT Blog"
              component="a"
              href="/blog"
              clickable
              variant="outlined"
            />
            <Chip
              label="Start Practice"
              component="a"
              href="/practice"
              clickable
              color="primary"
            />
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
                  <Avatar
                    sx={{
                      mx: "auto",
                      mb: 1,
                      bgcolor: "primary.light",
                      color: "primary.dark",
                    }}
                  >
                    {sub[0]}
                  </Avatar>
                  <Typography fontWeight={600}>{sub}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* ======================= WHY CBT MASTER SECTION ===================== */}
        <Box sx={{ mt: 10 }}>
          <Typography variant="h5" fontWeight={800} gutterBottom>
            Why students trust CBT Master
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 700, mb: 4 }}
          >
            CBT Master combines past questions, smart analytics and real CBT
            simulation to help you prepare in a more focused and confident way.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Real Exam Simulation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Practice in the same CBT style you will see in WAEC, JAMB and NECO —
                  including timing, navigation and instant scoring.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Smart Performance Insights
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Track your progress across subjects, topics and sessions and know
                  exactly where you need to improve.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  100% Free to Start
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start practicing instantly without paying anything. Just open,
                  select subject and begin your CBT session.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* ========================= EXAM CATEGORIES ========================== */}
        <Box sx={{ mt: 10 }}>
          <Typography variant="h5" fontWeight={800} gutterBottom>
            Exam categories
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper
                variant="outlined"
                sx={{ p: 3, borderRadius: 3, height: "100%" }}
              >
                <Typography variant="h6" fontWeight={700}>
                  WAEC (SSCE)
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1.5, mb: 2 }}
                >
                  Practice WAEC-style multiple choice questions across core subjects
                  and track your readiness for SSCE.
                </Typography>
                <Button
                  variant="text"
                  href="/waec"
                  sx={{ textTransform: "none", px: 0 }}
                >
                  Open WAEC guide →
                </Button>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                variant="outlined"
                sx={{ p: 3, borderRadius: 3, height: "100%" }}
              >
                <Typography variant="h6" fontWeight={700}>
                  JAMB (UTME)
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1.5, mb: 2 }}
                >
                  Timed JAMB CBT practice with past questions, instant scoring and
                  subject selection to simulate the real exam.
                </Typography>
                <Button
                  variant="text"
                  href="/jamb"
                  sx={{ textTransform: "none", px: 0 }}
                >
                  Open JAMB guide →
                </Button>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                variant="outlined"
                sx={{ p: 3, borderRadius: 3, height: "100%" }}
              >
                <Typography variant="h6" fontWeight={700}>
                  NECO & Others
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1.5, mb: 2 }}
                >
                  Prepare for NECO and other local exams using the same CBT engine
                  and question formats.
                </Typography>
                <Button
                  variant="text"
                  href="/neco"
                  sx={{ textTransform: "none", px: 0 }}
                >
                  Open NECO guide →
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* ================= LEADERBOARD + TESTIMONIALS ====================== */}
        <Grid container spacing={4} sx={{ mt: 10 }}>
          <Grid item xs={12} md={5}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <EmojiEventsIcon color="warning" />
                    <Typography variant="h6" fontWeight={700}>
                      Top students today
                    </Typography>
                  </Stack>
                  <Button href="/leaderboard" size="small" sx={{ textTransform: "none" }}>
                    View all
                  </Button>
                </Stack>

                <List sx={{ mt: 1 }}>
                  {leaderboard.map((t, i) => (
                    <ListItem
                      key={i}
                      disableGutters
                      secondaryAction={
                        <Chip size="small" label={`${t.score}%`} color="primary" />
                      }
                    >
                      <ListItemAvatar>
                        <Avatar>{i + 1}</Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={t.full_name} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* TESTIMONIALS */}
          <Grid item xs={12} md={7}>
            <Typography variant="h6" fontWeight={800} gutterBottom>
              What students say
            </Typography>

            <Grid container spacing={2}>
              {testimonials.map((t, i) => (
                <Grid item xs={12} md={4} key={i}>
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: "100%" }}>
                    <Typography fontStyle="italic">“{t.quote}”</Typography>
                    <Typography sx={{ mt: 2 }} color="text.secondary">
                      — {t.name}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        {/* ======================== FROM OUR BLOG ============================ */}
        <Box sx={{ mt: 10 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
          >
            <Box>
              <Typography variant="h5" fontWeight={800} gutterBottom>
                From our blog
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Read exam strategies, study tips and CBT insights written for students like you.
              </Typography>
            </Box>
            <Button
              variant="text"
              href="/blog"
              sx={{ textTransform: "none" }}
            >
              View all articles →
            </Button>
          </Stack>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            {blogHighlights.map((post, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Paper
                  variant="outlined"
                  sx={{ p: 3, borderRadius: 3, height: "100%" }}
                >
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    {post.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {post.desc}
                  </Typography>
                  <Button
                    variant="text"
                    href={post.href}
                    sx={{ textTransform: "none", px: 0 }}
                  >
                    Read article →
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* ============================ FAQ PREVIEW =========================== */}
        <Box sx={{ mt: 10 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
          >
            <Typography variant="h5" fontWeight={800}>
              Frequently Asked Questions
            </Typography>

            <Button
              variant="text"
              href="/faq"
              sx={{ textTransform: "none" }}
            >
              View all FAQ →
            </Button>
          </Stack>

          {faqList.map((f, i) => (
            <Accordion key={i} sx={{ mt: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={600}>{f.q}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{f.a}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {/* =========================== FINAL CTA ============================== */}
        <Box
          sx={{
            mt: 10,
            mb: 6,
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            textAlign: "center",
            bgcolor: "white",
            border: "1px solid rgba(148,163,184,0.4)",
          }}
        >
          <Typography variant="h5" fontWeight={800} gutterBottom>
            Ready to start practicing smarter?
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: "auto", mb: 3 }}
          >
            Join thousands of students using CBT Master to prepare for WAEC, JAMB
            and NECO with confidence.
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="center"
            spacing={2}
          >
            <Button
              variant="contained"
              size="large"
              href="/practice"
              endIcon={<ArrowForwardIcon />}
              sx={{ borderRadius: 999, textTransform: "none", px: 4, py: 1.2 }}
            >
              Start Free CBT Practice
            </Button>

            <Button
              variant="outlined"
              size="large"
              href="/register"
              sx={{ borderRadius: 999, textTransform: "none", px: 4, py: 1.2 }}
            >
              Create Free Account
            </Button>
          </Stack>
        </Box>
      </Container>

      {/* Floating chat shortcut (extra to Tawk widget) */}
      <Fab color="primary" sx={{ position: "fixed", bottom: 24, right: 24 }}>
        <ChatIcon />
      </Fab>

      <Footer />
    </Box>
  );
}
