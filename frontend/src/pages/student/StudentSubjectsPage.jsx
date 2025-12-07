import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { School, PlayArrow, RestartAlt, DeleteForever } from "@mui/icons-material";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";

export default function StudentSubjectsPage() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });

  // ==========================================================
  // LOAD SUBJECTS
  // ==========================================================
  const loadSubjects = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/student/subjects");
      setSubjects(res.data.subjects || []);
    } catch (err) {
      setToast({
        open: true,
        message: "Error loading subjects",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  // ==========================================================
  // REGISTER SUBJECT
  // ==========================================================
  const handleRegister = async (subjectId) => {
    try {
      setActionLoading(subjectId);
      await api.post("/api/student/subjects/register", { subject_id: subjectId });

      setToast({
        open: true,
        message: "Subject registered successfully!",
        severity: "success",
      });

      loadSubjects();
    } catch (err) {
      setToast({
        open: true,
        message: err.response?.data?.message || "Failed to register subject",
        severity: "error",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // ==========================================================
  // START / RESUME EXAM
  // ==========================================================
  const handleStartExam = async (subjectId) => {
    try {
      setActionLoading(subjectId);

      const res = await api.post("/exam/start", { subject_id: subjectId });

      if (res.data?.exam?.id) {
        navigate(`/exam/session/${res.data.exam.id}`);
      } else {
        setToast({
          open: true,
          message: "Unable to start exam",
          severity: "error",
        });
      }
    } catch (err) {
      setToast({
        open: true,
        message: err.response?.data?.message || "Cannot start exam",
        severity: "error",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // ==========================================================
  // CLEAR SUBJECT (DO NOT ALLOW IF exam in progress)
  // ==========================================================
  const handleClear = async (subjectId, status) => {
    if (status === "in_progress") {
      setToast({
        open: true,
        message: "Cannot clear while exam is in progress.",
        severity: "warning",
      });
      return;
    }

    try {
      setActionLoading(subjectId);
      await api.post("/api/student/subjects/reset", { subject_id: subjectId });

      setToast({
        open: true,
        message: "Subject cleared.",
        severity: "success",
      });

      loadSubjects();
    } catch (err) {
      setToast({
        open: true,
        message: err.response?.data?.message || "Error clearing subject",
        severity: "error",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // ==========================================================
  // STATUS UI CHIP
  // ==========================================================
  const StatusChip = ({ status }) => {
    const map = {
      none: { label: "Available", color: "success" },
      registered: { label: "Registered", color: "primary" },
      in_progress: { label: "In Progress", color: "warning" },
      completed: { label: "Completed", color: "secondary" },
    };

    const item = map[status] ?? map.none;

    return (
      <Chip
        label={item.label}
        color={item.color}
        variant="filled"
        sx={{ fontWeight: "bold" }}
      />
    );
  };

  // ==========================================================
  // MAIN UI
  // ==========================================================
  return (
    <Box p={2}>
      <Typography variant="h5" fontWeight={700} mb={3}>
        <School sx={{ mr: 1 }} /> Register Subjects
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" p={8}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {subjects.map((s) => (
            <Grid item xs={12} sm={6} md={4} key={s.subject_id}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  minHeight: 170,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "0.2s",
                  "&:hover": { boxShadow: "0 6px 18px rgba(0,0,0,0.12)" },
                }}
              >
                {/* Subject title */}
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {s.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Code: {s.code}
                  </Typography>

                  <Box mt={1}>
                    <StatusChip status={s.registered_status} />
                  </Box>
                </Box>

                {/* ACTION BUTTONS */}
                <Box mt={2} display="flex" gap={1}>
                  {s.registered_status === "none" && (
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleRegister(s.subject_id)}
                      disabled={actionLoading === s.subject_id}
                    >
                      Register
                    </Button>
                  )}

                  {s.registered_status === "registered" && (
                    <>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        startIcon={<PlayArrow />}
                        onClick={() => handleStartExam(s.subject_id)}
                        disabled={actionLoading === s.subject_id}
                      >
                        Take Exam
                      </Button>

                      <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteForever />}
                        onClick={() => handleClear(s.subject_id, s.registered_status)}
                        disabled={actionLoading === s.subject_id}
                      >
                        Clear
                      </Button>
                    </>
                  )}

                  {s.registered_status === "in_progress" && (
                    <Button
                      fullWidth
                      variant="contained"
                      color="warning"
                      startIcon={<RestartAlt />}
                      onClick={() => handleStartExam(s.subject_id)}
                      disabled={actionLoading === s.subject_id}
                    >
                      Resume Exam
                    </Button>
                  )}

                  {s.registered_status === "completed" && (
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<RestartAlt />}
                      onClick={() => handleRegister(s.subject_id)}
                      disabled={actionLoading === s.subject_id}
                    >
                      Retake Exam
                    </Button>
                  )}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
      >
        <Alert severity={toast.severity}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
}
