import React, { useState } from "react";
import api from "../../../utils/api";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  MenuItem,
  Box,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function ObjectiveQuestionsForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const categories = [
    "lexis_meaning",
    "antonyms",
    "synonyms",
    "structure",
    "oral_vowel",
    "oral_stress",
    "emphatic_stress",
  ];

  // Read ?category=lexis_meaning from URL if present
  const initialCategory =
    searchParams.get("category") && categories.includes(searchParams.get("category"))
      ? searchParams.get("category")
      : "lexis_meaning";

  const [category, setCategory] = useState(initialCategory);
  const [question, setQuestion] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctOption, setCorrectOption] = useState("A");

  const [saving, setSaving] = useState(false);

  // Snackbar
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const notify = (msg) => {
    setMessage(msg);
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!question.trim()) {
      notify("Please enter a question.");
      return;
    }

    setSaving(true);
    try {
      await api.post("/admin/english/objectives", {
        category,
        question,
        option_a: optionA,
        option_b: optionB,
        option_c: optionC,
        option_d: optionD,
        correct_option: correctOption,
      });

      notify("Question added successfully!");

      // Clear fields but keep category + correct option
      setQuestion("");
      setOptionA("");
      setOptionB("");
      setOptionC("");
      setOptionD("");
    } catch (err) {
      console.error("Error adding MCQ:", err);
      notify("Failed to add question.");
    } finally {
      setSaving(false);
    }
  };

  const goToListPage = () => {
    navigate(`/admin/english/objectives/list?category=${category}`);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Add English Objective Question
        </Typography>

        {/* CATEGORY SELECT */}
        <TextField
          select
          label="Category"
          fullWidth
          sx={{ mb: 2 }}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </TextField>

        {/* LINK TO LIST PAGE FOR THIS CATEGORY */}
        <Box sx={{ mb: 3 }}>
          <Button variant="outlined" onClick={goToListPage}>
            📋 View Questions for this Category
          </Button>
        </Box>

        {/* QUESTION + OPTIONS */}
        <TextField
          label="Question"
          fullWidth
          sx={{ mb: 2 }}
          multiline
          minRows={2}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <TextField
          label="Option A"
          fullWidth
          sx={{ mb: 1 }}
          value={optionA}
          onChange={(e) => setOptionA(e.target.value)}
        />
        <TextField
          label="Option B"
          fullWidth
          sx={{ mb: 1 }}
          value={optionB}
          onChange={(e) => setOptionB(e.target.value)}
        />
        <TextField
          label="Option C"
          fullWidth
          sx={{ mb: 1 }}
          value={optionC}
          onChange={(e) => setOptionC(e.target.value)}
        />
        <TextField
          label="Option D"
          fullWidth
          sx={{ mb: 2 }}
          value={optionD}
          onChange={(e) => setOptionD(e.target.value)}
        />

        <TextField
          label="Correct Option (A/B/C/D)"
          fullWidth
          sx={{ mb: 2 }}
          value={correctOption}
          onChange={(e) => setCorrectOption(e.target.value.toUpperCase())}
        />

        <Box sx={{ mt: 2, display: "flex", gap: 2, alignItems: "center" }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} /> Saving...
              </>
            ) : (
              "Save Question"
            )}
          </Button>
        </Box>

        <Snackbar
          open={open}
          autoHideDuration={2000}
          onClose={() => setOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity="success" variant="filled">
            {message}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
}
