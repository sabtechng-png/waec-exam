// =============================================
// AdminQuestionsPage.jsx  (Main Container Page)
// Clean, modular, maintainable
// =============================================

import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  Snackbar,
  Alert,
  LinearProgress,
  TableContainer,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

import api from "../../utils/api";
import SubjectSelect from "../../components/questions/SubjectSelect";
import QuestionsTable from "../../components/questions/QuestionsTable";
import EditQuestionDialog from "../../components/questions/EditQuestionDialog";

export default function AdminQuestionsPage() {
  const [subjectId, setSubjectId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
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

  const truncated = (text, n = 80) =>
    !text ? "" : text.length > n ? text.slice(0, n) + "..." : text;

  // =======================================================
  // Load Questions (paginated)
  // =======================================================
  const loadQuestions = async (sid, pg = 1, searchTerm = "") => {
    if (!sid) {
      setQuestions([]);
      setTotalQuestions(0);
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

      // If backend also returns totalQuestions, keep it in sync
      if (typeof data.totalQuestions === "number") {
        setTotalQuestions(data.totalQuestions);
      }

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

  // =======================================================
  // Load only total count for a subject
  // (uses /admin/questions/count)
  // =======================================================
  const loadTotalCount = async (sid) => {
    if (!sid) {
      setTotalQuestions(0);
      return;
    }

    try {
      const { data } = await api.get("/admin/questions/count", {
        params: { subject_id: sid },
      });
      setTotalQuestions(data.total ?? 0);
    } catch (err) {
      console.error("Count error:", err);
      setTotalQuestions(0);
    }
  };

  // =======================================================
  // Subject Change
  // =======================================================
  const handleSubjectChange = (sid) => {
    const idNum = Number(sid);

    if (!sid || isNaN(idNum) || idNum <= 0) {
      setSubjectId("");
      setQuestions([]);
      setTotalQuestions(0);
      setPage(1);
      setSearch("");
      setSelected([]);
      setSelectAll(false);
      return;
    }

    setSubjectId(idNum);
    setPage(1);
    setSearch("");
    setSelected([]);
    setSelectAll(false);

    loadQuestions(idNum, 1, "");
    loadTotalCount(idNum);
  };

  // =======================================================
  // CRUD Handlers
  // =======================================================
  const onEditClick = (q) => {
    setEditingQuestion(q);
    setEditOpen(true);
  };

  const onEditSaved = (updated) => {
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

  const onDelete = async (q) => {
    const yes = window.confirm(`Delete question ID ${q.id}?`);
    if (!yes) return;

    try {
      await api.delete(`/admin/questions/${q.id}`);

      setQuestions((prev) => prev.filter((x) => x.id !== q.id));
      setSelected((prev) => prev.filter((id) => id !== q.id));
      setTotalQuestions((t) => Math.max(0, t - 1));

      setToast({
        open: true,
        msg: "Question deleted",
        severity: "success",
      });
    } catch (err) {
      console.error("Delete error:", err);
      setToast({
        open: true,
        msg: err?.response?.data?.message || "Failed to delete",
        severity: "error",
      });
    }
  };

  const onDuplicate = async (q) => {
    try {
      const { data } = await api.post(`/admin/questions/${q.id}/duplicate`);

      setQuestions((prev) => [data.question, ...prev]);
      setTotalQuestions((t) => t + 1);

      setToast({
        open: true,
        msg: "Question duplicated",
        severity: "success",
      });
    } catch (err) {
      console.error("Duplicate error:", err);
      setToast({
        open: true,
        msg: err?.response?.data?.message || "Failed to duplicate",
        severity: "error",
      });
    }
  };

  // =======================================================
  // Bulk Delete All
  // =======================================================
  const handleBulkDeleteAll = async () => {
    if (!subjectId) return;

    const yes = window.confirm("Delete ALL questions for this subject?");
    if (!yes) return;

    try {
      await api.delete("/admin/questions/bulk", {
        params: { subject_id: subjectId },
      });

      setQuestions([]);
      setSelected([]);
      setSelectAll(false);
      setTotalQuestions(0);

      setToast({
        open: true,
        msg: "All questions deleted",
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

  // =======================================================
  // Bulk Delete Selected
  // =======================================================
  const handleBulkDeleteSelected = async () => {
    if (!subjectId || selected.length === 0) return;

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
      setTotalQuestions((t) => Math.max(0, t - selected.length));
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

  // =======================================================
  // Search
  // =======================================================
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (!subjectId) return;
    loadQuestions(subjectId, 1, val);
  };

  // =======================================================
  // Selection Handlers
  // =======================================================
  const onToggleSelectAll = (checked) => {
    setSelectAll(checked);
    setSelected(checked ? questions.map((q) => q.id) : []);
  };

  const onToggleSelectOne = (id, checked) => {
    setSelected((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  };

  // =======================================================
  // Pagination
  // =======================================================
  const handleChangePage = (newPage) => {
    if (!subjectId) return;
    setPage(newPage);
    loadQuestions(subjectId, newPage, search);
  };

  // =======================================================
  // RENDER
  // =======================================================
  return (
    <Box>
      {/* Title */}
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        Question Management
      </Typography>

      {/* Total Counter */}
      {subjectId && (
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          <b>Total Questions:</b> {totalQuestions}
        </Typography>
      )}

      {/* Subject + Top Actions */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <Stack spacing={2}>
          <SubjectSelect value={subjectId} onChange={handleSubjectChange} />

          {subjectId && (
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button
                variant="outlined"
                onClick={() => {
                  const url = api.getUri({
                    url: "/admin/questions/export",
                    params: { subject_id: subjectId },
                  });
                  window.open(url, "_blank");
                }}
              >
                Export CSV
              </Button>

              <Button
                variant="outlined"
                color="error"
                onClick={handleBulkDeleteAll}
              >
                Delete All
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

      {/* Search */}
      <Paper variant="outlined" sx={{ p: 2, borderBottom: "1px solid #eee" }}>
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
      </Paper>

      {/* Table */}
      <TableContainer sx={{ maxHeight: 600 }}>
        <QuestionsTable
          questions={questions}
          truncated={truncated}
          selected={selected}
          selectAll={selectAll}
          onToggleSelectAll={onToggleSelectAll}
          onToggleOne={onToggleSelectOne}
          onEdit={onEditClick}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
        />
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ p: 2, display: "flex", gap: 1, justifyContent: "center" }}>
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
                variant={p === page ? "contained" : "outlined"}
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

      {/* Edit Dialog */}
      <EditQuestionDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        question={editingQuestion}
        onSaved={onEditSaved}
      />

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      >
        <Alert severity={toast.severity}>{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
