import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  IconButton,
  Modal,
  Stack,
  Divider,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Pagination,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import api from "../../../utils/api";

const PAGE_SIZE = 10; // questions per page

export default function PassageQuestionsForm() {
  const { passageId } = useParams();

  const [loading, setLoading] = useState(true);
  const [passage, setPassage] = useState(null);
  const [questions, setQuestions] = useState([]);

  // New question form
  const [question, setQuestion] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correct, setCorrect] = useState("A");

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({});

  // Pagination
  const [page, setPage] = useState(1);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = (_, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Delete confirmation
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // ------------------------------------------------------------
  // LOAD PASSAGE + QUESTIONS
  // ------------------------------------------------------------
  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/english/passages/${passageId}`);
      const qRes = await api.get(
        `/admin/english/passages/${passageId}/questions`
      );

      setPassage(res.data);
      setQuestions(qRes.data || []);
      setPage(1); // reset to first page when reload
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to load passage/questions", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [passageId]);

  // ------------------------------------------------------------
  // SAVE NEW QUESTION
  // ------------------------------------------------------------
  const saveQuestion = async () => {
    if (!question.trim()) {
      showSnackbar("Enter question text", "warning");
      return;
    }

    try {
      await api.post(`/admin/english/passages/${passageId}/questions`, {
        question,
        option_a: optionA,
        option_b: optionB,
        option_c: optionC,
        option_d: optionD,
        correct_option: correct,
      });

      setQuestion("");
      setOptionA("");
      setOptionB("");
      setOptionC("");
      setOptionD("");
      setCorrect("A");

      showSnackbar("Question added");
      await load();
    } catch (err) {
      console.error(err);
      showSnackbar("Error saving question", "error");
    }
  };

  // ------------------------------------------------------------
  // DELETE QUESTION (with confirm dialog)
  // ------------------------------------------------------------
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/admin/english/passages/questions/${deleteId}`);
      showSnackbar("Question deleted");
      setConfirmOpen(false);
      setDeleteId(null);
      await load();
    } catch (err) {
      console.error(err);
      showSnackbar("Delete failed", "error");
    }
  };

  const cancelDelete = () => {
    setConfirmOpen(false);
    setDeleteId(null);
  };

  // ------------------------------------------------------------
  // CSV UPLOAD
  // ------------------------------------------------------------
  const handleCSV = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const rows = text.split("\n").map((r) => r.trim()).filter(Boolean);

      if (!rows.length) {
        showSnackbar("CSV file is empty", "warning");
        return;
      }

      const header = rows[0].split(",");
      if (header.length < 6) {
        showSnackbar("Invalid CSV format. Expect at least 6 columns.", "error");
        return;
      }

      const parsed = rows.slice(1).map((row) => {
        const c = row.split(",");
        return {
          question: c[0] || "",
          option_a: c[1] || "",
          option_b: c[2] || "",
          option_c: c[3] || "",
          option_d: c[4] || "",
          correct_option: (c[5] || "A").trim().toUpperCase()[0],
        };
      });

      const res = await api.post(
        `/admin/english/passages/${passageId}/questions/bulk`,
        { questions: parsed }
      );

      const inserted = res.data?.inserted ?? 0;
      const duplicates = res.data?.duplicates ?? [];
      showSnackbar(
        `Uploaded ${inserted} questions. Skipped ${duplicates.length} duplicate(s).`,
        "success"
      );
      await load();
    } catch (err) {
      console.error(err);
      showSnackbar("CSV upload failed", "error");
    }
  };

  // ------------------------------------------------------------
  // SAVE EDITED QUESTION
  // ------------------------------------------------------------
  const saveEdit = async () => {
    if (!editData?.id) return;

    try {
      await api.put(`/admin/english/passages/questions/${editData.id}`, {
        question: editData.question || "",
        option_a: editData.option_a || "",
        option_b: editData.option_b || "",
        option_c: editData.option_c || "",
        option_d: editData.option_d || "",
        correct_option: (editData.correct_option || "A")
          .toString()
          .trim()
          .toUpperCase()
          .slice(0, 1),
      });

      showSnackbar("Question updated");
      setEditOpen(false);
      await load();
    } catch (err) {
      console.error(err);
      showSnackbar("Update failed", "error");
    }
  };

  // ------------------------------------------------------------
  // PAGINATION (client-side)
  // ------------------------------------------------------------
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(questions.length / PAGE_SIZE)),
    [questions.length]
  );

  const paginatedQuestions = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return questions.slice(start, end);
  }, [questions, page]);

  const handlePageChange = (_, value) => {
    setPage(value);
  };

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  if (loading) {
    return (
      <Box p={4} textAlign="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={4} maxWidth="1000px" mx="auto">
      {/* PAGE HEADER */}
      <Typography variant="h5" fontWeight="bold" mb={1}>
        Passage Questions — {passage?.title}
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" mb={2}>
        Manage questions linked to this comprehension passage. You can add
        single questions, bulk upload with CSV, edit, delete, and paginate
        through the list.
      </Typography>

      {/* PASSAGE CARD */}
      <Paper
        elevation={1}
        sx={{
          mb: 3,
          p: 2.5,
          borderRadius: 2,
          backgroundColor: "#ffffff",
        }}
      >
        <Typography
          variant="body1"
          sx={{ whiteSpace: "pre-line", lineHeight: 1.6 }}
        >
          {passage?.passage}
        </Typography>
      </Paper>

      {/* CSV UPLOAD + TEMPLATE INFO */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", sm: "center" }}
        mb={3}
      >
        <Button variant="outlined" component="label">
          Upload CSV
          <input type="file" accept=".csv" hidden onChange={handleCSV} />
        </Button>

        <Typography variant="body2" color="text.secondary">
          <b>CSV header:</b>{" "}
          <code>question, option_a, option_b, option_c, option_d, correct</code>
        </Typography>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {/* ADD QUESTION FORM */}
      <Paper
        elevation={1}
        sx={{
          p: 3,
          borderRadius: 2,
          mb: 4,
          backgroundColor: "#ffffff",
        }}
      >
        <Typography variant="h6" mb={2}>
          Add Question
        </Typography>

        <TextField
          label="Question"
          fullWidth
          multiline
          rows={2}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2}>
          <TextField
            label="Option A"
            fullWidth
            value={optionA}
            onChange={(e) => setOptionA(e.target.value)}
          />
          <TextField
            label="Option B"
            fullWidth
            value={optionB}
            onChange={(e) => setOptionB(e.target.value)}
          />
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2}>
          <TextField
            label="Option C"
            fullWidth
            value={optionC}
            onChange={(e) => setOptionC(e.target.value)}
          />
          <TextField
            label="Option D"
            fullWidth
            value={optionD}
            onChange={(e) => setOptionD(e.target.value)}
          />
        </Stack>

        <TextField
          label="Correct Option (A–D)"
          fullWidth
          value={correct}
          onChange={(e) =>
            setCorrect(
              e.target.value.trim().replace(/[^A-D]/gi, "").toUpperCase()
            )
          }
          sx={{ mb: 3 }}
        />

        <Button variant="contained" onClick={saveQuestion}>
          Save Question
        </Button>
      </Paper>

      {/* QUESTIONS LIST + PAGINATION */}
      <Box>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Typography variant="h6">
            Questions ({questions.length})
          </Typography>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="small"
          />
        </Stack>

        {paginatedQuestions.map((q) => (
          <Paper
            key={q.id}
            elevation={0}
            sx={{
              p: 2,
              mb: 1.5,
              borderRadius: 1.5,
              border: "1px solid #e0e0e0",
              backgroundColor: "#ffffff",
            }}
          >
            <Typography fontWeight="bold" mb={0.5}>
              {q.question}
            </Typography>

            <Typography variant="body2">A: {q.option_a}</Typography>
            <Typography variant="body2">B: {q.option_b}</Typography>
            <Typography variant="body2">C: {q.option_c}</Typography>
            <Typography variant="body2">D: {q.option_d}</Typography>

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              mt={1}
            >
              <Typography variant="body2">
                <b>Correct:</b> {q.correct_option}
              </Typography>

              <Stack direction="row" spacing={1}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => {
                    setEditData(q);
                    setEditOpen(true);
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>

                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteClick(q.id)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>
          </Paper>
        ))}

        {questions.length === 0 && (
          <Typography variant="body2" color="text.secondary" mt={2}>
            No questions added yet. Use the form above or upload a CSV file.
          </Typography>
        )}
      </Box>

      {/* EDIT QUESTION MODAL */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)}>
        <Box
          sx={{
            width: 520,
            bgcolor: "white",
            p: 3,
            borderRadius: 2,
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Typography variant="h6" mb={2}>
            Edit Question
          </Typography>

          <TextField
            fullWidth
            label="Question"
            multiline
            rows={2}
            value={editData.question || ""}
            onChange={(e) =>
              setEditData({ ...editData, question: e.target.value })
            }
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Option A"
            value={editData.option_a || ""}
            onChange={(e) =>
              setEditData({ ...editData, option_a: e.target.value })
            }
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Option B"
            value={editData.option_b || ""}
            onChange={(e) =>
              setEditData({ ...editData, option_b: e.target.value })
            }
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Option C"
            value={editData.option_c || ""}
            onChange={(e) =>
              setEditData({ ...editData, option_c: e.target.value })
            }
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Option D"
            value={editData.option_d || ""}
            onChange={(e) =>
              setEditData({ ...editData, option_d: e.target.value })
            }
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Correct Option (A–D)"
            value={editData.correct_option || ""}
            onChange={(e) =>
              setEditData({
                ...editData,
                correct_option: e.target.value
                  .trim()
                  .replace(/[^A-D]/gi, "")
                  .toUpperCase()
                  .slice(0, 1),
              })
            }
            sx={{ mb: 3 }}
          />

          <Button variant="contained" onClick={saveEdit}>
            Save Changes
          </Button>
        </Box>
      </Modal>

      {/* DELETE CONFIRM DIALOG */}
      <Dialog open={confirmOpen} onClose={cancelDelete}>
        <DialogTitle>Delete Question</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this question? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete}>Cancel</Button>
          <Button color="error" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR NOTIFICATIONS */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
