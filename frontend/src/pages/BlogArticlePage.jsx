// ======================================================================
// File: src/pages/BlogArticlePage.jsx
// Clean, Modular, Apple-Style Article Page (Supports Unlimited Articles)
// ======================================================================

import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Divider,
  Button,
} from "@mui/material";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Helmet } from "react-helmet";

// === Import modular article components ===
import HowToPassJamb from "../articles/HowToPassJamb";
import WaecPhysicsTips from "../articles/WaecPhysicsTips";
import StudyTechniques from "../articles/StudyTechniques";
import WaecEnglishGuide from "../articles/WaecEnglishGuide";
import WaecMathsGuide from "../articles/WaecMathsGuide";
import StudyMotivation from "../articles/StudyMotivation";




export default function BlogArticlePage() {
  const { articleId } = useParams();

const ARTICLES = {
  "how-to-pass-jamb": {
    title: "How to Pass JAMB 2026: Complete Strategy Guide",
    description:
      "A practical, step-by-step guide showing you how to prepare smartly for JAMB 2026.",
    image: "https://source.unsplash.com/featured/?students,exam,cbt",
    component: <HowToPassJamb />,
  },

  "waec-physics-tips": {
    title: "Top 20 WAEC Physics Questions You Should Not Ignore",
    description:
      "High-frequency WAEC Physics questions with explanations.",
    image: "https://source.unsplash.com/featured/?physics,classroom",
    component: <WaecPhysicsTips />,
  },

  "study-techniques": {
    title: "7 Study Habits of High-Scoring Students",
    description:
      "Scientifically proven study techniques used by top-performing students.",
    image: "https://source.unsplash.com/featured/?study,books,library",
    component: <StudyTechniques />,
  },

  // ⭐ ADD WAEC ENGLISH HERE
  "waec-english-guide": {
    title: "WAEC English Language – Complete Master Guide",
    description:
      "A complete guide covering comprehension, summary, lexis, structure, oral English, and continuous writing.",
    image: "https://source.unsplash.com/featured/?english,writing,books",
    component: <WaecEnglishGuide />,
  },
  
  "waec-maths-guide": {
  title: "WAEC Mathematics – Complete Master Guide",
  description:
    "Learn the most important WAEC maths topics, formulas, and exam-style questions with full explanations.",
  image: "https://source.unsplash.com/featured/?mathematics,math,geometry",
  component: <WaecMathsGuide />,
},
"study-motivation": {
  title: "How to Stay Motivated to Study – Proven Techniques",
  description:
    "Learn psychology-backed strategies to stay energized, focused, and consistent in your study routine.",
  image: "https://source.unsplash.com/featured/?motivation,study,focus",
  component: <StudyMotivation />,
},


};


  const article = ARTICLES[articleId];

  // ===================== HANDLE NOT FOUND =====================
  if (!article) {
    return (
      <Box sx={{ bgcolor: "#f7f9fc", minHeight: "100vh" }}>
        <Navbar />
        <Container sx={{ py: 10 }}>
          <Typography variant="h4" fontWeight={800}>
            Article Not Found
          </Typography>
          <Typography sx={{ mt: 2 }}>
            The article you’re looking for does not exist or is not yet published.
          </Typography>
          <Button href="/blog" variant="text" sx={{ mt: 3 }}>
            ← Back to blog
          </Button>
        </Container>
        <Footer />
      </Box>
    );
  }

  // ====================================================================
  // RENDER: ARTICLE VIEW PAGE
  // ====================================================================
  return (
    <Box sx={{ bgcolor: "#f7f9fc", minHeight: "100vh" }}>
      <Helmet>
        <title>{article.title} - CBT Master Blog</title>
        <meta name="description" content={article.description} />
      </Helmet>

      <Navbar />

      <Container maxWidth="md" sx={{ py: 8 }}>
        {/* ================== HEADER ================== */}
        <Typography
          variant="h3"
          fontWeight={800}
          sx={{ letterSpacing: "-0.02em", mb: 2 }}
        >
          {article.title}
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 700, mb: 4 }}
        >
          {article.description}
        </Typography>

        <Paper
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            mb: 5,
            boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
          }}
        >
          <img
            src={article.image}
            alt={article.title}
            style={{ width: "100%", height: "auto" }}
          />
        </Paper>

        {/* ================== MAIN ARTICLE CONTENT ================== */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 4 },
            borderRadius: 4,
            bgcolor: "white",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <Box component="article" sx={{ lineHeight: 1.8, fontSize: 16 }}>
            {article.component}
          </Box>
        </Paper>

        {/* ================== RELATED ARTICLES ================== */}
        <Box sx={{ mt: 6 }}>
          <Divider sx={{ mb: 4 }} />

          <Typography variant="h6" fontWeight={700} gutterBottom>
            Related articles
          </Typography>

          <Stack spacing={1.5}>
            {Object.keys(ARTICLES).map((key) =>
              key === articleId ? null : (
                <Button
                  key={key}
                  href={`/blog/${key}`}
                  variant="text"
                  sx={{ textTransform: "none" }}
                >
                  {ARTICLES[key].title} →
                </Button>
              )
            )}
          </Stack>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
}
