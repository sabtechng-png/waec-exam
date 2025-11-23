// ==================================
// File: src/pages/dashboard/DashboardPage.jsx
// FINAL ERROR-FREE VERSION
// ==================================

import { useEffect, useState } from "react";
import {
  Grid,
  Paper,
  Typography,
  Stack,
  Avatar,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

import ShowChartIcon from "@mui/icons-material/ShowChart";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TimerIcon from "@mui/icons-material/Timer";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import { Line } from "react-chartjs-2";
import api from "../../utils/api";
// ===== FIX FOR CHART.JS v4 =====
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);


export default function DashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/dashboard/student").then((res) => setData(res.data));
  }, []);

  if (!data)
    return (
      <Typography variant="h6" sx={{ mt: 4 }}>
        Loading dashboard...
      </Typography>
    );

  const { summary, last_exam, best_subject, weak_subjects, trends, all_results } =
    data;

  // ------- Line Chart -------
  const chartData = {
    labels: trends.map((t) =>
      new Date(t.submitted_at).toLocaleDateString("en-US")
    ),
    datasets: [
      {
        label: "Score (%)",
        data: trends.map((t) => t.score),
        borderColor: "#0d6efd",
        backgroundColor: "rgba(13,110,253,0.15)",
        borderWidth: 3,
        tension: 0.35,
      },
    ],
  };

  // ------- Stat Card Component -------
  const StatCard = ({ icon, label, value }) => (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar sx={{ bgcolor: "#e8f1ff", color: "#0d6efd" }}>{icon}</Avatar>
        <Stack>
          <Typography variant="overline" color="textSecondary">
            {label}
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {value}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );

  return (
    <Box sx={{ px: 2 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        Student Dashboard
      </Typography>

      {/* ---------------------- STAT CARDS ---------------------- */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<PendingActionsIcon />}
            label="Pending Subjects"
            value={summary.pending}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TimerIcon />}
            label="Ongoing Subjects"
            value={summary.in_progress}
          />
        </Grid>

      
      </Grid>

      {/* ---------------------- LAST EXAM ---------------------- */}
      <Paper elevation={2} sx={{ p: 3, mt: 4, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          Last Exam Performance
        </Typography>
        <Divider sx={{ my: 2 }} />

        {last_exam ? (
          <>
            <Typography variant="subtitle1" fontWeight="bold">
              {last_exam.subject_name} — {last_exam.score}%
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Taken on {new Date(last_exam.submitted_at).toLocaleString()}
            </Typography>
          </>
        ) : (
          <Typography>No exams attempted yet.</Typography>
        )}
      </Paper>

      {/* ---------------------- BEST SUBJECT ---------------------- */}
      <Paper elevation={2} sx={{ p: 3, mt: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          Best Performing Subject
        </Typography>
        <Divider sx={{ my: 2 }} />

        {best_subject ? (
          <Typography variant="subtitle1" sx={{ display: "flex", alignItems: "center" }}>
            <EmojiEventsIcon sx={{ color: "#FFD700", mr: 1 }} />
            {best_subject.subject_name} — {best_subject.score}%
          </Typography>
        ) : (
          <Typography>No results yet.</Typography>
        )}
      </Paper>

      {/* ---------------------- WEAK SUBJECTS ---------------------- */}
      <Paper elevation={2} sx={{ p: 3, mt: 3, borderRadius: 3 }}>
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <WarningAmberIcon sx={{ color: "orange", mr: 1 }} />
          Weak Subjects (Score &lt; 50)
        </Typography>

        <Divider sx={{ my: 2 }} />

        {weak_subjects.length ? (
          <List>
            {weak_subjects.map((w, i) => (
              <ListItem key={i}>
                <ListItemText
                  primary={`${w.subject_name}`}
                  secondary={`Score: ${w.score}%`}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>No weak subjects. Good performance!</Typography>
        )}
      </Paper>

      {/* ---------------------- TREND CHART ---------------------- */}
      <Paper elevation={2} sx={{ p: 3, mt: 4, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          Performance Trend
        </Typography>

        <Divider sx={{ my: 2 }} />

        {trends.length ? (
          <Line data={chartData} height={80} />
        ) : (
          <Typography>No performance data yet.</Typography>
        )}
      </Paper>

      {/* ---------------------- EXAM HISTORY ---------------------- */}
      <Paper elevation={2} sx={{ p: 3, mt: 4, mb: 5, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          Exam History
        </Typography>

        <Divider sx={{ my: 2 }} />

        {all_results.length ? (
          <List>
            {all_results.map((r, i) => (
              <ListItem key={i}>
                <ListItemText
                  primary={`${r.subject_name} — ${r.score}%`}
                  secondary={new Date(r.submitted_at).toLocaleString()}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>No exam history yet.</Typography>
        )}
      </Paper>
    </Box>
  );
}
