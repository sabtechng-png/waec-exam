// =============================================
// UploadQuestionsPage.jsx  (UPDATED, CLEAN VERSION)
// =============================================

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  MenuItem,
  Divider,
  Snackbar,
  Alert,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";

import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ImageIcon from "@mui/icons-material/Image";
import DownloadIcon from "@mui/icons-material/Download";

import api from "../../utils/api";

const fileToDataUrl = (file) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

// ---------------------------------------------
// Subject Select dropdown
// ---------------------------------------------
function SubjectSelect({ value, onChange, label = "Subject", fullWidth = true, onLoaded }) {
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);

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
          code: s.code?.toUpperCase() || "",
          status: s.status !== false,
        }));
        setOptions(arr);
        onLoaded?.(arr);
      })
      .finally(() => setLoading(false));
    return () => (mounted = false);
  }, []);

  return (
    <TextField
      select
      label={label}
      value={value || ""}
      onChange={(e) => onChange?.(e.target.value)}
      fullWidth={fullWidth}
      required
      disabled={loading}
    >
      {options.map((s) => (
        <MenuItem key={s.id} value={s.id}>
          {s.name} {s.code ? `(${s.code})` : ""}
        </MenuItem>
      ))}
    </TextField>
  );
}

// ---------------------------------------------
// Image Upload for STEM IMAGE ONLY
// ---------------------------------------------
function ImageUploadField({ label = "Upload Image", value, onChange }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(value || "");
  const [uploading, setUploading] = useState(false);

  useEffect(() => { setPreview(value || ""); }, [value]);

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
      if (data?.url) onChange?.(data.url);
      else onChange?.(dataUrl);
    } catch {
      onChange?.(dataUrl);
    } finally {
      setUploading(false);
    }
  };

  const onFileInput = async (e) => {
    const f = e.target.files?.[0];
    if (f) await handleFile(f);
    e.target.value = "";
  };

  const clearPreview = () => {
    setPreview("");
    onChange?.("");
  };

  return (
    <Box>
      <Typography variant="overline" color="text.secondary">{label}</Typography>

      <Paper
        variant="outlined"
        sx={{
          mt: 0.5,
          p: 2,
          borderRadius: 3,
          display: "flex",
          alignItems: "center",
          gap: 2,
          cursor: "pointer",
          borderStyle: "dashed",
          bgcolor: preview ? "#fafafa" : "inherit",
        }}
        onClick={pick}
      >
        {preview ? (
          <img src={preview} alt="preview" style={{ width: 96, height: 96, objectFit: "contain" }} />
        ) : (
          <ImageIcon />
        )}

        <Stack spacing={0.5} sx={{ flex: 1 }}>
          <Typography variant="body2">
            {preview ? "Image selected" : label}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Drag/click to upload (PNG/JPEG/WebP)
          </Typography>
        </Stack>

        {preview && (
          <Tooltip title="Clear image">
            <IconButton onClick={clearPreview}><DeleteIcon /></IconButton>
          </Tooltip>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={onFileInput}
        />
      </Paper>

      {uploading && <LinearProgress sx={{ mt: 1 }} />}
    </Box>
  );
}

// =====================================================
// SINGLE QUESTION FORM
// =====================================================
function SingleQuestionForm() {
  const [subjectId, setSubjectId] = useState("");
  const [form, setForm] = useState({
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_option: "A",
    explanation: "",
    difficulty: "medium",
    stem_image_url: "",
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: "", severity: "info" });

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const isValid = useMemo(() => {
    if (!subjectId) return false;
    if (!form.question?.trim()) return false;
    if (!form.option_a?.trim() ||
        !form.option_b?.trim() ||
        !form.option_c?.trim() ||
        !form.option_d?.trim()) return false;
    if (!"ABCD".includes(form.correct_option)) return false;
    return true;
  }, [form, subjectId]);

  const submit = async (e) => {
    e?.preventDefault?.();
    if (!isValid) {
      setToast({ open: true, msg: "Fill all required fields.", severity: "error" });
      return;
    }

    const payload = {
      subject_id: subjectId,
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

    try {
      setSaving(true);
      await api.post("/admin/questions", payload);
      setToast({ open: true, msg: "Saved successfully", severity: "success" });

      // reset form
      setForm({
        question: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_option: "A",
        explanation: "",
        difficulty: "medium",
        stem_image_url: "",
      });

    } catch (e) {
      setToast({
        open: true,
        msg: e?.response?.data?.message || "Failed to save.",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      <Stack spacing={2} onSubmit={submit} component="form">

        <SubjectSelect value={subjectId} onChange={setSubjectId} />

        <TextField
          label="Question"
          value={form.question}
          onChange={(e) => set({ question: e.target.value })}
          multiline minRows={3}
          fullWidth
        />

        <ImageUploadField
          label="Question Image (optional)"
          value={form.stem_image_url}
          onChange={(url) => set({ stem_image_url: url })}
        />

        <Divider />

        <Typography variant="subtitle2">Options (mark one correct)</Typography>

        <Stack direction="row" spacing={2}>
          {["A", "B", "C", "D"].map((l) => (
            <Chip
              key={l}
              label={`Correct: ${l}`}
              color={form.correct_option === l ? "primary" : "default"}
              onClick={() => set({ correct_option: l })}
            />
          ))}
        </Stack>

        {["A", "B", "C", "D"].map((l) => (
          <TextField
            key={l}
            label={`Option ${l}`}
            value={form[`option_${l.toLowerCase()}`]}
            onChange={(e) => set({ [`option_${l.toLowerCase()}`]: e.target.value })}
            fullWidth
          />
        ))}

        <TextField
          label="Explanation (optional)"
          value={form.explanation}
          onChange={(e) => set({ explanation: e.target.value })}
          multiline minRows={2}
        />

        <TextField
          select
          label="Difficulty"
          value={form.difficulty}
          onChange={(e) => set({ difficulty: e.target.value })}
          sx={{ width: 200 }}
        >
          <MenuItem value="easy">Easy</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="hard">Hard</MenuItem>
        </TextField>

        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={() => window.history.back()}>
            Cancel
          </Button>

          <Button type="submit" variant="contained" startIcon={<CheckCircleIcon />}
            disabled={!isValid || saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </Stack>

      </Stack>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      >
        <Alert severity={toast.severity}>{toast.msg}</Alert>
      </Snackbar>
    </Paper>
  );
}

// =====================================================
// BULK UPLOAD PANEL
// =====================================================
function BulkUploadPanel() {
  const [subjectId, setSubjectId] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [zipFile, setZipFile] = useState(null);
  const [preview, setPreview] = useState([]);

  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: "", severity: "info" });

  const selected = useMemo(
    () => subjects.find((s) => s.id === subjectId) || null,
    [subjects, subjectId]
  );

  const pickCsv = (e) => {
    const f = e.target.files?.[0];
    setCsvFile(f || null);
    if (f) {
      f.text().then((txt) => setPreview(txt.split(/\r?\n/).slice(0, 6)));
    }
    e.target.value = "";
  };

  const pickZip = (e) => {
    const f = e.target.files?.[0];
    setZipFile(f || null);
    e.target.value = "";
  };

  const uploadNow = async () => {
    if (!subjectId) {
      setToast({ open: true, msg: "Select a subject", severity: "error" });
      return;
    }
    if (!csvFile) {
      setToast({ open: true, msg: "Select a CSV file", severity: "error" });
      return;
    }

    try {
      setBusy(true);
      const fd = new FormData();
      fd.append("subject_id", subjectId);
      fd.append("file", csvFile);
      if (zipFile) fd.append("images_zip", zipFile);

      const r = await api.post("/admin/questions/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setToast({
        open: true,
        msg: r.data?.message || "Upload completed",
        severity: "success",
      });

      setCsvFile(null);
      setZipFile(null);
      setPreview([]);

    } catch (e) {
      setToast({
        open: true,
        msg: e?.response?.data?.message || "Upload failed",
        severity: "error",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>

      <Stack spacing={2}>

        <SubjectSelect
          value={subjectId}
          onChange={setSubjectId}
          onLoaded={setSubjects}
        />

        <Stack direction="row" spacing={2}>
          <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>
            Choose CSV
            <input hidden type="file" accept=".csv" onChange={pickCsv} />
          </Button>

          <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>
            Optional ZIP
            <input hidden type="file" accept=".zip" onChange={pickZip} />
          </Button>

          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={uploadNow}
            disabled={busy}
          >
            {busy ? "Uploading..." : "Upload"}
          </Button>
        </Stack>

        {preview.length > 0 && (
          <Paper variant="outlined" sx={{ p: 2, bgcolor: "#fafafa" }}>
            <Typography variant="caption">Preview (first lines)</Typography>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
              {preview.join("\n")}
            </pre>
          </Paper>
        )}

      </Stack>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      >
        <Alert severity={toast.severity}>{toast.msg}</Alert>
      </Snackbar>

    </Paper>
  );
}

// =====================================================
// MAIN PAGE
// =====================================================
export default function UploadQuestionsPage() {
  const [tab, setTab] = useState(1);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700}>Upload Questions</Typography>
      <Typography variant="body2" color="text.secondary">
        Upload using CSV (single subject) or manually add single questions.
      </Typography>

      <Paper variant="outlined" sx={{ mt: 2, borderRadius: 3 }}>
        <Tabs value={tab} onChange={(_e, v) => setTab(v)} variant="fullWidth">
          <Tab label="Single Question" />
          <Tab label="Bulk Upload (CSV/ZIP)" />
        </Tabs>
        <Divider />
        <Box sx={{ p: 2 }}>
          {tab === 0 && <SingleQuestionForm />}
          {tab === 1 && <BulkUploadPanel />}
        </Box>
      </Paper>

      <Box sx={{ mt: 3 }}>
        <Alert severity="info">
          CSV Header: <b>
            question, option_a, option_b, option_c, option_d,
            correct_option, explanation, difficulty, stem_image_url
          </b>
        </Alert>
      </Box>
    </Box>
  );
}
