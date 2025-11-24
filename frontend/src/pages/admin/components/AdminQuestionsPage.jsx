// =============================================
// AdminQuestionsPage.jsx  (All-in-One Manager)
// =============================================

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  LinearProgress,
  Checkbox,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SearchIcon from "@mui/icons-material/Search";

import api from "../../utils/api";

// ===============================
// Helper: file -> data URL
// ===============================
const fileToDataUrl = (file) =>
  new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });

// ===============================
// Subject Select (shared)
// ===============================
function SubjectSelect({ value, onChange }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get("/admin/subjects")
      .then((r) => {
        if (!mounted) return;
        const arr = (r.data?.subjects || r.data || []).map((s) => ({
          id: s.id,
          name: s.name,
          code: (s.code || "").toUpperCase(),
        }));
        setOptions(arr);
      })
      .finally(() => setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <TextField
      select
      label="Select Subject"
      fullWidth
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={loading}
      required
    >
      {options.map((s) => (
        <MenuItem key={s.id} value={s.id}>
          {s.name} {s.code ? `(${s.code})` : ""}
        </MenuItem>
      ))}
    </TextField>
  );
}

// ===============================
// ImageUploadField for stem_image
// ===============================
function ImageUploadField({ label = "Question Image", value, onChange }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(value || "");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setPreview(value || "");
  }, [value]);

  const pick = () => inputRef.current?.click();

  const handleFile = async (file) => {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setPreview(dataUrl);

    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/admin/uploads/image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data?.url) onChange(data.url);
      else onChange(dataUrl);
    } catch {
      onChange(dataUrl);
    } finally {
      setUploading(false);
    }
  };

  const onFileInput = async (e) => {
    const f = e.target.files?.[0];
    if (f) await handleFile(f);
    e.target.value = "";
  };

  const clear = (e) => {
    e.stopPropagation();
    setPreview("");
    onChange("");
  };

  return (
    <Box>
      <Typography variant="overline" color="text.secondary">
        {label}
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          mt: 0.5,
          p: 2,
          borderRadius: 3,
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderStyle: "dashed",
          cursor: "pointer",
          bgcolor: preview ? "#fafafa" : "inherit",
        }}
        onClick={pick}
      >
        {preview ? (
          <img
            src={preview}
            alt="preview"
            style={{ width: 80, height: 80, objectFit: "contain" }}
          />
        ) : (
          <ImageIcon />
        )}

        <Stack spacing={0.5} sx={{ flex: 1 }}>
          <Typography variant="body2">
            {preview ? "Image selected" : "Click to upload (optional)"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            PNG / JPEG / WEBP up to 5MB
          </Typography>
        </Stack>

        {preview && (
          <IconButton size="small" onClick={clear}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}

        <input
          ref={inputRef}
          hidden
          type="file"
          accept="image/*"
          onChange={onFileInput}
        />
      </Paper>

      {uploading && <LinearProgress sx={{ mt: 1 }} />}
    </Box>
  );
}

