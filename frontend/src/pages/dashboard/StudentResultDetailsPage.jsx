// src/pages/dashboard/StudentResultDetailsPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Button,
  Divider,
  Stack,
  Grid,
} from "@mui/material";
import api from "../../utils/api";

export default function StudentResultDetailsPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/exam/result/${examId}`);
        setResult(data);
      } catch (err) {
        console.error("Error fetching result details:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [examId]);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );

  if (!result)
    return (
      <Box textAlign="center" mt={5}>
        <Typography>No result found.</Typography>
        <Button sx={{ mt: 2 }} onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Box>
    );

  const {
    subject_name,
    score,
    correct,
    wrong,
    unanswered,
    answers,
    view_expired,
    message,
  } = result;

  const downloadPDF = async () => {
    try {
      const token = localStorage.getItem("waec_token");
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/exam/${examId}/pdf`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to download PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ExamResult_${examId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download failed:", err);
      alert("Unable to download PDF. Please try again.");
    }
  };

  return (
    <Box>
      {/* -------------------------------------------- */}
      {/* HEADER */}
      {/* -------------------------------------------- */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5" fontWeight={700}>
          🧠 {subject_name} — Exam Result
        </Typography>

        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => navigate("/dashboard/results")}>
            Back to Results
          </Button>
          <Button variant="contained" color="primary" onClick={downloadPDF}>
            Download PDF
          </Button>
        </Stack>
      </Box>

      {/* -------------------------------------------- */}
      {/* SCORE SUMMARY */}
      {/* -------------------------------------------- */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body1">Total Score</Typography>
            <Typography variant="h6" fontWeight={600}>
              {score}%
            </Typography>
          </Grid>

          {/* If 24-hour expired → do NOT show detailed breakdown */}
          {!view_expired && (
            <>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body1">Correct</Typography>
                <Chip label={`${correct}`} color="success" />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body1">Wrong</Typography>
                <Chip label={`${wrong}`} color="error" />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body1">Unanswered</Typography>
                <Chip label={`${unanswered}`} color="default" />
              </Grid>
            </>
          )}
        </Grid>

        {/* VIEW EXPIRED NOTICE */}
        {view_expired && (
          <Box mt={2}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "#fff5f5",
                border: "1px solid #ffcdd2",
              }}
            >
              <Typography
                variant="body1"
                color="error"
                fontWeight={600}
                sx={{ mb: 1 }}
              >
                🔒 Review Window Expired
              </Typography>
              <Typography variant="body2">
                {message ||
                  "Your answer details were deleted after 24 hours. Only your score is available."}
              </Typography>
            </Paper>
          </Box>
        )}
      </Paper>

      {/* -------------------------------------------- */}
      {/* DETAILED ANSWERS (ONLY IF WITHIN 24 HOURS) */}
      {/* -------------------------------------------- */}
      {!view_expired && answers && (
        <Box>
          {answers.map((q, index) => {
            const correctOption = (q.correct_option || "").toUpperCase();
            const selectedOption = (q.selected_option || "").toUpperCase();

            const isUnanswered = !q.selected_option;
            const isCorrect =
              !isUnanswered && selectedOption === correctOption;
            const isWrong =
              !isUnanswered && selectedOption !== correctOption;

            const revealCorrect = !isUnanswered;

            return (
              <Paper key={q.question_id} sx={{ p: 2, mb: 2 }}>
                {/* Question */}
                <Typography variant="subtitle1" fontWeight={600}>
                  {index + 1}. {q.question}
                </Typography>

                {/* Options */}
                <Box mt={1} mb={1}>
                  {["A", "B", "C", "D"].map((opt) => {
                    const optionText = q[`option_${opt.toLowerCase()}`];
                    if (!optionText) return null;

                    const studentChoice = selectedOption === opt;
                    const isCorrectAnswer = correctOption === opt;

                    return (
                      <Typography
                        key={opt}
                        sx={{
                          ml: 2,
                          mt: 0.5,
                          fontWeight:
                            studentChoice ||
                            (revealCorrect && isCorrectAnswer)
                              ? 600
                              : 400,
                          color: studentChoice
                            ? isCorrect
                              ? "#2e7d32"
                              : "#c62828"
                            : revealCorrect && isCorrectAnswer
                            ? "#2e7d32"
                            : "inherit",
                        }}
                      >
                        {opt}. {optionText}

                        {/* Student Choice */}
                        {studentChoice && (
                          <Chip
                            label={isCorrect ? "Correct" : "Your Choice"}
                            size="small"
                            color={isCorrect ? "success" : "warning"}
                            sx={{ ml: 1 }}
                          />
                        )}

                        {/* Reveal correct answer ONLY if answered */}
                        {revealCorrect &&
                          isCorrectAnswer &&
                          !studentChoice && (
                            <Chip
                              label="Correct Answer"
                              size="small"
                              color="success"
                              variant="outlined"
                              sx={{ ml: 1 }}
                            />
                          )}
                      </Typography>
                    );
                  })}
                </Box>

                <Divider sx={{ my: 1 }} />

                <Chip
                  label={
                    isCorrect
                      ? "Correct"
                      : isWrong
                      ? "Wrong"
                      : "Unanswered"
                  }
                  color={
                    isCorrect
                      ? "success"
                      : isWrong
                      ? "error"
                      : "default"
                  }
                />
              </Paper>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
