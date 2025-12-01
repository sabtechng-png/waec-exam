// =====================================
// File: src/pages/LandingPage.jsx
// Modern Minimal (Apple-style) Landing (Improved SEO + AdSense Safe)
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
import previewImg from "../assets/cbt-preview.png";
import { useEffect } from "react";

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
    { quote: "The practice tests boosted my confidence greatly!", name: "Jane Smith" },
    { quote: "Very interactive and realistic. Highly recommended!", name: "Alice Brown" },
  ];

  const faqList = [
    { q: "How do I start a test?", a: "Click on 'Try CBT Exam Free' to begin." },
    {
      q: "What subjects are available?",
      a: "We support Math, Physics, Chemistry, Biology, English, Geography and more.",
    },
    {
      q: "Is this the real WAEC / JAMB format?",
      a: "Yes. Our CBT system simulates real timing, question navigation and scoring.",
    },
  ];

  const blogHighlights = [
    {
      title: "How to Pass JAMB 2025: Complete Strategy Guide",
      desc: "Practical steps to boost your JAMB score through CBT practice and timing.",
      href: "/blog/how-to-pass-jamb",
    },
    {
      title: "Top 20 WAEC Physics Questions You Should Not Ignore",
      desc: "Essential WAEC-style questions with explanations.",
      href: "/blog/waec-physics-tips",
    },
    {
      title: "7 Study Habits of High-Scoring Students",
      desc: "Simple routines that dramatically improve exam performance.",
      href: "/blog/study-techniques",
    },
  ];