// ===============================
// Edit Question Dialog
// ===============================
function EditQuestionDialog({ open, onClose, question, onSaved }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (question) {
      setForm({
        id: question.id,
        question: question.question || "",
        option_a: question.option_a || "",
        option_b: question.option_b || "",
        option_c: question.option_c || "",
        option_d: question.option_d || "",
        correct_option: (question.correct_option || "A").toUpperCase(),
        explanation: question.explanation || "",
        difficulty: (question.difficulty || "medium").toLowerCase(),
        stem_image_url: question.stem_image_url || "",
      });
    } else {
      setForm(null);
    }
  }, [question]);

  const handleChange = (key, value) => {
    setForm((f) => ({ ...(f || {}), [key]: value }));
  };

  const handleSave = async () => {
    if (!form) return;
    try {
      setSaving(true);

      const payload = {
        question: form.question,
        option_a: form.option_a,
        option_b: form.option_b,
        option_c: form.option_c,
        option_d: form.option_d,
        correct_option: form.correct_option,
        explanation: form.explanation,
        difficulty: form.difficulty,
        stem_image_url: form.stem_image_url || null,
      };

      const { data } = await api.put(`/admin/questions/${form.id}`, payload);
      onSaved?.(data.question);
    } catch (err) {
      console.error("Save question error:", err);
      alert(
        err?.response?.data?.message || "Failed to save question. See console."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!form) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Question</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Question"
            value={form.question}
            onChange={(e) => handleChange("question", e.target.value)}
            multiline
            minRows={3}
            fullWidth
          />

          <ImageUploadField
            label="Question Image (stem_image_url)"
            value={form.stem_image_url}
            onChange={(url) => handleChange("stem_image_url", url)}
          />

          <Typography variant="subtitle2">Options</Typography>

          {["A", "B", "C", "D"].map((l) => (
            <TextField
              key={l}
              label={`Option ${l}`}
              value={form[`option_${l.toLowerCase()}`]}
              onChange={(e) =>
                handleChange(`option_${l.toLowerCase()}`, e.target.value)
              }
              fullWidth
            />
          ))}

          <Typography variant="subtitle2">Correct Option</Typography>
          <Stack direction="row" spacing={1}>
            {["A", "B", "C", "D"].map((l) => (
              <Chip
                key={l}
                label={l}
                color={form.correct_option === l ? "primary" : "default"}
                onClick={() => handleChange("correct_option", l)}
                clickable
              />
            ))}
          </Stack>

          <TextField
            label="Explanation (optional)"
            value={form.explanation}
            onChange={(e) => handleChange("explanation", e.target.value)}
            multiline
            minRows={2}
            fullWidth
          />

          <TextField
            select
            label="Difficulty"
            value={form.difficulty}
            onChange={(e) => handleChange("difficulty", e.target.value)}
            sx={{ width: 200 }}
          >
            <MenuItem value="easy">Easy</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="hard">Hard</MenuItem>
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ===============================
// Main Page Component
// ===============================
export default function AdminQuestionsPage() {
  const [subjectId, setSubjectId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const [toast, setToast] = useState({
    open: false,
    msg: "",
    severity: "info",
  });

  const truncated = (text, n = 80) => {
    if (!text) return "";
    return text.length > n ? text.slice(0, n) + "..." : text;
  };

  // =========================
  // Load questions (API)
  // =========================
  const loadQuestions = async (sid, pg = 1, searchTerm = "") => {
    if (!sid) {
      setQuestions([]);
      return;
    }
    try {
      setLoading(true);
      setSelected([]);
      setSelectAll(false);

      const { data } = await api.get("/admin/questions", {
        params: {
          subject_id: sid,
          page: pg,
          limit: 20,
          search: searchTerm,
        },
      });

      setQuestions(data.questions || []);
      setPage(data.page || pg);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Load questions error:", err);
      setToast({
        open: true,
        msg: err?.response?.data?.message || "Failed to load questions",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

const handleSubjectChange = (sid) => {
  const idNum = Number(sid);

  if (!sid || isNaN(idNum) || idNum <= 0) {
    setSubjectId("");
    setQuestions([]);
    setPage(1);
    setSearch("");
    return;
  }

  setSubjectId(idNum);
  setPage(1);
  setSearch("");
  loadQuestions(idNum, 1, "");
};


  const handleEditClick = (q) => {
    setEditingQuestion(q);
    setEditOpen(true);
  };

  const handleEditSaved = (updated) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === updated.id ? updated : q))
    );
    setToast({
      open: true,
      msg: "Question updated successfully",
      severity: "success",
    });
    setEditOpen(false);
    setEditingQuestion(null);
  };

  const handleDelete = async (q) => {
    const yes = window.confirm(
      `Are you sure you want to delete question ID ${q.id}?`
    );
    if (!yes) return;

    try {
      await api.delete(`/admin/questions/${q.id}`);
      setQuestions((prev) => prev.filter((x) => x.id !== q.id));
      setSelected((prev) => prev.filter((id) => id !== q.id));
      setToast({
        open: true,
        msg: "Question deleted",
        severity: "success",
      });
    } catch (err) {
      console.error("Delete question error:", err);
      setToast({
        open: true,
        msg: err?.response?.data?.message || "Failed to delete",
        severity: "error",
      });
    }
  };

  const handleDuplicate = async (q) => {
    try {
      const { data } = await api.post(
        `/admin/questions/${q.id}/duplicate`
      );
      // Add new question at top (current page)
      setQuestions((prev) => [data.question, ...prev]);
      setToast({
        open: true,
        msg: "Question duplicated",
        severity: "success",
      });
    } catch (err) {
      console.error("Duplicate question error:", err);
      setToast({
        open: true,
        msg: err?.response?.data?.message || "Failed to duplicate",
        severity: "error",
      });
    }
  };

  const handleExportCsv = () => {
 if (!subjectId || isNaN(Number(subjectId))) return;

    // Use axios instance baseURL for correct API URL
    const url = api.getUri({
      url: "/admin/questions/export",
      params: { subject_id: subjectId },
    });
    window.open(url, "_blank");
  };

  const handleBulkDeleteAll = async () => {
 if (!subjectId || isNaN(Number(subjectId))) return;

    const yes = window.confirm(
      "This will delete ALL questions for this subject. Are you sure?"
    );
    if (!yes) return;

    try {
      const { data } = await api.delete("/admin/questions/bulk", {
        params: { subject_id: subjectId },
      });
      setQuestions([]);
      setSelected([]);
      setSelectAll(false);
      setToast({
        open: true,
        msg: data.message || "All questions deleted",
        severity: "success",
      });
    } catch (err) {
      console.error("Bulk delete all error:", err);
      setToast({
        open: true,
        msg: err?.response?.data?.message || "Failed to delete all",
        severity: "error",
      });
    }
  };

  const handleBulkDeleteSelected = async () => {
  if (!subjectId || isNaN(Number(subjectId))) return;
if (selected.length === 0) return;

    const yes = window.confirm(
      `Delete ${selected.length} selected question(s)?`
    );
    if (!yes) return;

    try {
      const { data } = await api.post("/admin/questions/bulk-delete", {
        ids: selected,
      });

      setQuestions((prev) =>
        prev.filter((q) => !selected.includes(q.id))
      );
      setSelected([]);
      setSelectAll(false);

      setToast({
        open: true,
        msg: data.message || "Selected questions deleted",
        severity: "success",
      });
    } catch (err) {
      console.error("Bulk delete selected error:", err);
      setToast({
        open: true,
        msg:
          err?.response?.data?.message ||
          "Failed to delete selected questions",
        severity: "error",
      });
    }
  };

  const handleToggleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelected(questions.map((q) => q.id));
    } else {
      setSelected([]);
    }
  };

  const handleToggleSelectOne = (id, checked) => {
    setSelected((prev) => {
      if (checked) {
        return prev.includes(id) ? prev : [...prev, id];
      }
      return prev.filter((x) => x !== id);
    });
  };

  // Update selectAll when questions or selected change
  useEffect(() => {
    if (questions.length === 0) {
      setSelectAll(false);
      setSelected([]);
      return;
    }
    const allIds = questions.map((q) => q.id);
    const allSelected = allIds.every((id) => selected.includes(id));
    setSelectAll(allSelected);
  }, [questions, selected]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    setPage(1);
   if (subjectId && !isNaN(Number(subjectId))) {
  loadQuestions(subjectId, 1, val);
}

  };

  const handleChangePage = (newPage) => {
if (!subjectId || isNaN(Number(subjectId))) {
  setToast({
    open: true,
    msg: "Please select a valid subject",
    severity: "warning",
  });
  return;
}

    setPage(newPage);
    loadQuestions(subjectId, newPage, search);
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        Question Management
      </Typography>

      {/* Subject + Top Actions */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <Stack spacing={2}>
          <SubjectSelect value={subjectId} onChange={handleSubjectChange} />

          {subjectId && (
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button
                variant="outlined"
                onClick={handleExportCsv}
           disabled={!subjectId || isNaN(Number(subjectId))}

              >
                Export CSV
              </Button>

              <Button
                variant="outlined"
                color="error"
                onClick={handleBulkDeleteAll}
                disabled={!subjectId}
              >
                Delete All Questions
              </Button>

              {selected.length > 0 && (
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleBulkDeleteSelected}
                >
                  Delete Selected ({selected.length})
                </Button>
              )}
            </Stack>
          )}

          {loading && <LinearProgress />}
        </Stack>
      </Paper>

      {/* Search & Table */}
      <Paper variant="outlined" sx={{ borderRadius: 3 }}>
        <Box sx={{ p: 2, borderBottom: "1px solid #eee" }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <SearchIcon fontSize="small" />
            <TextField
              fullWidth
              size="small"
              label="Search Question Text"
              value={search}
              onChange={handleSearchChange}
              disabled={!subjectId}
            />
          </Stack>
        </Box>

        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    size="small"
                    checked={selectAll}
                    indeterminate={
                      selected.length > 0 &&
                      selected.length < questions.length
                    }
                    onChange={(e) =>
                      handleToggleSelectAll(e.target.checked)
                    }
                  />
                </TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Question</TableCell>
                <TableCell>Options</TableCell>
                <TableCell>Correct</TableCell>
                <TableCell>Difficulty</TableCell>
                <TableCell>Image</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {questions.map((q) => (
                <TableRow key={q.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      size="small"
                      checked={selected.includes(q.id)}
                      onChange={(e) =>
                        handleToggleSelectOne(q.id, e.target.checked)
                      }
                    />
                  </TableCell>

                  <TableCell>{q.id}</TableCell>

                  <TableCell>{truncated(q.question, 100)}</TableCell>

                  <TableCell>
                    <Typography variant="caption" component="div">
                      <b>A:</b> {truncated(q.option_a, 30)}{" "}
                      <b>B:</b> {truncated(q.option_b, 30)}{" "}
                      <b>C:</b> {truncated(q.option_c, 30)}{" "}
                      <b>D:</b> {truncated(q.option_d, 30)}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={q.correct_option}
                      color="primary"
                      size="small"
                    />
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={q.difficulty}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>

                  <TableCell>
                    {q.stem_image_url ? (
                      <Tooltip title="View image">
                        <a
                          href={q.stem_image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ImageIcon fontSize="small" />
                        </a>
                      </Tooltip>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        None
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick(q)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Duplicate">
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() => handleDuplicate(q)}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(q)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}

              {questions.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary">
                      {subjectId
                        ? "No questions found for this subject."
                        : "Select a subject to view questions."}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="outlined"
              disabled={page === 1}
              onClick={() => handleChangePage(page - 1)}
            >
              Prev
            </Button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const p = idx + 1;
              return (
                <Button
                  key={p}
                  variant={page === p ? "contained" : "outlined"}
                  onClick={() => handleChangePage(p)}
                >
                  {p}
                </Button>
              );
            })}

            <Button
              variant="outlined"
              disabled={page === totalPages}
              onClick={() => handleChangePage(page + 1)}
            >
              Next
            </Button>
          </Box>
        )}
      </Paper>

      {/* Edit Dialog */}
      <EditQuestionDialog
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditingQuestion(null);
        }}
        question={editingQuestion}
        onSaved={handleEditSaved}
      />

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
