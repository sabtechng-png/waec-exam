import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Typography,
  Paper,
  Divider,
  Grid,
} from "@mui/material";

export default function EnglishExamPage() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState(null);
  const [sections, setSections] = useState([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(60 * 60);

  const currentSection = sections[currentSectionIndex];

  // Load Exam
  useEffect(() => {
    const loadExam = async () => {
      try {
        const res = await api.get(`/english-exam/${examId}/load`);
        setExam(res.data.exam);
        setSections(res.data.sections);
        setTimeLeft(res.data.exam.remaining_minutes * 60);
        setLoading(false);
      } catch (err) {
        console.error("Load error:", err);
        alert("Failed to load English exam.");
        navigate("/dashboard/manage-subject");
      }
    };
    loadExam();
  }, [examId, navigate]);

  // Timer
  useEffect(() => {
    if (!exam) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [exam]);

  // Save answer
  const saveAnswer = useCallback(
    async (questionId, selectedOption) => {
      try {
        await api.patch(`/english-exam/${examId}/answer`, {
          question_id: questionId,
          selected_option: selectedOption,
          remaining_seconds: timeLeft,
        });
        setAnswers((prev) => ({
          ...prev,
          [questionId]: selectedOption,
        }));
      } catch (err) {
        console.error("Save answer error:", err);
      }
    },
    [examId, timeLeft]
  );

  // Submit exam
  const handleSubmit = async () => {
    try {
      const res = await api.post(`/english-exam/${examId}/submit`, {
        remaining_seconds: timeLeft,
      });
      alert(`Submitted! Score: ${res.data.score}%`);
      navigate("/dashboard/manage-subject");
    } catch (err) {
      console.error("Submit error:", err);
      alert("Error submitting exam");
    }
  };

  if (loading || !currentSection) {
    return (
      <Box height="70vh" display="flex" justifyContent="center" alignItems="center">
        <CircularProgress />
      </Box>
    );
  }

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Paper sx={{ p: 3 }} elevation={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">
            English — {currentSection.title}
          </Typography>

          <Typography
            sx={{
              background: "#222",
              color: "#fff",
              px: 2,
              py: 1,
              borderRadius: 1,
              fontWeight: "bold",
            }}
          >
            {minutes}:{seconds}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {currentSection.passage && (
          <Paper sx={{ p: 2, mb: 3, background: "#fafafa" }}>
            <Typography sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
              {currentSection.passage}
            </Typography>
          </Paper>
        )}

        {currentSection.questions.map((q, idx) => (
          <Paper key={q.id} sx={{ p: 2, mb: 2 }}>
            <Typography sx={{ mb: 1, fontWeight: "bold" }}>
              {idx + 1}. {q.question}
            </Typography>

            <Grid container spacing={1}>
              {["a", "b", "c", "d"].map((opt) => {
                const label = opt.toUpperCase();
                const selected = answers[q.id] === label;

                return (
                  <Grid item xs={12} sm={6} key={opt}>
                    <Button
                      fullWidth
                      variant={selected ? "contained" : "outlined"}
                      onClick={() => saveAnswer(q.id, label)}
                    >
                      <b>{label}.</b> {q[`option_${opt}`]}
                    </Button>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        ))}

        <Divider sx={{ my: 3 }} />

        <Box display="flex" justifyContent="space-between">
          <Button
            variant="outlined"
            disabled={currentSectionIndex === 0}
            onClick={() => setCurrentSectionIndex((i) => i - 1)}
          >
            Previous
          </Button>

          {currentSectionIndex === sections.length - 1 ? (
            <Button variant="contained" color="error" onClick={handleSubmit}>
              Submit Exam
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={() => setCurrentSectionIndex((i) => i + 1)}
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
