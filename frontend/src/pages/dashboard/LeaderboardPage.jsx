import { useEffect, useState } from "react";
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
  Button,
  Stack,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import api from "../../utils/api";

export default function LeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [pagination, setPagination] = useState(null);

  const loadData = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/leaderboard?page=${page}&limit=50`);
      setList(data.leaderboard);
      setPagination(data.pagination);
    } catch (err) {
      console.error("LEADERBOARD LOAD ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
  }, []);

  if (loading)
    return (
      <Box textAlign="center" mt={5}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        🏆 Leaderboard — Top Students
      </Typography>

      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Exams Taken</TableCell>
                <TableCell>Average Score</TableCell>
                <TableCell>Best Score</TableCell>
                <TableCell>Best Subject</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {list.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No leaderboard data available.
                  </TableCell>
                </TableRow>
              )}

              {list.map((row, index) => {
                const avg = Math.round(Number(row.avg_score || 0));
                const best = Number(row.best_score || 0);

                let avgColor =
                  avg >= 70 ? "success" : avg >= 50 ? "warning" : "error";

                const rank = (pagination.currentPage - 1) * 50 + (index + 1);

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
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography fontWeight={600}>{rank}</Typography>
                        {medal && (
                          <EmojiEventsIcon style={{ color: medal }} />
                        )}
                      </Stack>
                    </TableCell>

                    <TableCell>{row.full_name}</TableCell>

                    <TableCell>
                      <Chip label={row.exams_taken} color="primary" size="small" />
                    </TableCell>

                    <TableCell>
                      <Chip label={`${avg}%`} color={avgColor} />
                    </TableCell>

                    <TableCell>
                      <Chip label={`${best}%`} variant="outlined" color="success" />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={row.best_subject}
                        color="secondary"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* PAGINATION */}
        <Stack
          direction="row"
          justifyContent="center"
          spacing={2}
          sx={{ mt: 2 }}
        >
          <Button
            variant="outlined"
            disabled={pagination.currentPage === 1}
            onClick={() => loadData(pagination.currentPage - 1)}
          >
            Previous
          </Button>

          <Typography sx={{ pt: 1 }}>
            Page {pagination.currentPage} of {pagination.totalPages}
          </Typography>

          <Button
            variant="outlined"
            disabled={pagination.currentPage >= pagination.totalPages}
            onClick={() => loadData(pagination.currentPage + 1)}
          >
            Next
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
