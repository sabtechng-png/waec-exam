import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import { Button, Container, Paper, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function PassageList() {
  const [passages, setPassages] = useState([]);
  const navigate = useNavigate();

  const loadPassages = async () => {
    const res = await api.get("/admin/english/passages");
    setPassages(res.data);
  };

  useEffect(() => {
    loadPassages();
  }, []);

  const deletePassage = async (id) => {
    if (!window.confirm("Delete this passage?")) return;
    await api.delete(`/admin/english/passages/${id}`);
    loadPassages();
  };

  return (
    <Box sx={{ width: "100%", px: { xs: 1, md: 3 }, py: 3 }}>
      <Container maxWidth="lg">
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
            English Passages
          </Typography>

          <Button
            variant="contained"
            sx={{ mb: 2 }}
            onClick={() => navigate("/admin/english/passages/new")}
          >
            ➕ Add Passage
          </Button>

          {passages.map((p) => (
            <Paper key={p.id} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6">{p.title}</Typography>

              <Typography sx={{ mt: 1, mb: 2, whiteSpace: "pre-wrap" }}>
                {p.passage.substring(0, 200)}...
              </Typography>

              <Box display="flex" gap={2}>
                <Button
                  onClick={() => navigate(`/admin/english/passages/${p.id}`)}
                >
                  ✏️ Edit Passage
                </Button>

                <Button
                  onClick={() =>
                    navigate(`/admin/english/passages/questions/${p.id}`)
                  }
                >
                  📝 Manage Questions
                </Button>

                <Button color="error" onClick={() => deletePassage(p.id)}>
                  🗑 Delete
                </Button>
              </Box>
            </Paper>
          ))}
        </Paper>
      </Container>
    </Box>
  );
}
