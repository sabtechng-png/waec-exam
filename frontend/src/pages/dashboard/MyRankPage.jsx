import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Chip,
  Stack,
  Avatar,
} from "@mui/material";
import api from "../../utils/api";

const MyRankPage = () => {
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/leaderboard/my-rank");
        setInfo(data);
      } catch (err) {
        console.error("MY RANK ERROR:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <Box textAlign="center" mt={8}>
        <CircularProgress />
        <Typography mt={2}>Loading your ranking...</Typography>
      </Box>
    );
  }

  if (!info) {
    return <Typography>Unable to load rank information.</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        My Ranking & Performance
      </Typography>

      <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Typography variant="h6">Global Rank</Typography>
        <Typography variant="h3" fontWeight={700} color="primary">
          #{info.globalRank} / {info.totalStudents}
        </Typography>

        <Box mt={2}>
          <Chip
            label={`${info.badge.icon} ${info.badge.name}`}
            sx={{
              fontSize: "16px",
              bgcolor:
                info.badge.color === "gold"
                  ? "#FFD700"
                  : info.badge.color === "silver"
                  ? "#C0C0C0"
                  : info.badge.color === "bronze"
                  ? "#CD7F32"
                  : "#E0E0E0",
            }}
          />
        </Box>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Subject Rankings
        </Typography>

        {info.subjects.map((sub) => {
          const avg = Math.round(Number(sub.avg_score || 0));
          const best = Math.round(Number(sub.best_score || 0));

          return (
            <Box
              key={sub.subject_id}
              sx={{
                borderBottom: "1px solid #eee",
                pb: 2,
                mb: 2,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography>{sub.subject_name}</Typography>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip label={`Avg: ${avg}%`} color="primary" />
                  <Chip
                    label={`Best: ${best}%`}
                    color={best >= 70 ? "success" : best >= 50 ? "warning" : "error"}
                  />
                </Stack>
              </Stack>
            </Box>
          );
        })}
      </Paper>
    </Box>
  );
};

export default MyRankPage;
