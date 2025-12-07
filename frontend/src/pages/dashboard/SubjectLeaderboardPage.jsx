import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Avatar,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";

import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import api from "../../utils/api";
import { useParams, useNavigate } from "react-router-dom";

export default function SubjectLeaderboardPage() {
  const { subjectId: routeSubjectId } = useParams();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [myRank, setMyRank] = useState(null);
  const [rankLoading, setRankLoading] = useState(false);

  // =============================================================
  // STEP 1 — LOAD SUBJECT LIST FROM BACKEND
  // =============================================================
  const loadSubjects = async () => {
    try {
      const { data } = await api.get("/api/student/subjects");

      // Backend returns { subjects: [...] }
      setSubjects(data.subjects || []);
    } catch (err) {
      console.error("❌ ERROR FETCHING SUBJECTS:", err);
    }
  };

  // =============================================================
  // STEP 2 — LOAD LEADERBOARD (TOP 10)
  // =============================================================
  const loadLeaderboard = async (id) => {
    if (!id) return;

    setLoading(true);
    try {
      const { data } = await api.get(`/leaderboard/subject/${id}?limit=10`);
      setRows(data.leaderboard || []);
    } catch (err) {
      console.error("❌ LEADERBOARD ERROR:", err);
      setRows([]);
    }
    setLoading(false);
  };

  // =============================================================
  // STEP 3 — LOAD MY RANK
  // =============================================================
  const loadMyRank = async (id) => {
    if (!id) return;

    setRankLoading(true);
    try {
      const { data } = await api.get(`/leaderboard/subject/${id}/my-rank`);
      setMyRank(data);
    } catch (err) {
      console.error("❌ MY RANK ERROR:", err);
      setMyRank({ error: "Unable to load your rank." });
    }
    setRankLoading(false);
  };

  // =============================================================
  // HANDLE ROUTE PARAM — FIX INVALID VALUES
  // =============================================================
  useEffect(() => {
    if (!routeSubjectId || isNaN(routeSubjectId)) {
      setSubjectId("");
    } else {
      setSubjectId(routeSubjectId);
    }
  }, [routeSubjectId]);

  // =============================================================
  // FIRST LOAD — FETCH SUBJECT LIST
  // =============================================================
  useEffect(() => {
    loadSubjects();
  }, []);

  // =============================================================
  // WHEN subjectId CHANGES — LOAD LEADERBOARD
  // =============================================================
  useEffect(() => {
    if (subjectId) {
      loadLeaderboard(subjectId);
      setMyRank(null);
    }
  }, [subjectId]);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        🏅 Subject Leaderboard
      </Typography>

      <Typography variant="body2" sx={{ mb: 3, color: "gray" }}>
        Select a subject to view the top 10 students and your personal rank.
      </Typography>

      {/* SUBJECT DROPDOWN */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Select Subject</InputLabel>
        <Select
          value={subjectId}
          label="Select Subject"
          onChange={(e) => {
            const id = e.target.value;
            setSubjectId(id);

            // FIXED — Correct route link
            navigate(`/dashboard/leaderboard/subject/${id}`);

            setMyRank(null);
          }}
        >
          {subjects.map((sub) => (
            <MenuItem key={sub.subject_id} value={sub.subject_id}>
              {sub.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* NO SUBJECT SELECTED */}
      {!subjectId && (
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography>Select a subject to view rankings.</Typography>
        </Paper>
      )}

      {/* LOADING */}
      {loading && subjectId && (
        <Box textAlign="center" mt={4}>
          <CircularProgress />
          <Typography mt={2}>Loading leaderboard…</Typography>
        </Box>
      )}

      {/* TABLE */}
      {!loading && subjectId && (
        <Paper sx={{ p: 2, borderRadius: 3, mt: 1 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Rank</TableCell>
                  <TableCell>Student</TableCell>
                  <TableCell>Best Score</TableCell>
                  <TableCell>Average Score</TableCell>
                  <TableCell>Attempts</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No ranking data for this subject.
                    </TableCell>
                  </TableRow>
                )}

                {rows.map((row, i) => {
                  const rank = i + 1;

                  const medal =
                    rank === 1
                      ? "#FFD700"
                      : rank === 2
                      ? "#C0C0C0"
                      : rank === 3
                      ? "#CD7F32"
                      : null;

                  return (
                    <TableRow key={row.student_id}>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography fontWeight={700}>{rank}</Typography>
                          {medal && <EmojiEventsIcon sx={{ color: medal }} />}
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar>{row.full_name.charAt(0)}</Avatar>
                          <Typography>{row.full_name}</Typography>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Chip label={`${row.best_score}%`} color="success" />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={`${row.avg_score}%`}
                          color={
                            row.avg_score >= 70
                              ? "success"
                              : row.avg_score >= 50
                              ? "warning"
                              : "error"
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={`${row.exams_taken}`}
                          variant="outlined"
                          color="primary"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* VIEW MY RANK BUTTON */}
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            sx={{ mt: 3 }}
            onClick={() => loadMyRank(subjectId)}
          >
            View My Rank
          </Button>

          {/* MY RANK */}
          {rankLoading && (
            <Box textAlign="center" mt={3}>
              <CircularProgress />
              <Typography mt={1}>Calculating your rank…</Typography>
            </Box>
          )}

          {myRank && !rankLoading && (
            <Paper sx={{ p: 3, mt: 3 }}>
              {myRank.rank === null ? (
                <Typography>
                  You have no submitted exam for this subject.
                </Typography>
              ) : (
                <>
                  <Typography variant="h6" fontWeight={700}>
                    Your Rank
                  </Typography>

                  <Typography variant="h3" color="primary" fontWeight={800}>
                    #{myRank.rank}
                  </Typography>

                  <Typography sx={{ mt: 1 }}>
                    Total Students: <b>{myRank.total_students}</b>
                  </Typography>

                  <Typography sx={{ mt: 1 }}>
                    Best Score: <b>{myRank.best_score}%</b>
                  </Typography>

                  <Typography sx={{ mt: 1 }}>
                    Average Score: <b>{myRank.avg_score}%</b>
                  </Typography>
                </>
              )}
            </Paper>
          )}
        </Paper>
      )}
    </Box>
  );
}
