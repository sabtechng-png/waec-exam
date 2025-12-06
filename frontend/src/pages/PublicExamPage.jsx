import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Grid,
  LinearProgress,
  Paper,
  Typography,
  Divider,
} from "@mui/material";
import api from "../utils/api";
import AdBlockRaw from "../components/ads/AdBlockRaw";
import AdBlockAtOptions from "../components/ads/AdBlockAtOptions";

/* ============================================================
   CONFIG SECTION
============================================================ */
const DEMO_TIME_LIMIT = 600; // 10 minutes (change as needed)

export default function PublicExamPage() {
  /* ============================================================
       STATES
  ============================================================ */
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Timers
  const [secondsSpent, setSecondsSpent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DEMO_TIME_LIMIT);

  // Ads (iframe refresh safe)
  const [adRefreshToken, setAdRefreshToken] = useState(0);

  const triggerAdRefresh = () => setAdRefreshToken((p) => p + 1);

  /* ============================================================
       LOAD QUESTIONS
  ============================================================ */
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const res = await api.get("/public/exam/questions");
        const fetched = Array.isArray(res.data?.questions)
          ? res.data.questions
          : [];

        // Randomize
        setQuestions([...fetched].sort(() => Math.random() - 0.5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  /* ============================================================
       RESTORE SAVED PROGRESS (Optional)
  ============================================================ */
  useEffect(() => {
    const saved = localStorage.getItem("public_exam_progress");
    if (!saved) return;

    try {
      const data = JSON.parse(saved);
      setAnswers(data.answers || {});
      setQIndex(data.qIndex || 0);
      setSecondsSpent(data.secondsSpent || 0);
      setTimeLeft(data.timeLeft || DEMO_TIME_LIMIT);
      setHasStarted(data.hasStarted || false);
    } catch (err) {
      console.error("Restore failed:", err);
    }
  }, []);

  /* ============================================================
       AUTO-SAVE TO LOCAL STORAGE
  ============================================================ */
  useEffect(() => {
    if (!hasStarted || result) return;
    localStorage.setItem(
      "public_exam_progress",
      JSON.stringify({
        answers,
        qIndex,
        secondsSpent,
        timeLeft,
        hasStarted,
      })
    );
  }, [answers, qIndex, secondsSpent, timeLeft, hasStarted, result]);

  /* ============================================================
       PREVENT REFRESH / BACK BUTTON DURING EXAM
  ============================================================ */
  useEffect(() => {
    if (!hasStarted || result) return;
    const preventReload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", preventReload);
    return () => window.removeEventListener("beforeunload", preventReload);
  }, [hasStarted, result]);

  /* ============================================================
       TIMER (COUNT UP + COUNT DOWN + AUTO SUBMIT)
  ============================================================ */
  useEffect(() => {
    if (!hasStarted || result) return;

    const interval = setInterval(() => {
      setSecondsSpent((prev) => prev + 1);

      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [hasStarted, result]);

  /* ============================================================
       FORMATTERS
  ============================================================ */
  const formatSpent = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  const formatLeft = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  /* ============================================================
       DERIVED VALUES
  ============================================================ */
  const totalQuestions = questions.length;
  const currentQuestion = useMemo(
    () => (totalQuestions > 0 ? questions[qIndex] : null),
    [questions, qIndex, totalQuestions]
  );

  const isCurrentAnswered = currentQuestion
    ? Boolean(answers[currentQuestion.id])
    : false;

  const allAnswered = useMemo(() => {
    if (!questions.length) return false;
    return questions.every((q) => answers[q.id]);
  }, [questions, answers]);

  const progress = totalQuestions
    ? ((qIndex + 1) / totalQuestions) * 100
    : 0;

  /* ============================================================
       EXAM ACTIONS
  ============================================================ */
  const handleStartExam = () => {
    setHasStarted(true);
    setSecondsSpent(0);
    setTimeLeft(DEMO_TIME_LIMIT);
    triggerAdRefresh();
  };

  const handleOptionSelect = (id, sel) => {
    setAnswers((prev) => ({ ...prev, [id]: sel }));
    triggerAdRefresh();
  };

  const handleNext = () => {
    if (!isCurrentAnswered) {
      alert("Select an option first.");
      return;
    }
    setQIndex((prev) => prev + 1);
    triggerAdRefresh();
  };

  const handlePrevious = () => {
    if (qIndex === 0) return;
    setQIndex((prev) => prev - 1);
    triggerAdRefresh();
  };

  const handleSubmit = async () => {
    if (!allAnswered && timeLeft > 0) {
      alert("Please answer all questions.");
      return;
    }

    setSubmitLoading(true);

    try {
      const payload = Object.entries(answers).map(([id, option]) => ({
        question_id: Number(id),
        selected_option: option,
      }));

      const res = await api.post("/public/exam/submit", {
        answers: payload,
      });

      setResult(res.data);
      triggerAdRefresh();
      localStorage.removeItem("public_exam_progress");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setResult(null);
    setQIndex(0);
    setHasStarted(false);
    setSecondsSpent(0);
    setTimeLeft(DEMO_TIME_LIMIT);
    localStorage.removeItem("public_exam_progress");
    triggerAdRefresh();
  };

  /* ============================================================
       LOADING
  ============================================================ */
  if (loading)
    return (
      <Box height="80vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );

  /* ============================================================
       NO QUESTIONS
  ============================================================ */
  if (!totalQuestions)
    return (
      <Container maxWidth="sm" sx={{ py: 5 }}>
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h5">No Demo Questions Found</Typography>
        </Paper>
      </Container>
    );

  /* ============================================================
       RESULT PAGE (SAFE RAW + SAFE IFRAME)
  ============================================================ */
  if (result)
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
          <Typography variant="h4" fontWeight={700}>
            Demo Result
          </Typography>

          <Typography sx={{ mt: 2 }}>
            Score: <b>{result.score}%</b>
          </Typography>

          <Typography sx={{ mt: 1 }}>
            Time spent: <b>{formatSpent(secondsSpent)}</b>
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Button variant="contained" fullWidth sx={{ py: 1.4 }} href="/register">
            Create Free Account
          </Button>

          <Button variant="outlined" fullWidth sx={{ py: 1.4, mt: 2 }} onClick={handleRetake}>
            Retake Demo
          </Button>
        </Paper>

        {/* SAFE RAW AD */}
        <Box sx={{ mt: 4 }}>
          <AdBlockRaw
            key={`result-raw-${adRefreshToken}`}
            scriptSrc="https://pl28075655.effectivegatecpm.com/c9272b516636923aeedfc69498e5dd37/invoke.js"
            containerId={`result-raw-${adRefreshToken}`}
          />
        </Box>

        {/* SAFE IFRAME AD */}
        <Box sx={{ mt: 4 }}>
          <AdBlockAtOptions
            key={`result-opt-${adRefreshToken}`}
            adKey="efd800066af5754002a75671dd92ec61"
            id="ad-bottom-result"
            width={728}
            height={90}
          />
        </Box>
      </Container>
    );

  // ----------------------------
  // WELCOME / INSTRUCTIONS VIEW
  // ----------------------------
  if (!hasStarted) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h4" fontWeight={700} textAlign="center">
            Free CBT Demo Practice
          </Typography>

          <Typography sx={{ mt: 2, textAlign: "center" }}>
            Practice a short set of real CBT-style questions. This is a preview
            of what you will get when you create a free account.
          </Typography>

          <Box
            sx={{
              mt: 3,
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Number of Questions
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {totalQuestions}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Mode
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                Timed Demo
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Target
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                WAEC / JAMB Style
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" fontWeight={600}>
            Instructions
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            • Select one option for each question before moving to the next.{" "}
            <br />
            • You cannot submit until all questions are answered. <br />
            • Ads may appear as part of the free demo. Creating an account
            unlocks more features.
          </Typography>

          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleStartExam}
            >
              Start Demo
            </Button>
          </Box>
        </Paper>

        {/* Welcome Page Ads */}
        <Box sx={{ mt: 4 }}>
          <AdBlockRaw
            key={`welcome-raw-${adRefreshToken}`}
            scriptSrc="//pl28075655.effectivegatecpm.com/c9272b516636923aeedfc69498e5dd37/invoke.js"
            containerId="container-c9272b516636923aeedfc69498e5dd37"
          />
        </Box>
      </Container>
    );
  }

  /* ============================================================
       EXAM PAGE (NO RAW ADS HERE)
  ============================================================ */
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" flexWrap="wrap" mb={2}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Free CBT Demo
          </Typography>
          <Typography variant="body2">
            Question {qIndex + 1} of {totalQuestions}
          </Typography>
        </Box>

        <Box textAlign="right">
          <Typography variant="body2" color="text.secondary">
            Time Left
          </Typography>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              color: timeLeft < 20 ? "red" : "#1976d2",
              animation: timeLeft < 15 ? "blink 1s linear infinite" : "none",
              "@keyframes blink": {
                "50%": { opacity: 0.4 },
              },
            }}
          >
            {formatLeft(timeLeft)}
          </Typography>
        </Box>
      </Box>

      {/* PROGRESS BAR */}
      <LinearProgress value={progress} variant="determinate" sx={{ mb: 3 }} />

      {/* QUESTION NAVIGATOR */}
      <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
        {questions.map((q, idx) => (
          <Button
            size="small"
            key={idx}
            variant={answers[q.id] ? "contained" : "outlined"}
            color={idx === qIndex ? "primary" : answers[q.id] ? "success" : "secondary"}
            onClick={() => setQIndex(idx)}
            sx={{ minWidth: 40 }}
          >
            {idx + 1}
          </Button>
        ))}
      </Box>

      {/* QUESTION CARD */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6">Question {qIndex + 1}</Typography>

        <Typography sx={{ mt: 2, mb: 3 }}>{currentQuestion?.question}</Typography>

        <Grid container spacing={2}>
          {["A", "B", "C", "D"].map((opt) => {
            const txt = currentQuestion[`option_${opt.toLowerCase()}`];
            if (!txt) return null;

            const selected = answers[currentQuestion.id] === opt;

            return (
              <Grid item xs={12} key={opt}>
                <Card
                  sx={{
                    p: 2,
                    cursor: "pointer",
                    border: selected ? "2px solid #1976d2" : "1px solid #ccc",
                    backgroundColor: selected ? "#e3f2fd" : "white",
                  }}
                  onClick={() => handleOptionSelect(currentQuestion.id, opt)}
                >
                  <b>{opt}.</b> {txt}
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Navigation */}
        <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
          <Button variant="outlined" disabled={qIndex === 0} onClick={handlePrevious}>
            Previous
          </Button>

          {qIndex === totalQuestions - 1 ? (
            <Button
              variant="contained"
              color="error"
              disabled={!allAnswered || submitLoading}
              onClick={handleSubmit}
            >
              {submitLoading ? <CircularProgress size={22} sx={{ color: "white" }} /> : "Submit"}
            </Button>
          ) : (
            <Button variant="contained" disabled={!isCurrentAnswered} onClick={handleNext}>
              Next
            </Button>
          )}
        </Box>
      </Paper>

      {/* SAFE IFRAME AD (ONLY ON EXAM PAGE) */}
      <Box sx={{ mt: 4 }}>
        <AdBlockAtOptions
          key={`exam-opt-${adRefreshToken}`}
          adKey="efd800066af5754002a75671dd92ec61"
          id="ad-bottom-exam"
          width={728}
          height={90}
        />
      </Box>
    </Container>
  );
}