useEffect(() => {
  const script1 = document.createElement("script");
  script1.type = "text/javascript";
  script1.innerHTML = `
    atOptions = {
      'key' : 'efd800066af5754002a75671dd92ec61',
      'format' : 'iframe',
      'height' : 90,
      'width' : 728,
      'params' : {}
    };
  `;
  document.getElementById("ad-container-728x90").appendChild(script1);

  const script2 = document.createElement("script");
  script2.type = "text/javascript";
  script2.src = "//www.highperformanceformat.com/efd800066af5754002a75671dd92ec61/invoke.js";
  document.getElementById("ad-container-728x90").appendChild(script2);
}, []);

  return (
    <Box sx={{ bgcolor: "#f7f9fc", minHeight: "100vh" }}>
      {/* =========================== SEO & OG METADATA =========================== */}
      <Helmet>
        <title>CBT Master – Free WAEC, JAMB & NECO CBT Practice</title>

        <meta
          name="description"
          content="Practice real WAEC, JAMB and NECO CBT questions online with instant scoring, smart analytics, full exam simulation and progress tracking — completely free."
        />

        <meta
          name="keywords"
          content="WAEC CBT, JAMB CBT, NECO CBT, online exam practice, Nigeria CBT practice, free WAEC questions, JAMB 2025 practice, NECO past questions"
        />

        {/* Canonical URL */}
        <link rel="canonical" href="https://www.cbt-master.com.ng/" />

        {/* OpenGraph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="CBT Master – WAEC, JAMB & NECO CBT Practice" />
        <meta
          property="og:description"
          content="Free CBT practice for WAEC, JAMB and NECO with real exam simulation, instant results and analytics."
        />
        <meta property="og:url" content="https://www.cbt-master.com.ng/" />
        <meta property="og:image" content="https://www.cbt-master.com.ng/og-image.png" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="CBT Master – Free WAEC, NECO & JAMB CBT Practice"
        />
        <meta
          name="twitter:description"
          content="Prepare for WAEC, NECO and JAMB exams with free CBT questions and real simulation."
        />
        <meta name="twitter:image" content="https://www.cbt-master.com.ng/og-image.png" />

        <meta name="theme-color" content="#0A3D62" />
      </Helmet>

      <Navbar />

      {/* ============================== HERO =============================== */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={6} alignItems="center">

          {/* RIGHT SIDE IMAGE — appears first on mobile */}
          <Grid
            item
            xs={12}
            md={6}
            order={{ xs: 0, md: 1 }}
            sx={{ textAlign: "center" }}
          >
            <Box
              component="img"
              src={previewImg}

              alt="CBT Master Preview"
              sx={{
                width: "100%",
                maxWidth: 520,
                borderRadius: 4,
                boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
              }}
            />
          </Grid>

          {/* LEFT SIDE TEXT — appears second on mobile */}
          <Grid item xs={12} md={6} order={{ xs: 1, md: 0 }}>
            <Typography
              variant="h3"
              fontWeight={800}
              gutterBottom
              sx={{ letterSpacing: "-0.02em" }}
            >
              Prepare for CBT exams
              <br />
              the <strong>smart</strong> way.
            </Typography>

            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 3, maxWidth: 500 }}
            >
              Practice real WAEC, JAMB and NECO CBT questions with instant scoring,
              performance analysis and progress tracking — completely free.
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

            <Stack direction="row" spacing={4} sx={{ mt: 5 }} alignItems="center">
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

            <Chip label="WAEC Guide" component="a" href="/waec" clickable variant="outlined" />
            <Chip label="JAMB Guide" component="a" href="/jamb" clickable variant="outlined" />
            <Chip label="NECO Guide" component="a" href="/neco" clickable variant="outlined" />
            <Chip label="CBT Blog" component="a" href="/blog" clickable variant="outlined" />
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
                  Experience actual WAEC, JAMB and NECO CBT patterns — timing,
                  navigation and scoring included.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Smart Performance Insights
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Track your progress across subjects and topics. Discover exactly
                  what to improve.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  100% Free to Start
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Open the app, pick a subject and start practicing instantly.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* =============== INLINE AD BLOCK (before Exam Categories) =============== */}
        <Box sx={{ mt: 6, mb: 4, textAlign: "center" }}>
          <div id="container-c9272b516636923aeedfc69498e5dd37"></div>
          <script
            async
            data-cfasync="false"
            src="//pl28075655.effectivegatecpm.com/c9272b516636923aeedfc69498e5dd37/invoke.js"
          ></script>
        </Box>

        {/* ========================= EXAM CATEGORIES ========================== */}
        <Box sx={{ mt: 10 }}>
          <Typography variant="h5" fontWeight={800} gutterBottom>
            Exam categories
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: "100%" }}>
                <Typography variant="h6" fontWeight={700}>
                  WAEC (SSCE)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, mb: 2 }}>
                  Practice WAEC-style multiple choice questions across core subjects.
                </Typography>
                <Button variant="text" href="/waec" sx={{ textTransform: "none", px: 0 }}>
                  Open WAEC guide →
                </Button>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: "100%" }}>
                <Typography variant="h6" fontWeight={700}>
                  JAMB (UTME)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, mb: 2 }}>
                  Timed JAMB CBT practice with past questions and instant scoring.
                </Typography>
                <Button variant="text" href="/jamb" sx={{ textTransform: "none", px: 0 }}>
                  Open JAMB guide →
                </Button>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: "100%" }}>
                <Typography variant="h6" fontWeight={700}>
                  NECO & Others
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, mb: 2 }}>
                  Prepare for NECO and local exams using the same CBT engine.
                </Typography>
                <Button variant="text" href="/neco" sx={{ textTransform: "none", px: 0 }}>
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
                      secondaryAction={<Chip size="small" label={`${t.score}%`} color="primary" />}
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
                Read exam strategies, study tips and CBT insights written for students.
              </Typography>
            </Box>
            <Button variant="text" href="/blog" sx={{ textTransform: "none" }}>
              View all articles →
            </Button>
          </Stack>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            {blogHighlights.map((post, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: "100%" }}>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    {post.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {post.desc}
                  </Typography>
                  <Button variant="text" href={post.href} sx={{ textTransform: "none", px: 0 }}>
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

            <Button variant="text" href="/faq" sx={{ textTransform: "none" }}>
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


<Box sx={{ mt: 4, mb: 4, textAlign: "center" }}>
  <div id="ad-container-728x90"></div>
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


<Box sx={{ mt: 4, mb: 4, textAlign: "center" }}>
  <div id="ad-container-728x90"></div>
</Box>


      {/* SAFE TAWK.TO LOAD (Outside Helmet, below content) */}
      <script
        async
        src="https://embed.tawk.to/6919e24095920719593c9dfc/1ja6hnjj4"
        charset="UTF-8"
        crossOrigin="*"
      ></script>

      {/* Floating chat shortcut */}
      <Fab color="primary" sx={{ position: "fixed", bottom: 24, right: 24 }}>
        <ChatIcon />
      </Fab>

      <Footer />
    </Box>
  );
}
