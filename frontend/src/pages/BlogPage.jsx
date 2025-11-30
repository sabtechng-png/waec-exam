// ======================================================================
// File: src/pages/BlogPage.jsx
// Blog Home Page — Featured Post + Search + Category Filter + Article Grid
// ======================================================================

import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Stack,
  Button,
} from "@mui/material";

import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Helmet } from "react-helmet";

// === IMPORT ARTICLES ===
import HowToPassJamb from "../articles/HowToPassJamb";
import WaecPhysicsTips from "../articles/WaecPhysicsTips";
import StudyTechniques from "../articles/StudyTechniques";
import WaecEnglishGuide from "../articles/WaecEnglishGuide";
import WaecMathsGuide from "../articles/WaecMathsGuide";
import StudyMotivation from "../articles/StudyMotivation";
import CareerGuide from "../articles/CareerGuide";

// === BLOG POSTS METADATA ===
const BLOG_POSTS = [
  {
    slug: "how-to-pass-jamb",
    title: "How to Pass JAMB 2026: Complete Strategy Guide",
    category: "JAMB",
    image: "https://source.unsplash.com/featured/?students,exam,cbt",
    component: <HowToPassJamb />,
  },
  {
    slug: "waec-physics-tips",
    title: "Top 20 WAEC Physics Questions You Should Not Ignore",
    category: "WAEC",
    image: "https://source.unsplash.com/featured/?physics,classroom",
    component: <WaecPhysicsTips />,
  },
  {
    slug: "study-techniques",
    title: "7 Study Habits of High-Scoring Students",
    category: "Study Tips",
    image: "https://source.unsplash.com/featured/?study,books,library",
    component: <StudyTechniques />,
  },
  {
    slug: "waec-english-guide",
    title: "WAEC English Language – Complete Master Guide",
    category: "WAEC",
    image: "https://source.unsplash.com/featured/?english,notes,study",
    component: <WaecEnglishGuide />,
  },
  {
    slug: "waec-maths-guide",
    title: "WAEC Mathematics – Complete Master Guide",
    category: "WAEC",
    image: "https://source.unsplash.com/featured/?mathematics,geometry",
    component: <WaecMathsGuide />,
  },
  {
    slug: "study-motivation",
    title: "How to Stay Motivated to Study – Proven Techniques",
    category: "Study Tips",
    image: "https://source.unsplash.com/featured/?motivation,focus,students",
    component: <StudyMotivation />,
  },
  {
    slug: "career-guide",
    title: "How to Choose the Right Course and Career Path in Nigeria",
    category: "Career",
    image: "https://source.unsplash.com/featured/?career,future,students",
    component: <CareerGuide />,
  },
];

export default function BlogPage() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const categories = ["All", "WAEC", "JAMB", "Study Tips", "Career"];

  // === CATEGORY FILTER ===
  let filteredPosts =
    category === "All"
      ? BLOG_POSTS
      : BLOG_POSTS.filter((post) => post.category === category);

  // === SEARCH FILTER ===
  if (search.trim() !== "") {
    const s = search.toLowerCase();
    filteredPosts = filteredPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(s) ||
        post.category.toLowerCase().includes(s)
    );
  }

  // Featured post (first item)
  const featured = BLOG_POSTS[0];

  return (
    <Box sx={{ bgcolor: "#f7f9fc", minHeight: "100vh" }}>
      <Helmet>
        <title>CBT Master Blog — Study Guides, WAEC & JAMB Tips</title>
        <meta
          name="description"
          content="Explore powerful study guides, WAEC tips, JAMB strategies, motivation articles, and career advice for Nigerian students."
        />
      </Helmet>

      <Navbar />

      {/* ===================== FEATURED SECTION ===================== */}
      <Container sx={{ pt: 10, pb: 6 }}>
        <Grid container spacing={5} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="overline" sx={{ color: "gray" }}>
              FEATURED ARTICLE
            </Typography>

            <Typography
              variant="h3"
              fontWeight={800}
              sx={{ mb: 2, letterSpacing: "-0.03em" }}
            >
              {featured.title}
            </Typography>

            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Smart strategies, expert guidance, and proven methods to boost
              your examination performance.
            </Typography>

            <Button
              href={`/blog/${featured.slug}`}
              variant="contained"
              sx={{ borderRadius: 3, px: 4, py: 1.5 }}
            >
              Read Now →
            </Button>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                overflow: "hidden",
                height: 350,
                boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
              }}
            >
              <CardMedia
                component="img"
                src={featured.image}
                alt={featured.title}
                sx={{ height: "100%", width: "100%", objectFit: "cover" }}
              />
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* ===================== SEARCH BAR ===================== */}
      <Container sx={{ pb: 3 }}>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              maxWidth: "600px",
              padding: "14px 18px",
              borderRadius: "12px",
              border: "1px solid #ccc",
              fontSize: "16px",
              outline: "none",
              transition: "0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#1976d2")}
            onBlur={(e) => (e.target.style.borderColor = "#ccc")}
          />
        </Box>
      </Container>

      {/* ===================== CATEGORY FILTER ===================== */}
      <Container sx={{ pb: 4 }}>
        <Stack
          direction="row"
          spacing={2}
          sx={{ overflowX: "auto", pb: 1 }}
        >
          {categories.map((c) => (
            <Chip
              key={c}
              label={c}
              clickable
              onClick={() => {
                setCategory(c);
                setSearch("");
              }}
              color={category === c ? "primary" : "default"}
              sx={{
                fontWeight: category === c ? 700 : 500,
                borderRadius: 3,
                px: 1,
              }}
            />
          ))}
        </Stack>
      </Container>

      {/* ===================== BLOG POSTS GRID ===================== */}
      <Container sx={{ pb: 10 }}>
        <Grid container spacing={4}>
          {filteredPosts.length === 0 && (
            <Box sx={{ width: "100%", textAlign: "center", py: 6 }}>
              <Typography variant="h6" color="text.secondary">
                No articles found.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try another keyword.
              </Typography>
            </Box>
          )}

          {filteredPosts.map((post) => (
            <Grid item xs={12} sm={6} md={4} key={post.slug}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 4,
                  overflow: "hidden",
                  border: "1px solid rgba(0,0,0,0.08)",
                  transition: "0.2s",
                  "&:hover": { boxShadow: "0 6px 25px rgba(0,0,0,0.1)" },
                }}
              >
                <CardMedia
                  component="img"
                  height="180"
                  image={post.image}
                  alt={post.title}
                />

                <CardContent>
                  <Chip
                    label={post.category}
                    size="small"
                    sx={{ mb: 1, borderRadius: 2 }}
                  />

                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{
                      mb: 1,
                      height: 50,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {post.title}
                  </Typography>

                  <Button
                    href={`/blog/${post.slug}`}
                    variant="text"
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    Read More →
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Footer />
    </Box>
  );
}
