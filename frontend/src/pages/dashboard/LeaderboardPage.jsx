// ======================================
// FIXED GLOBAL LEADERBOARD PAGE
// ======================================

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Avatar,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Stack,
  Divider,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import api from "../../utils/api";

export default function LeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/leaderboard/global");
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Leaderboard Load Error:", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  if (loading)
    return (
      <Box textAlign="center" mt={8}>
        <CircularProgress />
        <Typography mt={2}>Loading leaderboard...</Typography>
      </Box>
    );

  // 🟢 If truly empty
  if (!rows || rows.length === 0) {
    return (
      <Box>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
          🏆 Global Leaderboard
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: "gray" }}>
          Ranking based on highest submitted exam scores.
        </Typography>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography>No leaderboard data available yet.</Typography>
        </Paper>
      </Box>
    );
  }

  // 🟢 Only take the number available (1–3)
  const champions = rows.slice(0, 3);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        🏆 Global Leaderboard
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: "gray" }}>
        Ranking based on highest submitted exam scores.
      </Typography>

      {/* ===== TOP CHAMPIONS (works even with 1 or 2) ===== */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        🔥 Top Champions
      </Typography>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        {champions.map((item, index) => {
          const name = item.full_name || "Student";
          const medalColors = ["#FFD700", "#C0C0C0", "#CD7F32"];

          return (
            <Paper
              key={item.student_id}
              elevation={3}
              sx={{
                p: 2,
                flex: 1,
                borderRadius: 3,
                textAlign: "center",
                borderTop: `6px solid ${medalColors[index]}`,
              }}
            >
              <EmojiEventsIcon
                sx={{ color: medalColors[index], fontSize: 38, mb: 1 }}
              />

              <Avatar
                sx={{
                  mx: "auto",
                  bgcolor: "primary.main",
                  width: 60,
                  height: 60,
                  fontSize: 24,
                }}
              >
                {name.charAt(0).toUpperCase()}
              </Avatar>

              <Typography mt={1} fontWeight={700}>
                {name}
              </Typography>

              <Chip
                label={`Best Score: ${item.best_score}%`}
                size="small"
                color="success"
                sx={{ mt: 1 }}
              />
            </Paper>
          );
        })}
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {/* ===== FULL LEADERBOARD TABLE ===== */}
      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Best Score</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((item, i) => {
                const name = item.full_name || "Student";
                const medal =
                  i === 0
                    ? "#FFD700"
                    : i === 1
                    ? "#C0C0C0"
                    : i === 2
                    ? "#CD7F32"
                    : null;

                return (
                  <TableRow hover key={item.student_id}>
                    <TableCell width={100}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography fontWeight={700}>{i + 1}</Typography>
                        {medal && (
                          <EmojiEventsIcon
                            sx={{ color: medal, fontSize: 20 }}
                          />
                        )}
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar sx={{ bgcolor: "primary.main" }}>
                          {name.charAt(0)}
                        </Avatar>
                        <Typography>{name}</Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={`${item.best_score}%`}
                        color="success"
                        variant="outlined"
                      />
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
