import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardActionArea,
  CardContent,
} from "@mui/material";
import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";   // ⭐ ADDED

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

      <Container sx={{ py: 6 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Available Subjects
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Browse available CBT subjects. You must login or create an account to begin practice.
        </Typography>

        <Grid container spacing={3}>
          {subjects.map((sub) => (
            <Grid item xs={12} sm={6} md={4} key={sub.id}>
              <Card
                sx={{ borderRadius: 2 }}
                elevation={2}
              >
                <CardActionArea
                  onClick={() => navigate("/register")}
                >
                  <CardContent>
                    <Typography variant="h6" fontWeight={700}>
                      {sub.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Code: {sub.code}
                    </Typography>
                    <Typography sx={{ mt: 1 }} color="primary">
                      Click to start → (Register required)
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Footer />
    </Box>
  );
}
