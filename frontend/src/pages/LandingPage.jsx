import { Box, Button, Card, CardContent, Container, Grid, Paper, Stack, Typography, Avatar, List, ListItem, ListItemAvatar, ListItemText, Chip, Accordion, AccordionSummary, AccordionDetails, Fab } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ChatIcon from "@mui/icons-material/Chat";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Helmet } from "react-helmet"; // ⭐ ADDED

export default function LandingPage() {
  // Hardcoded content
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
    { q: "What subjects are available?", a: "We offer a wide range of subjects, including Math, Physics, Chemistry, and more." },
    { q: "How are the scores calculated?", a: "Your scores are based on the number of correct answers you give during the test." },
  ];

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

      {/* HERO SECTION */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h3" fontWeight={800} gutterBottom>
              Prepare for CBT Exams the Smart Way.
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              Practice real CBT questions with instant scoring & progress—100% free.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="contained"
                size="large"
                href="/practice"
                endIcon={<ArrowForwardIcon />}
                sx={{ borderRadius: 3, textTransform: "none" }}
              >
                Try CBT Exam Free
              </Button>

              <Button
                variant="outlined"
                size="large"
                href="/register"
                sx={{ borderRadius: 3, textTransform: "none" }}
              >
                Create Free Account
              </Button>
            </Stack>

            {/* LIVE STATS */}
            <Stack alignItems="center" sx={{ mt: 4 }}>
              <Typography variant="h3" fontWeight={800} color="primary">
                10,200
              </Typography>
              <Typography color="text.secondary" variant="body2">
                tests taken this week
              </Typography>
            </Stack>
          </Grid>

          {/* LIVE CBT PREVIEW */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ borderRadius: 4 }}>
              <CardContent>
                <Typography variant="overline" color="primary" sx={{ letterSpacing: 1 }}>
                  Live Preview
                </Typography>

                <Paper variant="outlined" sx={{ p: 3, mt: 2, borderRadius: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Question 12 / 50 · Physics
                  </Typography>

                  <Typography variant="h6" sx={{ mt: 1.5 }}>
                    A body is projected vertically upwards with an initial velocity u...
                  </Typography>

                  <Stack spacing={1.5} sx={{ mt: 2 }}>
                    {["u", "0", "g", "2u"].map((opt, i) => (
                      <Paper key={i} variant="outlined" sx={{ p: 1.5, display: "flex", gap: 2 }}>
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            bgcolor: "transparent",
                            border: "1px solid",
                            borderColor: "divider",
                            fontSize: 13
                          }}
                        >
                          {String.fromCharCode(65 + i)}
                        </Avatar>
                        <Typography>{opt}</Typography>
                      </Paper>
                    ))}
                  </Stack>
                </Paper>

                <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: "block" }}>
                  Simulated preview. Actual CBT includes timing, review, and scoring.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* SUBJECTS */}
        <Box sx={{ mt: 8 }}>
          <Typography variant="h5" fontWeight={800} gutterBottom>
            Popular Subjects
          </Typography>

          <Grid container spacing={2}>
            {subjects.map((sub, i) => (
              <Grid item xs={6} sm={4} md={2.4} key={i}>
                <Paper sx={{ p: 2.5, borderRadius: 3, textAlign: "center" }} variant="outlined">
                  <Avatar sx={{ mx: "auto", mb: 1, bgcolor: "primary.light", color: "primary.dark" }}>
                    {sub[0]}
                  </Avatar>
                  <Typography fontWeight={600}>{sub}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* LEADERBOARD */}
        <Grid container spacing={4} sx={{ mt: 3 }}>
          <Grid item xs={12} md={5}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <EmojiEventsIcon color="warning" />
                    <Typography variant="h6" fontWeight={700}>Top Students Today</Typography>
                  </Stack>
                  <Button href="/leaderboard" size="small">View all</Button>
                </Stack>

                <List>
                  {leaderboard.map((t, i) => (
                    <ListItem
                      key={i}
                      disableGutters
                      secondaryAction={
                        <Chip size="small" label={`${t.score}%`} color="primary" />
                      }
                    >
                      <ListItemAvatar><Avatar>{i + 1}</Avatar></ListItemAvatar>
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
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                    <Typography fontStyle="italic">“{t.quote}”</Typography>
                    <Typography sx={{ mt: 2 }} color="text.secondary">— {t.name}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        {/* FAQ */}
        <Box sx={{ mt: 8 }}>
          <Typography variant="h5" fontWeight={800} gutterBottom>FAQ</Typography>

          {faqList.map((f, i) => (
            <Accordion key={i}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>{f.q}</AccordionSummary>
              <AccordionDetails>{f.a}</AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>

      <Fab color="primary" sx={{ position: "fixed", bottom: 24, right: 24 }}>
        <ChatIcon />
      </Fab>

      <Footer />
    </Box>
  );
}
