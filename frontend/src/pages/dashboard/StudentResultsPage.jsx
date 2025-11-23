// src/pages/dashboard/StudentResultsPage.jsx
import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Stack,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";

export default function StudentResultsPage() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/exam/results/all");
        setResults(data.results || []);
      } catch (err) {
        console.error("Error loading results:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ====== SUMMARY STATS ======
  const summary = useMemo(() => {
    if (!results.length) return { avg: 0, best: 0, total: 0 };

    const scores = results.map((r) => Number(r.score || 0));
    const avg =
      scores.length > 0
        ? Math.round(scores.reduce((sum, x) => sum + x, 0) / scores.length)
        : 0;

    const best = Math.max(...scores);

    return { avg, best, total: results.length };
  }, [results]);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        🧾 My Exam Results
      </Typography>

      {/* SUMMARY CARDS */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h6">{summary.total}</Typography>
            <Typography variant="body2" color="text.secondary">
              Total Exams Submitted
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h6">{summary.avg}%</Typography>
            <Typography variant="body2" color="text.secondary">
              Average Score
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h6">{summary.best}%</Typography>
            <Typography variant="body2" color="text.secondary">
              Best Performance
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* RESULTS TABLE */}
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell>Review</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {results.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No completed exams yet.
                  </TableCell>
                </TableRow>
              )}

              {results.map((r, i) => {
                const color =
                  r.score >= 70
                    ? "success"
                    : r.score >= 50
                    ? "warning"
                    : "error";

                // ============ EXPIRATION CHECK ============
                const submittedAt = new Date(r.submitted_at);
                const now = new Date();
                const hoursPassed = (now - submittedAt) / 36e5;
                const expired = hoursPassed > 24;

                return (
                  <TableRow
                    key={r.exam_id}
                    sx={{
                      opacity: expired ? 0.65 : 1,
                    }}
                  >
                    <TableCell>{i + 1}</TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography>{r.subject_name}</Typography>

                        {expired && (
                          <Chip
                            icon={<LockIcon />}
                            label="Expired"
                            variant="outlined"
                            size="small"
                            color="error"
                            sx={{ fontWeight: 600 }}
                          />
                        )}
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Chip label={`${r.score}%`} color={color} />
                    </TableCell>

                    <TableCell>
                      <Chip label={r.status} size="small" />
                    </TableCell>

                    <TableCell>
                      {r.submitted_at
                        ? new Date(r.submitted_at).toLocaleString()
                        : "—"}
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={
                            expired ? <LockIcon /> : <VisibilityIcon />
                          }
                          onClick={() =>
                            navigate(`/dashboard/result/${r.exam_id}`)
                          }
                        >
                          {expired ? "Score Only" : "View Details"}
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
