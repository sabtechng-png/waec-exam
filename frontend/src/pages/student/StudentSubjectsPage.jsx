// ========================================================
// StudentSubjectsPage.jsx — FULL CORRECTED VERSION
// ========================================================
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function StudentSubjectsPage() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });

  // -----------------------------------------------------
  // Load all subjects with registration status
  // -----------------------------------------------------
  const refresh = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/student/subjects");
      setSubjects(res.data.subjects || []);
    } catch (err) {
      console.error("Error loading subjects:", err);
      setToast({ open: true, message: "Error loading subjects", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  // -----------------------------------------------------
  // Register Subject
  // -----------------------------------------------------
  const registerSubject = async (subjectId) => {
    try {
      setLoadingAction(subjectId);
      await api.post("/api/student/subjects/register", { subject_id: subjectId });
      setToast({ open: true, message: "Subject registered successfully", severity: "success" });
      await refresh();
    } catch (err) {
      setToast({
        open: true,
        message: err.response?.data?.message || "Error registering subject",
        severity: "error",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  // -----------------------------------------------------
  // Start or Resume Exam
  // -----------------------------------------------------
  const startExam = async (subjectId) => {
    try {
      setLoadingAction(subjectId);
      const res = await api.post("/exam/start", { subject_id: subjectId });
      if (res.status === 200 && res.data?.exam?.id) {
        navigate(`/exam/${subjectId}`, { state: { exam_id: res.data.exam.id } });
      } else {
        setToast({ open: true, message: "Unable to start exam", severity: "error" });
      }
    } catch (err) {
      console.error("Start exam error:", err);
      setToast({
        open: true,
        message: err.response?.data?.message || "Unable to start exam",
        severity: "error",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  // -----------------------------------------------------
  // Clear (Reset) Subject
  // -----------------------------------------------------
  const clearSubject = async (subjectId) => {
    try {
      setLoadingAction(subjectId);
      await api.post("/api/student/subjects/reset", { subject_id: subjectId });
      setToast({ open: true, message: "Subject cleared successfully", severity: "success" });
      await refresh();
    } catch (err) {
      console.error("Clear subject error:", err);
      setToast({
        open: true,
        message: err.response?.data?.message || "Error clearing subject",
        severity: "error",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  // -----------------------------------------------------
  // View Result for Completed Subjects
  // -----------------------------------------------------
  const viewResult = (subjectId) => {
    navigate(`/exam/result/${subjectId}`);
  };

  // -----------------------------------------------------
  // Status Chip
  // -----------------------------------------------------
  const getStatusChip = (status) => {
    switch (status) {
      case "none":
        return <Chip label="available" color="success" size="small" variant="outlined" />;
      case "pending":
        return <Chip label="registered" color="primary" size="small" variant="outlined" />;
      case "in_progress":
        return <Chip label="in progress" color="warning" size="small" variant="outlined" />;
      case "completed":
        return <Chip label="completed" color="success" size="small" variant="outlined" />;
      default:
        return <Chip label="unknown" size="small" variant="outlined" />;
    }
  };


// -----------------------------------------------------
// UI RENDER
// -----------------------------------------------------
return (
  <Container maxWidth="md" sx={{ py: 3 }}>
    <Typography variant="h5" fontWeight={600} gutterBottom>
      📚 Subjects
    </Typography>

    {loading ? (
      <Box display="flex" justifyContent="center" py={5}>
        <CircularProgress />
      </Box>
    ) : subjects.length === 0 ? (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <Typography>No subjects found.</Typography>
      </Paper>
    ) : (
      <Paper sx={{ p: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Subject</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {subjects.map((s) => (
              <TableRow key={s.subject_id}>
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.code}</TableCell>
                <TableCell>{getStatusChip(s.registered_status)}</TableCell>

                <TableCell align="right">
                  {/* ✅ AVAILABLE or COMPLETED → REGISTER */}
                  {(s.registered_status === "none" ||
                    s.registered_status === "completed" ||
                    s.registered_status === "available") && (
                    <Button
                      variant="contained"
                      size="small"
                      disabled={loadingAction === s.subject_id}
                      onClick={() => registerSubject(s.subject_id)}
                    >
                      {loadingAction === s.subject_id ? (
                        <CircularProgress size={18} />
                      ) : (
                        "Register"
                      )}
                    </Button>
                  )}

                  {/* 🔵 REGISTERED → TAKE EXAM + CLEAR */}
                  {s.registered_status === "registered" && (
                    <>
                      <Button
                        variant="contained"
                        size="small"
                        disabled={loadingAction === s.subject_id}
                        onClick={() => startExam(s.subject_id)}
                      >
                        {loadingAction === s.subject_id ? (
                          <CircularProgress size={18} />
                        ) : (
                          "Take Exam"
                        )}
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        sx={{ ml: 1 }}
                        disabled={loadingAction === s.subject_id}
                        onClick={() => clearSubject(s.subject_id)}
                      >
                        Clear
                      </Button>
                    </>
                  )}

                  {/* 🟠 IN PROGRESS → RESUME */}
                  {s.registered_status === "in_progress" && (
                    <Button
                      variant="contained"
                      color="warning"
                      size="small"
                      disabled={loadingAction === s.subject_id}
                      onClick={() => startExam(s.subject_id)}
                    >
                      Resume
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    )}

    {/* ✅ Toast notifications */}
    <Snackbar
      open={toast.open}
      autoHideDuration={3000}
      onClose={() => setToast({ ...toast, open: false })}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert severity={toast.severity}>{toast.message}</Alert>
    </Snackbar>
  </Container>
);


}
