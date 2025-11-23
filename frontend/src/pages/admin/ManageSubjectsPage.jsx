import { useEffect, useMemo, useState } from "react";
import {
  Box, Paper, Typography, Button, IconButton, Stack, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Snackbar, Alert, Tooltip, CircularProgress
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import api from "../../utils/api";

function StatusChip({ active }) {
  return (
    <Chip
      size="small"
      label={active ? "Active" : "Inactive"}
      color={active ? "success" : "default"}
      variant={active ? "filled" : "outlined"}
    />
  );
}

// --- helper: first 3 alphabetic characters uppercased ("Computer Science" -> "COM")
function first3AlphaUpper(name = "") {
  const letters = (name.match(/[A-Za-z]/g) || []).join("");
  return letters.slice(0, 3).toUpperCase();
}

function AddEditDialog({ open, onClose, onSave, initial }) {
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name || "");
  const [code, setCode] = useState(initial?.code || "");
  const [codeTouched, setCodeTouched] = useState(false); // track manual edits
  const [loading, setLoading] = useState(false);

  // reset when dialog opens with new initial
  useEffect(() => {
    setName(initial?.name || "");
    setCode(initial?.code || "");
    setCodeTouched(false);
  }, [initial, open]);

  // Auto-generate ONLY when adding and user hasn't typed code yet
  useEffect(() => {
    if (!isEdit && !codeTouched) {
      const auto = first3AlphaUpper(name);
      if (auto && !code) setCode(auto);
      if (!name) setCode("");
    }
  }, [name, isEdit, codeTouched]);

  const valid = useMemo(() => name.trim() && code.trim(), [name, code]);

  const handleSave = async () => {
    if (!valid) return;
    try {
      setLoading(true);
      await onSave({ name: name.trim(), code: code.trim() });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{isEdit ? "Edit Subject" : "Add Subject"}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Subject Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            label="Code (auto: first 3 letters, editable)"
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setCodeTouched(true); }}
            required
            inputProps={{ maxLength: 20 }}
            helperText={isEdit ? "Editing updates both UI and database." : "You can override the suggested code."}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={!valid || loading}
          startIcon={loading ? <CircularProgress size={18} /> : null}>
          {isEdit ? "Save Changes" : "Create Subject"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function ManageSubjectsPage() {
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: "", severity: "info" });

  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);

  const notify = (msg, severity = "success") => setToast({ open: true, msg, severity });

  const load = async () => {
    setBusy(true);
    try {
      const { data } = await api.get("/admin/subjects");
      // Expect backend to return id, name, code, status for ALL subjects (active + inactive)
      const list = data?.subjects || data || [];
      setRows(list.map((s) => ({ id: s.id, name: s.name, code: s.code, status: s.status !== false })));
    } catch (e) {
      notify("Failed to load subjects", "error");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { load(); }, []);

  const addSubject = async ({ name, code }) => {
    try {
      await api.post("/admin/subjects", { name, code });
      notify("Subject created");
      load();
    } catch (e) {
      const msg = e?.response?.data?.message || "Create failed";
      notify(msg, "error");
    }
  };

  const saveEdit = async ({ name, code }) => {
    try {
      await api.put(`/admin/subjects/${editRow.id}`, { name, code });
      notify("Subject updated");
      setEditRow(null);
      load();
    } catch (e) {
      const msg = e?.response?.data?.message || "Update failed";
      notify(msg, "error");
    }
  };

  const toggleStatus = async (r) => {
    try {
      await api.patch(`/admin/subjects/${r.id}/toggle`, { status: !r.status });
      notify(`Subject ${r.status ? "deactivated" : "activated"}`);
      // update locally without reloading entire table
      setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, status: !r.status } : x)));
    } catch {
      notify("Toggle failed", "error");
    }
  };

  const remove = async (r) => {
    if (!window.confirm(`Delete "${r.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/subjects/${r.id}`);
      notify("Subject deleted");
      setRows((prev) => prev.filter((x) => x.id !== r.id));
    } catch {
      notify("Delete failed", "error");
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
        Manage Subjects
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Create, edit, and toggle subjects used across questions and exams.
      </Typography>

      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1.5 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
          Add Subject
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ borderRadius: 3 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width="40%">Name</TableCell>
                <TableCell width="20%">Code</TableCell>
                <TableCell width="20%">Status</TableCell>
                <TableCell width="20%" align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} hover sx={{ opacity: r.status ? 1 : 0.55 }}>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.code}</TableCell>
                  <TableCell><StatusChip active={!!r.status} /></TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <span>
                        <IconButton onClick={() => setEditRow(r)}>
                          <EditIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title={r.status ? "Deactivate" : "Activate"}>
                      <span>
                        <IconButton onClick={() => toggleStatus(r)}>
                          {r.status ? <ToggleOffIcon /> : <ToggleOnIcon />}
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <span>
                        <IconButton color="error" onClick={() => remove(r)}>
                          <DeleteIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {!rows.length && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {busy && <CircularProgress size={18} />}
                      <Typography variant="body2" color="text.secondary">
                        {busy ? "Loading..." : "No subjects yet."}
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add */}
      <AddEditDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={addSubject}
      />
      {/* Edit */}
      <AddEditDialog
        open={!!editRow}
        onClose={() => setEditRow(null)}
        onSave={saveEdit}
        initial={editRow}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setToast((t) => ({ ...t, open: false }))} severity={toast.severity} variant="filled">
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
