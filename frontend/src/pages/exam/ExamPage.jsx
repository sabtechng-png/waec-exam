// ===============================================================
// ExamPage.jsx — ExamMaster Pro UI (Premium Soft Shadow Design)
// ===============================================================
import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Snackbar,
  Alert,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Card,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { ArrowBack, ArrowForward, Flag, FlagOutlined, AccessTime } from "@mui/icons-material";
import api from "../../utils/api";

export default function ExamPage() {
  const { subjectId } = useParams(); // subject id from route: /exam/:subjectId
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);           // { id, subject_id, subject_name, remaining_minutes, ... }
  const [qOrder, setQOrder] = useState([]);         // array of question IDs
  const [qIndex, setQIndex] = useState(0);          // current index in qOrder
  const [currentQ, setCurrentQ] = useState(null);   // current question data
  const [answers, setAnswers] = useState({});       // { [qid]: 'A' | 'B' | 'C' | 'D' }
  const [flags, setFlags] = useState({});           // { [qid]: true/false }
  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  const [leftSec, setLeftSec] = useState(0);
  const timerRef = useRef(null);

  // =====================================================
  // START or RESUME exam (uses /exam/start)
  // =====================================================
  useEffect(() => {
    const startExam = async () => {
      try {
        setLoadingInit(true);

        const res = await api.post("/exam/start", { subject_id: subjectId });
        const { exam, question_ids, answers: savedAnswers, flags: savedFlags } = res.data;

        // store exam meta
        const remainingMinutes = exam?.remaining_minutes ?? 15;
        const remainingSeconds = exam?.remaining_seconds ?? remainingMinutes * 60;

        setExam({
          id: exam.id,
          subject_id: exam.subject_id,
          subject_name: exam.subject_name,
          remaining_minutes: remainingMinutes,
        });

        // question order
        setQOrder(question_ids || []);

        // pre-fill answers/flags if resuming
        setAnswers(savedAnswers || {});
        setFlags(savedFlags || {});

        // timer
        setLeftSec(remainingSeconds);
      } catch (err) {
        console.error("❌ Unable to start exam:", err);
        setToast({
          open: true,
          severity: "error",
          message: err.response?.data?.message || "Unable to start exam.",
        });
      } finally {
        setLoadingInit(false);
      }
    };

    startExam();
  }, [subjectId]);

  // =====================================================
  // TIMER ENGINE
  // =====================================================
  useEffect(() => {
    if (!exam) return;

    // clear existing timer
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setLeftSec((s) => Math.max(0, s - 1));
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [exam]);

  useEffect(() => {
    if (leftSec === 0 && exam) {
      handleSubmit(); // auto-submit when time ends
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leftSec]);

  // =====================================================
  // LOAD CURRENT QUESTION (GET /exam/:examId/question/:qid)
  // =====================================================
  useEffect(() => {
    const loadQuestion = async () => {
      if (!exam || !qOrder.length) return;
      const qid = qOrder[qIndex];
      if (!qid) return;

      setLoadingQuestion(true);

      try {
        // Question
        const qRes = await api.get(`/exam/${exam.id}/question/${qid}`);

        // Existing answer (if any)
        let ansData = {};
        try {
          const ansRes = await api.get(`/exam/${exam.id}/answer/${qid}`);
          ansData = ansRes.data || {};
        } catch {
          ansData = {};
        }

        setCurrentQ(qRes.data || null);

        // hydrate local answer if backend has something
        if (ansData.selected_option) {
          setAnswers((prev) => ({
            ...prev,
            [qid]: ansData.selected_option,
          }));
        }

        if (typeof ansData.flagged === "boolean") {
          setFlags((prev) => ({
            ...prev,
            [qid]: ansData.flagged,
          }));
        }
      } catch (err) {
        console.error("❌ Error loading question or answer:", err);
        setToast({
          open: true,
          severity: "error",
          message: "Error loading question.",
        });
      } finally {
        setLoadingQuestion(false);
      }
    };

    loadQuestion();
  }, [exam, qIndex, qOrder]);

  // =====================================================
  // SAVE ANSWER  (PATCH /exam/:examId/answer)
  // =====================================================
  const saveAnswer = async (option) => {
    if (!currentQ || !exam?.id) return;
    const qid = currentQ.id;

    setAnswers((prev) => ({
      ...prev,
      [qid]: option,
    }));

    setSaving(true);
    try {
      await api.patch(`/exam/${exam.id}/answer`, {
        question_id: qid,
        selected_option: option,
        flagged: flags[qid] || false,
        // remaining_seconds: leftSec, // optional if you want to store
      });
    } catch (err) {
      console.error("❌ Error saving answer:", err);
      setToast({
        open: true,
        severity: "error",
        message: "Failed to save answer.",
      });
    } finally {
      setSaving(false);
    }
  };

  // Flag / unflag question
  const toggleFlag = async () => {
    if (!currentQ || !exam?.id) return;
    const qid = currentQ.id;
    const nextFlag = !flags[qid];

    setFlags((prev) => ({
      ...prev,
      [qid]: nextFlag,
    }));

    try {
      await api.patch(`/exam/${exam.id}/answer`, {
        question_id: qid,
        selected_option: answers[qid] || null,
        flagged: nextFlag,
      });
    } catch (err) {
      console.error("❌ Error toggling flag:", err);
    }
  };

  // =====================================================
  // NAVIGATION + SUBMIT
  // =====================================================
  const nextQ = () => {
    setQIndex((i) => Math.min(i + 1, qOrder.length - 1));
  };

  const prevQ = () => {
    setQIndex((i) => Math.max(i - 1, 0));
  };

  const handleSubmit = async () => {
    if (!exam?.id) return;

    try {
      await api.post(`/exam/${exam.id}/submit`, {
        remaining_seconds: leftSec,
      });

      clearInterval(timerRef.current);

      Swal.fire({
        icon: "success",
        title: "Exam Submitted 🎉",
        timer: 2000,
        showConfirmButton: false,
      });

      // 🔁 After submission, go back to subject page (you can adjust this path)
      navigate("/dashboard/manage-subject");
    } catch (err) {
      console.error("❌ Error submitting exam:", err);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: err.response?.data?.message || "Unable to submit exam.",
      });
    }
  };

  // =====================================================
  // RENDER
  // =====================================================
  if (loadingInit && !exam) {
    return (
      <Box height="70vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const progress = qOrder.length ? (answeredCount / qOrder.length) * 100 : 0;
  const min = Math.floor(leftSec / 60);
  const sec = leftSec % 60;

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* HEADER */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          {exam?.subject_name || "Subject"} — CBT Examination
        </Typography>

        <Chip
          icon={<AccessTime />}
          label={`${min}:${sec.toString().padStart(2, "0")}`}
          color={leftSec <= 60 ? "error" : "primary"}
          sx={{ fontSize: "1rem", px: 2, py: 1 }}
        />
      </Paper>

      {/* PROGRESS BAR */}
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ mb: 2, height: 10, borderRadius: 5 }}
      />

      {/* QUESTION CARD */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={700}>
            Question {qIndex + 1} of {qOrder.length}
          </Typography>

          <IconButton
            onClick={toggleFlag}
            color={flags[currentQ?.id] ? "warning" : "default"}
          >
            {flags[currentQ?.id] ? <Flag /> : <FlagOutlined />}
          </IconButton>
        </Box>

        <Divider sx={{ my: 2 }} />

        {loadingQuestion || !currentQ ? (
          <Box py={4} textAlign="center">
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography
              variant="body1"
              fontSize="1.15rem"
              fontWeight={500}
              sx={{ mb: 3 }}
            >
              {currentQ.question}
            </Typography>

            {/* OPTIONS */}
            <Grid container spacing={2}>
              {["A", "B", "C", "D"].map((opt) => {
                const qid = currentQ.id;
                const selected = answers[qid] === opt;
                const optText = currentQ[`option_${opt.toLowerCase()}`];

                return (
                  <Grid item xs={12} key={opt}>
                    <Card
                      onClick={() => saveAnswer(opt)}
                      sx={{
                        p: 2,
                        cursor: "pointer",
                        borderRadius: 2,
                        border: selected ? "2px solid #1976d2" : "1px solid #ccc",
                        backgroundColor: selected ? "#e3f2fd" : "#fff",
                        boxShadow: selected
                          ? "0 3px 10px rgba(25,118,210,.3)"
                          : "0 1px 3px rgba(0,0,0,0.1)",
                        transition: "0.15s",
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        },
                      }}
                    >
                      <Typography fontSize="1.05rem">
                        <strong>{opt}.</strong> {optText}
                      </Typography>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            {/* NAVIGATION */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mt={3}
            >
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                disabled={qIndex === 0}
                onClick={prevQ}
                sx={{ px: 4, py: 1.5 }}
              >
                Previous
              </Button>

              <Button
                variant="contained"
                color="error"
                onClick={() => setConfirmSubmit(true)}
                sx={{ px: 5, py: 1.5, fontWeight: 700 }}
                disabled={saving}
              >
                Submit Exam
              </Button>

              <Button
                variant="contained"
                endIcon={<ArrowForward />}
                disabled={qIndex === qOrder.length - 1}
                onClick={nextQ}
                sx={{ px: 4, py: 1.5 }}
              >
                Next
              </Button>
            </Box>
          </>
        )}
      </Paper>

      {/* QUESTION MAP */}
      <Paper elevation={2} sx={{ p: 2, borderRadius: 2, mb: 4 }}>
        <Typography variant="subtitle1" fontWeight={600} mb={1}>
          Question Map
        </Typography>

        <Grid container spacing={1}>
          {qOrder.map((qid, i) => (
            <Grid item key={qid}>
              <Button
                size="small"
                variant={i === qIndex ? "contained" : "outlined"}
                color={
                  flags[qid]
                    ? "warning"
                    : answers[qid]
                    ? "success"
                    : "primary"
                }
                onClick={() => setQIndex(i)}
                sx={{ minWidth: 36, borderRadius: 2, fontWeight: 700 }}
              >
                {i + 1}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* SUBMIT CONFIRM DIALOG */}
      <Dialog open={confirmSubmit} onClose={() => setConfirmSubmit(false)}>
        <DialogTitle>Submit Exam?</DialogTitle>
        <DialogContent>
          <Typography>
            You answered {answeredCount} of {qOrder.length}.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmSubmit(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleSubmit}
            disabled={saving}
          >
            Submit Exam
          </Button>
        </DialogActions>
      </Dialog>

      {/* TOAST */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setToast({ ...toast, open: false })}
      >
        <Alert severity={toast.severity}>{toast.message}</Alert>
      </Snackbar>
    </Container>
  );
}
