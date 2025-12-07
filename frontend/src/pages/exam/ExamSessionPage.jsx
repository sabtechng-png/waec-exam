import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Container,
  CircularProgress,
  Typography,
  Chip,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
} from "@mui/material";

import { Grow } from "@mui/material";

import { Flag, FlagOutlined, ArrowBack, ArrowForward, AccessTime } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function ExamSessionPage() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);     // full question objects
  const [answers, setAnswers] = useState({});
  const [flags, setFlags] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });
  const [remainingSec, setRemainingSec] = useState(0);

  const timerRef = useRef(null);
const [successModal, setSuccessModal] = useState(false);

  // ============================================================
  // LOAD FULL EXAM SESSION
  // ============================================================
  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);

        const res = await api.get(`/exam/session/${examId}`);

        setExam(res.data.exam);
        setQuestions(res.data.questions);

        // Convert answer array to dictionary
        const ansObj = {};
        res.data.answers.forEach(a => {
          ansObj[a.question_id] = a.selected_option;
        });

        const flagObj = {};
        res.data.answers.forEach(a => {
          flagObj[a.question_id] = a.flagged;
        });

        setAnswers(ansObj);
        setFlags(flagObj);

        const seconds =
          res.data.exam.remaining_minutes * 60 || 15 * 60;

        setRemainingSec(seconds);
      } catch (err) {
        console.error("Error loading session:", err);
        setToast({
          open: true,
          message: "Unable to load exam session",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [examId]);

  // ============================================================
  // TIMER
  // ============================================================
  useEffect(() => {
    if (!exam) return;

    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRemainingSec((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [exam]);

  const currentQ = questions[currentIndex];

  // ============================================================
  // SAVE ANSWER
  // ============================================================
  const handleSelectOption = async (opt) => {
    if (!currentQ) return;
    const qid = currentQ.id;

    setAnswers((prev) => ({ ...prev, [qid]: opt }));
    setSaving(true);

    try {
      await api.patch(`/exam/${examId}/answer`, {
        question_id: qid,
        selected_option: opt,
        flagged: flags[qid] || false,
      });
    } catch (err) {
      console.error("Save error:", err);
      setToast({ open: true, message: "Failed to save answer", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // FLAG QUESTION
  // ============================================================
  const toggleFlag = async () => {
    if (!currentQ) return;
    const qid = currentQ.id;

    const newFlag = !flags[qid];
    setFlags((prev) => ({ ...prev, [qid]: newFlag }));

    try {
      await api.patch(`/exam/${examId}/answer`, {
        question_id: qid,
        selected_option: answers[qid] || null,
        flagged: newFlag,
      });
    } catch (err) {
      console.error("Flag error:", err);
    }
  };

  // ============================================================
  // SUBMIT
  // ============================================================
const handleSubmit = async () => {
  try {
    await api.post(`/exam/${examId}/submit`, {
      remaining_seconds: remainingSec,
    });

    // OPEN SUCCESS MODAL
    setSuccessModal(true);

  } catch (err) {
    setToast({
      open: true,
      message: "Failed to submit exam",
      severity: "error",
    });
  }
};


  // UI DATA
  const minutes = Math.floor(remainingSec / 60);
  const seconds = remainingSec % 60;

  if (loading) {
    return (
      <Box height="80vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* HEADER */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 3,
          background: "#0d47a1",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          {exam.subject_name || "Exam"}
        </Typography>

        <Chip
          icon={<AccessTime sx={{ color: "#0d47a1" }} />}
          label={`${minutes}:${seconds.toString().padStart(2, "0")}`}
          sx={{
            background: "#ffeb3b",
            color: "#0d47a1",
            fontWeight: "bold",
          }}
        />
      </Paper>

      <Grid container spacing={2}>
        {/* LEFT: QUESTION MAP */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, borderRadius: 3 }}>
            <Typography fontWeight={700}>Question Map</Typography>

            <Grid container spacing={1} mt={1}>
             {questions.map((q, i) => {
  const isCurrent = i === currentIndex;
  const isAnswered = answers[q.id] ? true : false;
  const isFlagged = flags[q.id];

  let bg = "transparent";
  let color = "#0d47a1";
  let border = "1px solid #90caf9"; // light blue border

  if (isCurrent) {
    bg = "#0d47a1";
    color = "white";
    border = "none";
  } else if (isFlagged) {
    bg = "#fff3e0"; // light orange
    border = "2px solid #fb8c00";
    color = "#e65100";
  } else if (isAnswered) {
    bg = "#2e7d32"; // green
    color = "white";
    border = "1px solid #1b5e20";
  }

  return (
    <Grid item key={q.id}>
      <Button
        onClick={() => setCurrentIndex(i)}
        sx={{
          minWidth: 40,
          height: 40,
          borderRadius: "12px",
          background: bg,
          color: color,
          border: border,
          fontWeight: "bold",
          "&:hover": {
            opacity: 0.85,
            background: bg,
          },
        }}
      >
        {i + 1}
      </Button>
    </Grid>
  );
})}

            </Grid>
          </Paper>
        </Grid>

        {/* RIGHT: QUESTION VIEW */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography fontWeight={700}>
                Question {currentIndex + 1} / {questions.length}
              </Typography>

              <Button
                variant="outlined"
                color={flags[currentQ?.id] ? "warning" : "primary"}
                onClick={toggleFlag}
                startIcon={flags[currentQ?.id] ? <Flag /> : <FlagOutlined />}
              >
                {flags[currentQ?.id] ? "Flagged" : "Flag"}
              </Button>
            </Box>

            {/* QUESTION */}
            <Typography fontSize="1.25rem" mb={3}>
              {currentQ.question}
            </Typography>

            {/* OPTIONS */}
            <Grid container spacing={2}>
              {["A", "B", "C", "D"].map((opt) => {
                const selected = answers[currentQ.id] === opt;
                const optText = currentQ[`option_${opt.toLowerCase()}`];

                return (
                  <Grid item xs={12} key={opt}>
                    <Paper
                      onClick={() => handleSelectOption(opt)}
                      sx={{
                        p: 2,
                        borderRadius: "14px",
                        cursor: "pointer",
                        border: selected ? "3px solid #0d47a1" : "1px solid #ccc",
                        background: selected ? "rgba(13,71,161,0.08)" : "white",
                      }}
                    >
                      <Typography>
                        <strong>{opt}.</strong> {optText}
                      </Typography>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>

            {/* NAVIGATION */}
            <Box display="flex" justifyContent="space-between" mt={4}>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => i - 1)}
              >
                Previous
              </Button>

              <Button variant="contained" color="error" onClick={() => setConfirmSubmit(true)}>
                Submit Exam
              </Button>

              <Button
                variant="contained"
                endIcon={<ArrowForward />}
                disabled={currentIndex === questions.length - 1}
                onClick={() => setCurrentIndex((i) => i + 1)}
              >
                Next
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* SUBMIT DIALOG */}
      <Dialog open={confirmSubmit} onClose={() => setConfirmSubmit(false)}>
        <DialogTitle>Submit Exam?</DialogTitle>
        <DialogContent>
          You answered {Object.keys(answers).length} of {questions.length}.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmSubmit(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleSubmit}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* TOAST */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
      >
        <Alert severity={toast.severity}>{toast.message}</Alert>
      </Snackbar>
	  
{/* SUCCESS MODAL WITH ANIMATION */}
<Dialog
  open={successModal}
  TransitionComponent={Grow}
  transitionDuration={300}
  onClose={() => {}}
>
  <DialogTitle
    sx={{
      fontWeight: "bold",
      textAlign: "center",
      fontSize: "1.5rem",
    }}
  >
    🎉 Exam Submitted Successfully!
  </DialogTitle>

  <DialogContent sx={{ textAlign: "center", pb: 3 }}>
    <Typography fontSize="1rem">
      Your exam has been submitted successfully.
    </Typography>
    <Typography mt={1} fontSize="0.95rem">
      What would you like to do next?
    </Typography>
  </DialogContent>

  <DialogActions
    sx={{
      display: "flex",
      justifyContent: "space-between",
      px: 3,
      pb: 2,
    }}
  >
    <Button
      variant="outlined"
      onClick={() => navigate("/dashboard")}
      sx={{
        textTransform: "none",
        width: "45%",
        borderRadius: "10px",
        fontWeight: "bold",
      }}
    >
      Go to Dashboard
    </Button>

    <Button
      variant="contained"
      color="primary"
      onClick={() => navigate(`/dashboard/result/${examId}`)}
      sx={{
        textTransform: "none",
        width: "45%",
        borderRadius: "10px",
        fontWeight: "bold",
      }}
    >
      View Result
    </Button>
  </DialogActions>
</Dialog>

	  
    </Container>
  );
}
