import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Stack,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Snackbar,
  Alert,
  LinearProgress,
  Divider,
} from "@mui/material";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import QuizIcon from "@mui/icons-material/Quiz";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import StarIcon from "@mui/icons-material/Star";
import api from "../../utils/api";

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
      elevation={0}
      variant="outlined"
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "primary.light",
            color: "primary.main",
          }}
        >
          <Icon fontSize="small" />
        </Box>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </Stack>

      <Box sx={{ mt: 1 }}>
        <Typography variant="h5" fontWeight={800}>
          {value}
        </Typography>
        {sub && (
          <Typography variant="caption" color="text.secondary">
            {sub}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

function formatDateTime(dt) {
  if (!dt) return "-";
  const d = new Date(dt);
  return d.toLocaleString();
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    msg: "",
    severity: "info",
  });

  const notify = (msg, severity = "info") =>
    setToast({ open: true, msg, severity });

  const load = async () => {
    setBusy(true);
    try {
      const res = await api.get("/admin/dashboard");
      setData(res.data);
    } catch (e) {
      const msg =
        e?.response?.data?.message || "Failed to load admin dashboard.";
      notify(msg, "error");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const summary = data?.summary || {
    students: 0,
    subjects: 0,
    exams: 0,
    questions: 0,
  };

  const recentExams = data?.recentExams || [];
  const topStudents = data?.topStudents || [];
  const activeStudents = data?.activeStudents || [];
  const subjectPopularity = data?.subjectPopularity || [];

  const maxActive = useMemo(
    () =>
      activeStudents.length
        ? Math.max(...activeStudents.map((d) => Number(d.count || 0)))
        : 1,
    [activeStudents]
  );

  const maxSubjectAttempts = useMemo(
    () =>
      subjectPopularity.length
        ? Math.max(...subjectPopularity.map((s) => Number(s.attempts || 0)))
        : 1,
    [subjectPopularity]
  );

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={800}>
            Admin Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            High-level overview of students, subjects, exams, and activity.
          </Typography>
        </Box>
        {busy && <CircularProgress size={24} />}
      </Stack>

      {/* Top Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={PeopleAltIcon}
            label="Total Students"
            value={summary.students}
            sub="Registered student accounts"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={MenuBookIcon}
            label="Subjects"
            value={summary.subjects}
            sub="Available CBT subjects"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={QuizIcon}
            label="Exams Taken"
            value={summary.exams}
            sub="Submitted exam sessions"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={HelpOutlineIcon}
            label="Questions"
            value={summary.questions}
            sub="Questions in the bank"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Left side: Recent Exams + Top Students */}
        <Grid item xs={12} md={7}>
          <Paper
            variant="outlined"
            sx={{ borderRadius: 3, mb: 3, p: 2.5, height: "100%" }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography variant="subtitle1" fontWeight={700}>
                Recent Exams
              </Typography>
              <Chip
                size="small"
                label={`${recentExams.length || 0} latest`}
                color="primary"
                variant="outlined"
              />
            </Stack>

            <Divider sx={{ mb: 1.5 }} />

            {recentExams.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No exams submitted yet.
              </Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell>Submitted</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentExams.map((ex) => (
                    <TableRow key={ex.id} hover>
                      <TableCell>{ex.student_name}</TableCell>
                      <TableCell>{ex.subject_name}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={`${ex.score}%`}
                          color={
                            ex.score >= 70
                              ? "success"
                              : ex.score >= 50
                              ? "warning"
                              : "error"
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{formatDateTime(ex.submitted_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>

          <Paper
            variant="outlined"
            sx={{ borderRadius: 3, p: 2.5, height: "100%" }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography variant="subtitle1" fontWeight={700}>
                Top Students
              </Typography>
              <Chip
                size="small"
                icon={<StarIcon fontSize="small" />}
                label="Best average scores"
                color="warning"
                variant="outlined"
              />
            </Stack>

            <Divider sx={{ mb: 1.5 }} />

            {topStudents.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No student performance data yet.
              </Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Avg. Score</TableCell>
                    <TableCell>Attempts</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topStudents.map((s, idx) => (
                    <TableRow key={s.full_name + idx} hover>
                      <TableCell>{s.full_name}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={`${s.avg_score}%`}
                          color="success"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{s.attempts}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        </Grid>

        {/* Right side: Activity + Subject Popularity */}
        <Grid item xs={12} md={5}>
          <Paper
            variant="outlined"
            sx={{ borderRadius: 3, p: 2.5, mb: 3 }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography variant="subtitle1" fontWeight={700}>
                Daily Active Students (7 days)
              </Typography>
              <TrendingUpIcon color="primary" fontSize="small" />
            </Stack>

            <Divider sx={{ mb: 1.5 }} />

            {activeStudents.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No activity yet in the last 7 days.
              </Typography>
            ) : (
              <Stack spacing={1.2}>
                {activeStudents.map((d) => {
                  const pct = (Number(d.count) / maxActive) * 100 || 0;
                  const label = new Date(d.day).toLocaleDateString();
                  return (
                    <Box key={d.day}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        sx={{ mb: 0.2 }}
                      >
                        <Typography variant="caption">{label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {d.count} student{Number(d.count) === 1 ? "" : "s"}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{ height: 6, borderRadius: 999 }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Paper>

          <Paper variant="outlined" sx={{ borderRadius: 3, p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              Subject Popularity
            </Typography>
            <Divider sx={{ mb: 1.5 }} />
            {subjectPopularity.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No subject attempts yet.
              </Typography>
            ) : (
              <Stack spacing={1.2}>
                {subjectPopularity.map((s) => {
                  const pct = (Number(s.attempts) / maxSubjectAttempts) * 100;
                  return (
                    <Box key={s.name}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        sx={{ mb: 0.2 }}
                      >
                        <Typography variant="body2">{s.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {s.attempts} attempt
                          {Number(s.attempts) === 1 ? "" : "s"}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{ height: 6, borderRadius: 999 }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          severity={toast.severity}
          variant="filled"
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
