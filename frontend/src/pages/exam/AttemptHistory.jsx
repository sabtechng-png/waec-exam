// src/pages/exam/AttemptHistory.jsx
import { useEffect, useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { Box, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip, Button } from "@mui/material";
import api from "../../utils/api";

export default function AttemptHistory() {
  const { subjectId } = useParams();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/exam/history/${subjectId}`);
        setRows(data.attempts || []);
      } catch {
        setRows([]);
      }
    })();
  }, [subjectId]);

  return (
    <Box p={2}>
      <Typography variant="h6" sx={{ mb: 2 }}>Attempt History • Subject #{subjectId}</Typography>
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Attempt ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Started</TableCell>
              <TableCell>Submitted</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Score</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id}>
                <TableCell>#{r.id}</TableCell>
                <TableCell>
                  <Chip size="small" label={r.status} color={r.status === 'submitted' ? 'success' : (r.status === 'expired' ? 'warning' : 'default')} />
                </TableCell>
                <TableCell>{r.started_at ? new Date(r.started_at).toLocaleString() : '—'}</TableCell>
                <TableCell>{r.submitted_at ? new Date(r.submitted_at).toLocaleString() : '—'}</TableCell>
                <TableCell>{r.duration_minutes ?? '—'} min</TableCell>
                <TableCell>
                  {typeof r.score === 'number' && typeof r.total === 'number' ? `${r.score}/${r.total}` : '—'}
                </TableCell>
                <TableCell align="right">
                  {(r.status === 'submitted' || r.status === 'expired') ? (
                    <Button component={RouterLink} to={`/exam/review/${r.id}`} size="small">View Script</Button>
                  ) : (
                    <Typography variant="caption" color="text.secondary">In progress</Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow><TableCell colSpan={7}>No attempts yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
