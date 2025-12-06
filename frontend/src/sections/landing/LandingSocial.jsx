// =====================================
// LandingSocial.jsx
// Leaderboard + Testimonials + Blog + FAQ + Second Ad + CTA
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
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ResponsiveAdsterraBanner from "../../components/ads/ResponsiveAdsterraBanner";

import AdBlockAtOptions from "../../components/ads/AdBlockAtOptions";

export default function LandingSocial() {
  const leaderboard = [
    { full_name: "John Doe", score: 98 },
    { full_name: "Jane Smith", score: 95 },
    { full_name: "Alice Brown", score: 92 }
  ];

  const testimonials = [
    { quote: "This platform helped me pass easily!", name: "John Doe" },
    { quote: "Very interactive and realistic!", name: "Jane Smith" },
    { quote: "Highly recommended!", name: "Alice Brown" }
  ];

  const faqList = [
    { q: "How do I start a test?", a: "Click 'Try CBT Exam Free' to begin." },
    { q: "Is this like real WAEC/JAMB?", a: "Yes, timing and scoring are simulated." },
    { q: "Do I need to register?", a: "Registration is optional for basic tests." }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 10 }}>
      {/* LEADERBOARD */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center">
                <EmojiEventsIcon color="warning" />
                <Typography variant="h6" fontWeight={700}>Top Students</Typography>
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

        {/* TESTIMONIALS */}
        <Grid item xs={12} md={7}>
          <Typography variant="h6" fontWeight={800}>What students say</Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
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

      {/* BLOG SECTION */}
      <Box sx={{ mt: 10 }}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h5" fontWeight={800}>From our blog</Typography>
          <Button href="/blog">View all →</Button>
        </Stack>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography fontWeight={700}>How to Pass JAMB</Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Learn techniques to score higher in UTME.
              </Typography>
              <Button href="/blog/how-to-pass-jamb">Read →</Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography fontWeight={700}>WAEC Physics Tips</Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Top must-answer questions.
              </Typography>
              <Button href="/blog/waec-physics-tips">Read →</Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography fontWeight={700}>Study Habits</Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Habits that boost exam performance.
              </Typography>
              <Button href="/blog/study-techniques">Read →</Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* FAQ */}
      <Box sx={{ mt: 10 }}>
        <Typography variant="h5" fontWeight={800}>FAQ</Typography>

        {faqList.map((f, i) => (
          <Accordion key={i} sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>{f.q}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>{f.a}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {/* ⭐ SECOND AD (ATOPTIONS FORMAT) */}
      <Box sx={{ mt: 6 }}>
        <AdBlockAtOptions
          adKey="efd800066af5754002a75671dd92ec61"
          id="ad-bottom-section"
          width={728}
          height={90}
        />
      </Box>

      {/* FINAL CTA */}
      <Box
        sx={{
          mt: 10,
          mb: 6,
          p: 5,
          borderRadius: 4,
          textAlign: "center",
          bgcolor: "white",
          border: "1px solid rgba(148,163,184,0.4)"
        }}
      >
        <Typography variant="h5" fontWeight={800}>
          Start practicing smarter today!
        </Typography>

        <Typography color="text.secondary" sx={{ maxWidth: 600, mx: "auto", mb: 3 }}>
          Join thousands of students preparing for WAEC, NECO & JAMB.
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="contained"
            size="large"
            href="/practice"
            endIcon={<ArrowForwardIcon />}
            sx={{ borderRadius: 999, px: 4 }}
          >
            Start Free
          </Button>

          <Button
            variant="outlined"
            size="large"
            href="/register"
            sx={{ borderRadius: 999, px: 4 }}
          >
            Create Account
          </Button>
        </Stack>
      </Box>
	
<Box sx={{ mt: 6 }}>
  <ResponsiveAdsterraBanner />
</Box>
	  
	
	  
    </Container>
  );
}
