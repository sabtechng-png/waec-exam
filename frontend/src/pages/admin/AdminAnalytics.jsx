import { useEffect, useState } from "react";
import { Box, Grid, Paper, Typography, CircularProgress, Snackbar, Alert } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { BarChart, Bar } from "recharts";
import api from "../../utils/api";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function AdminAnalytics() {
  const [data, setData] = useState({
    subjectPerformance: [],
    studentPerformance: [],
    questionDifficulty: [],
    studentActivity: [],
  });
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: "", severity: "info" });

  const notify = (msg, severity = "info") =>
    setToast({ open: true, msg, severity });

  const loadAnalytics = async () => {
    setBusy(true);
    try {
      const res = await api.get("/admin/analytics");
      setData(res.data);
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to load analytics data";
      notify(msg, "error");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>
        Admin Analytics
      </Typography>

      {busy ? (
        <CircularProgress sx={{ display: "block", margin: "auto" }} />
      ) : (
        <>
          {/* Subject Performance Pie Chart */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 2, height: "100%" }} elevation={3}>
                <Typography variant="h6" gutterBottom>
                  Subject Performance
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={data.subjectPerformance}
                      dataKey="average_score"
                      nameKey="subject_name"
                      outerRadius={90}
                      fill="#8884d8"
                    >
                      {data.subjectPerformance.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Student Performance Bar Chart */}
            <Grid item xs={12} sm={6} md={8}>
              <Paper sx={{ p: 2, height: "100%" }} elevation={3}>
                <Typography variant="h6" gutterBottom>
                  Top Performing Students
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.studentPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="full_name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="average_score" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>

          {/* Student Activity Line Chart */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={12}>
              <Paper sx={{ p: 2, height: "100%" }} elevation={3}>
                <Typography variant="h6" gutterBottom>
                  Student Activity Over Last 7 Days
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={data.studentActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="active_students"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>

          {/* Question Difficulty Bar Chart */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={6}>
              <Paper sx={{ p: 2, height: "100%" }} elevation={3}>
                <Typography variant="h6" gutterBottom>
                  Question Difficulty Breakdown
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.questionDifficulty}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="difficulty" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="correct_answers" fill="#82ca9d" />
                    <Bar dataKey="total_attempts" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}

      {/* Notifications */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setToast({ ...toast, open: false })}
      >
        <Alert severity={toast.severity} variant="filled">
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
