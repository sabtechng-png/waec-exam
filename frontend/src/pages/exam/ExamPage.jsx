// ===============================================================
// JAMB STYLE CBT UI — Logic Untouched, Pure UX Redesign
// ===============================================================
import React, { useEffect, useState, useRef } from "react";
import {
  Box, Button, CircularProgress, Container, Grid, IconButton,
  LinearProgress, Paper, Snackbar, Alert, Typography, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider
} from "@mui/material";

import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  ArrowBack, ArrowForward, Flag, FlagOutlined,
  AccessTime, CheckCircle
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
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
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  const [leftSec, setLeftSec] = useState(0);
  const timerRef = useRef(null);

  // ============================================
  // START or RESUME exam
  // ============================================
  useEffect(() => {
    const startExam = async () => {
      try {
        const res = await api.post("/exam/start", { subject_id: subjectId });

        const { exam, question_ids, answers: savedAns, flags: savedFlags } = res.data;

        setExam(exam);
        setQOrder(question_ids || []);
        setAnswers(savedAns || {});
        setFlags(savedFlags || {});
        setLeftSec(exam.remaining_seconds);
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

  // ============================================
  // TIMER ENGINE
  // ============================================
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
  }, [leftSec]);

  // Autosave remaining time
  useEffect(() => {
    if (!exam) return;

    const interval = setInterval(() => {
      api.patch(`/exam/${exam.id}/time`, {
        remaining_seconds: leftSec,
      }).catch(() => {});
    }, 5000);

    return () => clearInterval(interval);
  }, [exam, leftSec]);

  // ============================================
  // LOAD QUESTION
  // ============================================
  useEffect(() => {
    const loadQ = async () => {
      if (!exam || !qOrder[qIndex]) return;
      setLoading(true);

      try {
        const res = await api.get(`/exam/${exam.id}/question/${qOrder[qIndex]}`);
        setCurrentQ(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadQ();
  }, [exam, qIndex, qOrder]);

  // ============================================
  // SAVE ANSWER
  // ============================================
  const saveAnswer = async (option) => {
    if (!currentQ) return;

    setSaving(true);
    setAnswers((p) => ({ ...p, [currentQ.id]: option }));

    try {
      await api.patch(`/exam/${exam.id}/answer`, {
        question_id: currentQ.id,
        selected_option: option,
        flagged: flags[currentQ.id] || false,
        remaining_seconds: leftSec,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const toggleFlag = async () => {
    if (!currentQ) return;
    const nf = !flags[currentQ.id];
    setFlags((p) => ({ ...p, [currentQ.id]: nf }));

    try {
      await api.patch(`/exam/${exam.id}/answer`, {
        question_id: currentQ.id,
        selected_option: answers[currentQ.id] || null,
        flagged: nf,
        remaining_seconds: leftSec,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const nextQ = () => setQIndex((i) => Math.min(i + 1, qOrder.length - 1));
  const prevQ = () => setQIndex((i) => Math.max(i - 1, 0));

  const handleSubmit = async () => {
    try {
      await api.post(`/exam/${exam.id}/submit`, {
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
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: "Please try again.",
      });
    }
  };

  // ==================================================
  // RENDER START
  // ==================================================
  if (loading && !exam)
    return (
      <Box height="70vh" display="flex" justifyContent="center" alignItems="center">
        <CircularProgress />
      </Box>
    );

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / qOrder.length) * 100;
  const min = Math.floor(leftSec / 60);
  const sec = leftSec % 60;

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>

      {/* =====================================================
         TOP CBT BAR — Clean JAMB Style
      ====================================================== */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          {exam?.subject_name} — CBT Examination
        </Typography>

        <Chip
          icon={<AccessTime />}
          label={`${min}:${sec.toString().padStart(2, "0")}`}
          color={leftSec <= 60 ? "error" : "primary"}
          sx={{
            fontSize: "1rem",
            px: 2,
            py: 1,
          }}
        />
      </Paper>

      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ height: 10, borderRadius: 5, mb: 2 }}
      />

      {/* =====================================================
          QUESTION CARD (Large, Clean, Focused)
      ====================================================== */}
      <Paper
        elevation={4}
        sx={{
          p: 4,
          borderRadius: 3,
          mb: 2,
          minHeight: "60vh",
        }}
      >
        {/* QUESTION HEADER */}
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography variant="h6" fontWeight={600}>
            Question {qIndex + 1} of {qOrder.length}
          </Typography>

          <IconButton onClick={toggleFlag} color={flags[currentQ?.id] ? "warning" : "default"}>
            {flags[currentQ?.id] ? <Flag /> : <FlagOutlined />}
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* QUESTION TEXT */}
        <Typography
          variant="body1"
          fontSize="1.1rem"
          fontWeight={500}
          sx={{ mb: 3, lineHeight: 1.6 }}
        >
          {currentQ?.question}
        </Typography>

        {/* OPTIONS — Clean JAMB Buttons */}
        <Grid container spacing={2}>
          {["A", "B", "C", "D"].map((opt) => (
            <Grid item xs={12} key={opt}>
              <Button
                fullWidth
                variant={answers[currentQ?.id] === opt ? "contained" : "outlined"}
                color={answers[currentQ?.id] === opt ? "primary" : "inherit"}
                onClick={() => saveAnswer(opt)}
                sx={{
                  textTransform: "none",
                  justifyContent: "flex-start",
                  py: 2,
                  px: 3,
                  fontSize: "1rem",
                  borderRadius: 2,
                }}
              >
                <strong>{opt}.</strong>&nbsp; {currentQ?.[`option_${opt.toLowerCase()}`]}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* =====================================================
         NAVIGATION + SUBMIT (JAMB Style)
      ====================================================== */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          disabled={qIndex === 0}
          onClick={prevQ}
          sx={{ py: 1.5, px: 4 }}
        >
          Previous
        </Button>

        <Button
          variant="contained"
          color="error"
          onClick={() => setConfirmSubmit(true)}
          sx={{ py: 1.5, px: 5, fontWeight: 700 }}
        >
          Submit Exam
        </Button>

        <Button
          variant="contained"
          endIcon={<ArrowForward />}
          disabled={qIndex === qOrder.length - 1}
          onClick={nextQ}
          sx={{ py: 1.5, px: 4 }}
        >
          Next
        </Button>
      </Box>

      {/* =====================================================
         BOTTOM QUESTION NUMBER GRID — JAMB STYLE
      ====================================================== */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mt: 3,
          borderRadius: 2,
          mb: 5,
        }}
      >
        <Typography variant="subtitle1" mb={1} fontWeight={600}>
          Question Map
        </Typography>

        <Grid container spacing={1}>
          {qOrder.map((qid, i) => (
            <Grid item key={qid}>
              <Button
                size="small"
                variant={i === qIndex ? "contained" : "outlined"}
                color={
                  flags[qid] ? "warning" :
                  answers[qid] ? "success" : "primary"
                }
                onClick={() => setQIndex(i)}
                sx={{
                  minWidth: 36,
                  fontWeight: 700,
                }}
              >
                {i + 1}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* SUBMIT CONFIRMATION DIALOG */}
      <Dialog open={confirmSubmit} onClose={() => setConfirmSubmit(false)}>
        <DialogTitle>Submit Exam?</DialogTitle>
        <DialogContent>
          <Typography>
            You answered {answeredCount} of {qOrder.length}.  
            You cannot change answers after submission.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmSubmit(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleSubmit}>
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
