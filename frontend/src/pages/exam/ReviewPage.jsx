// src/pages/exam/ReviewPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box, Paper, Typography, Stack, Chip, Divider, CircularProgress, Button
} from "@mui/material";
import api from "../../utils/api";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DownloadIcon from "@mui/icons-material/Download";

export default function ReviewPage() {
  const { sessionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [items, setItems] = useState([]);
// === PDF Downloader Helper (Authenticated) ===
const downloadPdf = async (url, filename) => {
  try {
    const res = await api.get(url, {
      responseType: "blob"
    });

    const file = new Blob([res.data], { type: "application/pdf" });
    const fileURL = window.URL.createObjectURL(file);

    // ✅ Open in new tab
    window.open(fileURL);

    // ✅ Alternative: auto-download instead of open
    // const a = document.createElement("a");
    // a.href = fileURL;
    // a.download = filename;
    // a.click();

  } catch (err) {
    console.error("PDF Download error:", err);
    alert("Unable to download PDF. Please try again.");
  }
};

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/exam/session/${sessionId}/review`);
        setSession(data.session);
        setItems(data.items || []);
      } catch {
        setSession(null);
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId]);

  if (loading) return <Box p={3}><CircularProgress/></Box>;
  if (!session) return <Box p={3}>Not found.</Box>;

  return (
    <Box p={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">Review • {session.subject_name}</Typography>

        <Stack direction="row" gap={1} alignItems="center">
          <Chip label={`Score: ${session.score}/${session.total}`} color="primary" />

          <Button
            size="small"
            variant="outlined"
            startIcon={<PictureAsPdfIcon />}
           onClick={() => downloadPdf(`/exam/session/${session.id}/session-pdf`, `Session_${session.id}.pdf`)}

          >
            Download Subject PDF
          </Button>

          <Button
            size="small"
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => window.open(`/exam/session/${session.id}/session-pdf`, "_blank")}
          >
            Download Session PDF
          </Button>
        </Stack>
      </Stack>

      {items.map((it, i) => {
        const picked = it.selected_option;
        const correct = it.correct_option;
        const isCorrect = picked && correct && picked === correct;
        return (
          <Paper key={it.question_id} variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2" color="text.secondary">Q{i+1} • ID {it.question_id}</Typography>
              <Stack direction="row" gap={1}>
                <Chip size="small" label={`Time: ${it.time_spent_seconds || 0}s`} />
                <Chip size="small" label={isCorrect ? "Correct" : "Wrong"} color={isCorrect ? "success" : "error"} />
              </Stack>
            </Stack>
            <Divider sx={{ my: 1.5 }} />

            <Typography sx={{ mb: 1.5 }}>{it.question}</Typography>

            {it.stem_image_url && (
              <Box sx={{ mb: 1.5 }}>
                <img src={it.stem_image_url} alt="" style={{ maxWidth: "100%", borderRadius: 8 }} />
              </Box>
            )}

            {["A","B","C","D"].map((opt, k) => {
              const txtKey = ["option_a","option_b","option_c","option_d"][k];
              const imgKey = ["option_a_image_url","option_b_image_url","option_c_image_url","option_d_image_url"][k];
              const pickedThis = picked === opt;
              const correctThis = correct === opt;

              return (
                <Paper key={opt} variant="outlined" sx={{
                  p: 1.25, mb: 1, borderRadius: 2,
                  borderColor: correctThis ? "success.main" : (pickedThis ? "error.main" : "divider"),
                  bgcolor: correctThis ? "success.light" : (pickedThis ? "error.light" : "background.paper")
                }}>
                  <Stack direction="row" gap={1.5} alignItems="center">
                    <Chip label={opt} size="small" color={correctThis ? "success" : (pickedThis ? "error" : "default")} />
                    <Typography>{it[txtKey]}</Typography>
                  </Stack>
                  {it[imgKey] && <Box mt={1}><img src={it[imgKey]} alt="" style={{maxWidth:"100%", borderRadius:6}}/></Box>}
                </Paper>
              );
            })}
          </Paper>
        );
      })}
    </Box>
  );
}
