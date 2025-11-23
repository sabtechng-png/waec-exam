// ========================================================
// ManageSubjectsPage.jsx — FULL CORRECTED VERSION
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
  Typography,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { PlayArrow, Assessment, Replay } from "@mui/icons-material";
import api from "../../utils/api";

export default function ManageSubjectsPage() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });
  const [tab, setTab] = useState("pending");
  const [loadingAction, setLoadingAction] = useState(null);

  // -----------------------------------------
  // Load subjects and statuses
  // -----------------------------------------
  const loadSubjects = async () => {
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
    loadSubjects();
  }, []);

  // -----------------------------------------
  // Actions
  // -----------------------------------------
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

  const resetSubject = async (subjectId) => {
    try {
      setLoadingAction(subjectId);
      await api.post("/api/student/subjects/reset", { subject_id: subjectId });
      setToast({ open: true, message: "Subject cleared successfully", severity: "success" });
      await loadSubjects();
    } catch (err) {
      console.error("Reset subject error:", err);
      setToast({
        open: true,
        message: err.response?.data?.message || "Error clearing subject",
        severity: "error",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const viewResult = (subjectId) => {
    navigate(`/exam/result/${subjectId}`);
  };

  // -----------------------------------------
  // Summary counts
  // -----------------------------------------
  const total = subjects.length;
  const pendingCount = subjects.filter((s) => s.registered_status === "pending").length;
  const inProgressCount = subjects.filter((s) => s.registered_status === "in_progress").length;
  const completedCount = subjects.filter((s) => s.registered_status === "completed").length;

  // Filter by tab
  const filtered = subjects.filter((s) => s.registered_status === tab);

  const chipColor = {
    pending: "info",
    in_progress: "warning",
    completed: "success",
  };

  // -----------------------------------------
  // UI
  // -----------------------------------------
  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        🧩 Manage Subjects
      </Typography>

      {/* SUMMARY BAR */}
      <Paper
        sx={{
          mb: 2,
          p: 1.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 14,
          color: "text.secondary",
        }}
        elevation={2}
      >
        <Box>
          <strong>Total:</strong> {total}
        </Box>
        <Box sx={{ color: "#1976d2" }}>
          <strong>Pending:</strong> {pendingCount}
        </Box>
        <Box sx={{ color: "#ed6c02" }}>
          <strong>In Progress:</strong> {inProgressCount}
        </Box>
        <Box sx={{ color: "#2e7d32" }}>
          <strong>Completed:</strong> {completedCount}
        </Box>
      </Paper>

      {/* TABS */}
      <Tabs
        value={tab}
        onChange={(e, val) => setTab(val)}
        textColor="primary"
        indicatorColor="primary"
        sx={{ mb: 2 }}
      >
        <Tab value="pending" label="Pending" />
        <Tab value="in_progress" label="In Progress" />
        <Tab value="completed" label="Completed" />
      </Tabs>

      {/* TABLE */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={5}>
          <CircularProgress />
        </Box>
      ) : filtered.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography>No {tab.replace("_", " ")} subjects found.</Typography>
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
              {filtered.map((s) => (
                <TableRow key={s.subject_id}>
                  <TableCell>
                    {s.name}
                    {s.registered_status === "completed" && s.finished_at && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Completed on{" "}
                        {new Date(s.finished_at).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{s.code}</TableCell>
                  <TableCell>
                    <Chip
                      label={s.registered_status.replace("_", " ")}
                      color={chipColor[s.registered_status]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {s.registered_status === "pending" && (
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                        alignItems="center"
                      >
                        <Button
                          variant="contained"
                          size="small"
                          disabled={loadingAction === s.subject_id}
                          startIcon={<PlayArrow />}
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
                          startIcon={<Replay />}
                          disabled={loadingAction === s.subject_id}
                          onClick={() => resetSubject(s.subject_id)}
                        >
                          Clear
                        </Button>
                      </Stack>
                    )}

                    {s.registered_status === "in_progress" && (
                      <Button
                        variant="contained"
                        color="warning"
                        size="small"
                        startIcon={<PlayArrow />}
                        disabled={loadingAction === s.subject_id}
                        onClick={() => startExam(s.subject_id)}
                      >
                        Resume
                      </Button>
                    )}

                    {s.registered_status === "completed" && (
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<Assessment />}
                        onClick={() => viewResult(s.subject_id)}
                      >
                        View Result
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* TOAST */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
      >
        <Alert severity={toast.severity}>{toast.message}</Alert>
      </Snackbar>
    </Container>
  );
}
