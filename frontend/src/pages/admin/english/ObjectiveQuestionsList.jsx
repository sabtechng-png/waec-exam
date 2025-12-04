import React, { useEffect, useState, useRef } from "react";
import api from "../../../utils/api";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  MenuItem,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";

// All categories
const categories = [
  "lexis_meaning",
  "antonyms",
  "synonyms",
  "structure",
  "oral_vowel",
  "oral_stress",
  "emphatic_stress",
];

// CSV HEADER sample
const CSV_SAMPLE_HEADER =
  "question,option_a,option_b,option_c,option_d,correct_option\n";

export default function ObjectiveQuestionsList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCategory =
    searchParams.get("category") && categories.includes(searchParams.get("category"))
      ? searchParams.get("category")
      : "lexis_meaning";

  const [category, setCategory] = useState(initialCategory);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(parseInt(searchParams.get("page") || 1));
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Search
  const [search, setSearch] = useState("");
  const searchTimeoutRef = useRef(null);

  // Snackbar
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const showSnack = (message, severity = "success") =>
    setSnack({ open: true, message, severity });

  // Edit modal
  const [editingQuestion, setEditingQuestion] = useState(null);

  // CSV
  const fileInputRef = useRef(null);

  // Fetch paginated + search
  const fetchQuestions = async () => {
    if (!category) return;
    setLoading(true);

    try {
      const res = await api.get("/admin/english/objectives/paged", {
        params: { category, page, limit, search },
      });

      setQuestions(res.data.data || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Paging error:", err);
      showSnack("Failed to load questions.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSearchParams({ category, page });
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, page]);

  // Category change
  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPage(1);
  };

  // Navigate to add page
  const handleAdd = () => {
    navigate(`/admin/english/objectives?category=${category}`);
  };

  // Open edit
  const handleEditClick = (q) => {
    setEditingQuestion({ ...q });
  };

  const handleEditChange = (field, value) => {
    setEditingQuestion((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveEdit = async () => {
    try {
      await api.put(`/admin/english/objectives/${editingQuestion.id}`, editingQuestion);
      showSnack("Question updated.");
      setEditingQuestion(null);
      fetchQuestions();
    } catch (err) {
      console.error("Update error:", err);
      showSnack("Failed to update.", "error");
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this question?")) return;

    try {
      await api.delete(`/admin/english/objectives/${id}`);
      showSnack("Question deleted.");
      fetchQuestions();
    } catch (err) {
      console.error("Delete error:", err);
      showSnack("Failed to delete.", "error");
    }
  };

  // CSV Upload
  const handleCsvUploadClick = () => {
    if (!category) {
      showSnack("Select category first.", "error");
      return;
    }
    if (fileInputRef.current) fileInputRef.current.click();
  };

  // Handle CSV File
  const handleCsvFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target.result;

      try {
        const lines = text.trim().split(/\r?\n/);
        if (lines.length < 2) {
          showSnack("CSV is empty.", "error");
          return;
        }

        // Header validation
        const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
        const required = [
          "question",
          "option_a",
          "option_b",
          "option_c",
          "option_d",
          "correct_option",
        ];

        const missing = required.filter((c) => !header.includes(c));
        if (missing.length > 0) {
          showSnack(`Missing columns: ${missing.join(", ")}`, "error");
          return;
        }

        const parsed = [];
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].trim();
          if (!row) continue;

          const cols = row.split(",");
          const obj = {};
          header.forEach((h, idx) => {
            obj[h] = (cols[idx] || "").trim();
          });

          if (obj.question) {
            parsed.push({
              question: obj.question,
              option_a: obj.option_a || "",
              option_b: obj.option_b || "",
              option_c: obj.option_c || "",
              option_d: obj.option_d || "",
              correct_option: (obj.correct_option || "A").toUpperCase(),
            });
          }
        }

        //---------------------------------------------------
        // 1. Detect duplicate INSIDE CSV
        //---------------------------------------------------
        const seen = new Set();
        const duplicatesInCsv = [];

        parsed.forEach((q) => {
          const key = q.question.toLowerCase().trim();
          if (seen.has(key)) {
            duplicatesInCsv.push(q.question);
          }
          seen.add(key);
        });

        if (duplicatesInCsv.length > 0) {
          showSnack(
            `Duplicate in CSV: ${duplicatesInCsv.slice(0, 5).join(", ")}${
              duplicatesInCsv.length > 5 ? "..." : ""
            }`,
            "error"
          );
          return;
        }

        //---------------------------------------------------
        // 2. Check duplicates IN DATABASE
        //---------------------------------------------------
        const check = await api.post(
          `/admin/english/objectives/check-duplicates/${category}`,
          { questions: parsed.map((q) => q.question) }
        );

        if (check.data.duplicates.length > 0) {
          showSnack(
            `Duplicates in DB: ${check.data.duplicates.slice(0, 5).join(", ")}${
              check.data.duplicates.length > 5 ? "..." : ""
            }`,
            "error"
          );
          return;
        }

        //---------------------------------------------------
        // 3. Upload (clean)
        //---------------------------------------------------
        await api.post(`/admin/english/objectives/bulk/${category}`, {
          questions: parsed,
        });

        showSnack(`Uploaded: ${parsed.length} questions.`);
        fetchQuestions();
      } catch (err) {
        console.error("CSV error:", err);
        showSnack("CSV processing failed.", "error");
      } finally {
        e.target.value = "";
      }
    };

    reader.readAsText(file);
  };

  // Download CSV sample
  const downloadSampleCsv = () => {
    const blob = new Blob([CSV_SAMPLE_HEADER], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "objective_questions_sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export full CSV
  const downloadCsvExport = async () => {
    try {
      const res = await api.get("/admin/english/objectives/all", {
        params: { category },
      });

      const rows = res.data || [];
      if (rows.length === 0) {
        showSnack("No questions to export.", "warning");
        return;
      }

      let csv = CSV_SAMPLE_HEADER;
      rows.forEach((q) => {
        csv += `"${q.question.replace(/"/g, '""')}",${q.option_a},${q.option_b},${q.option_c},${q.option_d},${q.correct_option}\n`;
      });

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `objective_${category}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      showSnack("Export failed.", "error");
    }
  };

  // Pagination helpers
  const nextPage = () => page < totalPages && setPage(page + 1);
  const prevPage = () => page > 1 && setPage(page - 1);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          English Objective Questions
        </Typography>

        {/* Category + Actions */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
          <TextField
            select
            label="Category"
            value={category}
            onChange={handleCategoryChange}
            sx={{ minWidth: 220 }}
          >
            {categories.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>

          <Button variant="outlined" onClick={handleAdd}>
            ➕ Add Question
          </Button>

          <Button variant="contained" onClick={handleCsvUploadClick}>
            📤 Upload CSV
          </Button>

          <Button variant="outlined" color="secondary" onClick={downloadSampleCsv}>
            ⬇ Sample CSV
          </Button>

          <Button variant="outlined" color="success" onClick={downloadCsvExport}>
            ⬇ Export CSV
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={handleCsvFileChange}
          />
        </Box>

        {/* CSV HEADER PREVIEW */}
        <Paper sx={{ p: 2, mb: 3, background: "#f4f4f4" }}>
          <Typography variant="subtitle2">CSV Header Format:</Typography>
          <pre style={{ margin: 0 }}>{CSV_SAMPLE_HEADER}</pre>
        </Paper>

        {/* SEARCH BAR */}
        <TextField
          label="Search question..."
          fullWidth
          sx={{ mb: 3 }}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            clearTimeout(searchTimeoutRef.current);
            searchTimeoutRef.current = setTimeout(() => {
              setPage(1);
              fetchQuestions();
            }, 500);
          }}
        />

        {/* TABLE */}
        {loading ? (
          <Box sx={{ py: 5, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : questions.length === 0 ? (
          <Typography>No questions found.</Typography>
        ) : (
          <>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Question</TableCell>
                  <TableCell>Options</TableCell>
                  <TableCell>Correct</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {questions.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell>{q.id}</TableCell>
                    <TableCell sx={{ maxWidth: 350 }}>{q.question}</TableCell>
                    <TableCell>
                      A: {q.option_a} <br />
                      B: {q.option_b} <br />
                      C: {q.option_c} <br />
                      D: {q.option_d}
                    </TableCell>
                    <TableCell>{q.correct_option}</TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => handleEditClick(q)}>
                        ✏️ Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDelete(q.id)}
                      >
                        🗑 Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <Box
              sx={{
                mt: 2,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Typography>
                Page {page} of {totalPages} — Total {total}
              </Typography>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Button onClick={prevPage} disabled={page === 1}>
                  ◀ Prev
                </Button>
                <Button onClick={nextPage} disabled={page === totalPages}>
                  Next ▶
                </Button>
              </Box>
            </Box>
          </>
        )}

        {/* EDIT MODAL */}
        <Dialog
          open={!!editingQuestion}
          onClose={() => setEditingQuestion(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Edit Question</DialogTitle>
          <DialogContent dividers>
            {editingQuestion && (
              <>
                <TextField
                  select
                  label="Category"
                  fullWidth
                  sx={{ mb: 2 }}
                  value={editingQuestion.category}
                  onChange={(e) =>
                    handleEditChange("category", e.target.value)
                  }
                >
                  {categories.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Question"
                  multiline
                  minRows={2}
                  fullWidth
                  sx={{ mb: 2 }}
                  value={editingQuestion.question}
                  onChange={(e) =>
                    handleEditChange("question", e.target.value)
                  }
                />

                {["a", "b", "c", "d"].map((opt) => (
                  <TextField
                    key={opt}
                    label={`Option ${opt.toUpperCase()}`}
                    fullWidth
                    sx={{ mb: 1 }}
                    value={editingQuestion[`option_${opt}`]}
                    onChange={(e) =>
                      handleEditChange(`option_${opt}`, e.target.value)
                    }
                  />
                ))}

                <TextField
                  label="Correct Option (A/B/C/D)"
                  fullWidth
                  value={editingQuestion.correct_option}
                  onChange={(e) =>
                    handleEditChange(
                      "correct_option",
                      e.target.value.toUpperCase()
                    )
                  }
                />
              </>
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setEditingQuestion(null)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveEdit}>
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* SNACK */}
        <Snackbar
          open={snack.open}
          autoHideDuration={3000}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          <Alert severity={snack.severity} variant="filled">
            {snack.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
}
