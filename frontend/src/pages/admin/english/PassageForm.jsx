import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import { Container, Paper, TextField, Button, Typography, Box } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

export default function PassageForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("comprehension");
  const [passage, setPassage] = useState("");

  useEffect(() => {
    if (isEdit) {
      api.get(`/admin/english/passages/${id}`).then((res) => {
        setTitle(res.data.title);
        setCategory(res.data.category);
        setPassage(res.data.passage);
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async () => {
    if (isEdit) {
      await api.put(`/admin/english/passages/${id}`, {
        title,
        passage,
        category,
      });
    } else {
      await api.post(`/admin/english/passages`, {
        title,
        passage,
        category,
      });
    }

    navigate("/admin/english/passages");
  };

  return (
    <Box sx={{ width: "100%", px: { xs: 1, md: 3 }, py: 3 }}>
      {/* Main container inside AdminLayout */}
      <Container maxWidth="md">
        <Paper sx={{ p: 3 }}>

          <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
            {isEdit ? "Edit Passage" : "Add Passage"}
          </Typography>

          <TextField
            label="Title"
            fullWidth
            sx={{ mb: 2 }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <TextField
            label="Category (comprehension, cloze, life_changer)"
            fullWidth
            sx={{ mb: 2 }}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <TextField
            label="Passage Text"
            fullWidth
            multiline
            rows={10}
            value={passage}
            onChange={(e) => setPassage(e.target.value)}
          />

          <Button variant="contained" sx={{ mt: 3 }} onClick={handleSubmit}>
            Save Passage
          </Button>

        </Paper>
      </Container>
    </Box>
  );
}
