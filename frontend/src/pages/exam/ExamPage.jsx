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
import {
  ArrowBack,
  ArrowForward,
  Flag,
  FlagOutlined,
  AccessTime,
} from "@mui/icons-material";
import api from "../../utils/api";

export default function ExamPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [qOrder, setQOrder] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [currentQ, setCurrentQ] = useState(null);
  const [answers, setAnswers] = useState({});
  const [flags, setFlags] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  const [leftSec, setLeftSec] = useState(0);
  const timerRef = useRef(null);

  // ================================
  // START or RESUME exam
  // ================================
  useEffect(() => {
    const startExam = async () => {
      try {
        const res = await api.post("/exam/start", { subject_id: subjectId });
        const { exam, question_ids } = res.data;

        // ⭐ FIX: Subject name included here
        setExam({
          id: exam.id,
          subject_id: exam.subject_id,
          subject_name: exam.subject_name, // ⭐ ADDED
          remaining_minutes: exam.remaining_minutes ?? 60,
        });

        setQOrder(question_ids || []);

        // Load saved answers + flags
        setAnswers(res.data.answers || {});
        setFlags(res.data.flags || {});

        // Timer
        setLeftSec((exam.remaining_minutes ?? 60) * 60);
      } catch (err) {
        setToast({
          open: true,
          severity: "error",
          message: err.response?.data?.message || "Unable to start exam.",
        });
      } finally {
        setLoading(false);
      }
    };

    startExam();
  }, [subjectId]);

  // ================================
  // TIMER ENGINE
  // ================================
  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setLeftSec((s) => Math.max(0, s - 1));
    }, 1000);
  };

  useEffect(() => {
    if (!exam) return;
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [exam]);

  useEffect(() => {
    if (leftSec === 0 && exam) handleSubmit();
  }, [leftSec]); // eslint-disable-line

  // ================================
  // ⭐ REMOVED BROKEN AUTOSAVE CALL (PATCH /exam/:id/time)
  // ================================

  // ================================
  // LOAD CURRENT QUESTION
  // ================================
  useEffect(() => {
    const loadQ = async () => {
      if (!exam || !qOrder[qIndex]) return;

      setLoading(true);
      const qid = qOrder[qIndex];

      try {
        const [qRes, ansRes] = await Promise.all([
          api.get(`/exam/${exam?.id}/question/${qid}`),
          api.get(`/exam/${exam?.id}/answer/${qid}`).catch(() => ({
            data: {},
          })),
        ]);

        setCurrentQ(qRes.data);

        const ansData = ansRes.data || {};
        if (ansData.selected_option) {
          setAnswers((prev) => ({
            ...prev,
            [qid]: ansData.selected_option,
          }));
        }

        if (typeof ansData.flagged === "boolean") {
          setFlags((prev) => ({ ...prev, [qid]: ansData.flagged }));
        }
      } catch (err) {
        console.error("Error loading question/answer:", err);
      } finally {
        setLoading(false);
      }
    };

    loadQ();
  }, [exam, qIndex, qOrder]);

  // ================================
  // SAVE ANSWER
  // ================================
  const saveAnswer = async (option) => {
    if (!currentQ || !exam?.id) return;

    setSaving(true);
    setAnswers((prev) => ({ ...prev, [currentQ.id]: option }));

    try {
      await api.patch(`/exam/${exam?.id}/answer`, {
        question_id: currentQ.id,
        selected_option: option,
        flagged: flags[currentQ.id] || false,
      });
    } catch (err) {
      console.error("Error saving answer:", err);
    } finally {
      setSaving(false);
    }
  };

  const toggleFlag = async () => {
    if (!currentQ || !exam?.id) return;
    const nextFlag = !flags[currentQ.id];

    setFlags((prev) => ({ ...prev, [currentQ.id]: nextFlag }));

    try {
      await api.patch(`/exam/${exam?.id}/answer`, {
        question_id: currentQ.id,
        selected_option: answers[currentQ.id] || null,
        flagged: nextFlag,
      });
    } catch (err) {}
  };

  // ================================
  // NAV + SUBMIT
  // ================================
  const nextQ = () => setQIndex((i) => Math.min(i + 1, qOrder.length - 1));
  const prevQ = () => setQIndex((i) => Math.max(i - 1, 0));

  const handleSubmit = async () => {
    if (!exam?.id) return;

    try {
      await api.post(`/exam/${exam?.id}/submit`, {
        remaining_seconds: leftSec,
      });

      Swal.fire({
        icon: "success",
        title: "Exam Submitted 🎉",
        timer: 2000,
        showConfirmButton: false,
      });

      navigate("/dashboard/manage-subject");
    } catch (err) {
      Swal.fire({ icon: "error", title: "Submission Failed" });
    }
  };

  // ================================
  // RENDER
  // ================================
  if (loading && !exam)
    return (
      <Box
        height="70vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <CircularProgress />
      </Box>
    );

  const answeredCount = Object.keys(answers).length;
  const progress = qOrder.length
    ? (answeredCount / qOrder.length) * 100
    : 0;
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
          {exam?.subject_name} — CBT Examination
        </Typography>

        <Chip
          icon={<AccessTime />}
          label={`${min}:${sec.toString().padStart(2, "0")}`}
          color={leftSec <= 60 ? "error" : "primary"}
          sx={{ fontSize: "1rem", px: 2, py: 1 }}
        />
      </Paper>

      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ mb: 2, height: 10, borderRadius: 5 }}
      />

      {/* QUESTION CARD */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
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

        <Typography
          variant="body1"
          fontSize="1.15rem"
          fontWeight={500}
          sx={{ mb: 3 }}
        >
          {currentQ?.question}
        </Typography>

        {/* OPTIONS */}
        <Grid container spacing={2}>
          {["A", "B", "C", "D"].map((opt) => {
            const selected = answers[currentQ?.id] === opt;

            return (
              <Grid item xs={12} key={opt}>
                <Card
                  onClick={() => saveAnswer(opt)}
                  sx={{
                    p: 2,
                    cursor: "pointer",
                    borderRadius: 2,
                    border: selected
                      ? "2px solid #1976d2"
                      : "1px solid #ccc",
                    backgroundColor: selected ? "#e3f2fd" : "#fff",
                    boxShadow: selected
                      ? "0 3px 10px rgba(25,118,210,.3)"
                      : "0 1px 3px rgba(0,0,0,0.1)",
                    transition: "0.15s",
                    "&:hover": {
                      boxShadow:
                        "0 4px 12px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <Typography fontSize="1.05rem">
                    <strong>{opt}.</strong>{" "}
                    {currentQ?.[
                      `option_${opt.toLowerCase()}`
                    ]}
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
                variant={
                  i === qIndex ? "contained" : "outlined"
                }
                color={
                  flags[qid]
                    ? "warning"
                    : answers[qid]
                    ? "success"
                    : "primary"
                }
                onClick={() => setQIndex(i)}
                sx={{
                  minWidth: 36,
                  borderRadius: 2,
                  fontWeight: 700,
                }}
              >
                {i + 1}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* SUBMIT CONFIRM POPUP */}
      <Dialog
        open={confirmSubmit}
        onClose={() => setConfirmSubmit(false)}
      >
        <DialogTitle>Submit Exam?</DialogTitle>
        <DialogContent>
          <Typography>
            You answered {answeredCount} of {qOrder.length}.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmSubmit(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleSubmit}
          >
            Submit Exam
          </Button>
        </DialogActions>
      </Dialog>

      {/* TOAST */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        onClose={() =>
          setToast({ ...toast, open: false })
        }
      >
        <Alert severity={toast.severity}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
