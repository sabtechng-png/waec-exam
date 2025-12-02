// ==================================================
// PublicSubjects.jsx — Improved (SEO + Schema + AdSense Safe)
// ==================================================
import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Paper,
} from "@mui/material";
import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";

import AdBlockAtOptions from "../components/ads/AdBlockAtOptions";

export default function PublicSubjects() {
  const [subjects, setSubjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const res = await api.get("/public/subjects");
        setSubjects(res.data);
      } catch (error) {
        console.error("Error loading subjects:", error);
      }
    };

    loadSubjects();
  }, []);

  // ========== SEO SCHEMA: LIST OF SUBJECTS ==========
  const subjectSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": subjects.map((s, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": s.name,
    })),
  };

  return (
    <Box sx={{ bgcolor: "#f7f9fc", minHeight: "100vh" }}>
      {/* ========================= SEO ========================= */}
      <Helmet>
        <title>Subjects – CBT Master | Available CBT Subjects</title>

        <meta
          name="description"
          content="Browse all available CBT subjects on CBT Master. Practice WAEC, JAMB, and NECO subjects with real exam-style questions."
        />
        <meta
          name="keywords"
          content="CBT subjects, WAEC subjects, JAMB subjects, NECO practice online"
        />

        <link rel="canonical" href="https://www.cbt-master.com.ng/subjects" />

        {/* OpenGraph */}
        <meta property="og:title" content="Available Subjects – CBT Master" />
        <meta
          property="og:description"
          content="Explore available CBT subjects and prepare for WAEC, NECO, and JAMB examinations."
        />
        <meta property="og:url" content="https://www.cbt-master.com.ng/subjects" />
        <meta property="og:image" content="https://www.cbt-master.com.ng/og-image.png" />
        <meta property="og:type" content="website" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />

        {/* JSON-LD SCHEMA */}
        <script type="application/ld+json">{JSON.stringify(subjectSchema)}</script>
      </Helmet>
      {/* ========================================================= */}

      <Navbar />

      <Container sx={{ py: 6 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Available Subjects
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600 }}>
          Browse the available CBT subjects below. To begin a test, you must create
          a free account or login.
        </Typography>

        {/* ============= EMPTY STATE ============= */}
        {subjects.length === 0 && (
          <Paper
            variant="outlined"
            sx={{
              p: 4,
              borderRadius: 3,
              textAlign: "center",
              color: "text.secondary",
            }}
          >
            <Typography>No subjects available at the moment.</Typography>
          </Paper>
        )}

        {/* ============= SUBJECT GRID ============= */}
        <Grid container spacing={3}>
          {subjects.map((sub) => (
            <Grid item xs={12} sm={6} md={4} key={sub.id}>
              <Card
                elevation={1}
                sx={{
                  borderRadius: 3,
                  ":hover": {
                    transform: "translateY(-4px)",
                    transition: "0.2s ease-in-out",
                  },
                }}
              >
                <CardActionArea onClick={() => navigate("/register")}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700}>
                      {sub.name}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Code: {sub.code}
                    </Typography>

                    <Typography sx={{ mt: 1.5 }} color="primary" fontWeight={600}>
                      Click to begin → (Login required)
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
     {/* ⭐ SECOND AD (ATOPTIONS FORMAT) */}
      <Box sx={{ mt: 6 }}>
        <AdBlockAtOptions
          adKey="efd800066af5754002a75671dd92ec61"
          id="ad-bottom-section"
          width={728}
          height={90}
        />
      </Box>
      {/* ================== SAFE TAWK SCRIPT ================== */}
      <script
        async
        src="https://embed.tawk.to/6919e24095920719593c9dfc/1ja6hnjj4"
        charset="UTF-8"
        crossOrigin="*"
      ></script>

      <Footer />
    </Box>
  );
}
