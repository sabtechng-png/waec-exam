// =============================================
// File: src/pages/admin/UploadQuestionsPage.jsx
// Mode: Single-Subject Bulk Upload (CSV + optional ZIP)
// - Subject is selected via dropdown (required)
// - CSV header (single-subject):
//   question,stem_image_url,option_a,option_b,option_c,option_d,option_a_image_url,option_b_image_url,option_c_image_url,option_d_image_url,correct_option,explanation,difficulty
// - Backend expects fields: subject_id, file (CSV), images_zip (optional)
// - Template buttons auto-target /templates/<SUBJECT_CODE>.csv and .zip
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

// ---------------------------------------------
// Utility: Read file to dataURL for preview
// ---------------------------------------------
const fileToDataUrl = (file) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

// ---------------------------------------------
// SubjectSelect: fetch subjects (id, name, code, status)
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
          code: s.code || (s.name ? (s.name.match(/[A-Za-z]/g) || []).join("").slice(0,3).toUpperCase() : ""),
          status: s.status !== false,
        }));
        setOptions(arr);
        onLoaded?.(arr);
      })
      .finally(() => setLoading(false));
    return () => (mounted = false);
  }, [onLoaded]);

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
// ImageUploadField: drag & drop + preview + upload to server
// POST /admin/uploads/image  -> { url }
// ---------------------------------------------
function ImageUploadField({ label = "Upload Image", value, onChange }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(value || "");
  const [uploading, setUploading] = useState(false);

  useEffect(() => { setPreview(value || ""); }, [value]);

  const onPick = () => inputRef.current?.click();

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
    } catch (e) {
      onChange?.(dataUrl);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = async (e) => { e.preventDefault(); const file = e.dataTransfer.files?.[0]; if (file) await handleFile(file); };
  const onFileInput = async (e) => { const file = e.target.files?.[0]; if (file) await handleFile(file); e.target.value = ""; };
  const clear = () => { setPreview(""); onChange?.(""); };

  return (
    <Box>
      <Typography variant="overline" color="text.secondary">{label}</Typography>
      <Paper
        variant="outlined"
        sx={{ mt: 0.5, p: 2, borderRadius: 3, display: "flex", alignItems: "center", gap: 2, cursor: "pointer", borderStyle: "dashed", bgcolor: preview ? "#fafafa" : "inherit" }}
        onClick={onPick}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        {preview ? (
          <img src={preview} alt="preview" style={{ width: 96, height: 96, objectFit: "contain", borderRadius: 8 }} />
        ) : (
          <ImageIcon />
        )}
        <Stack spacing={0.5} sx={{ flex: 1 }}>
          <Typography variant="body2" fontWeight={600}>{preview ? "Image selected" : label}</Typography>
          <Typography variant="caption" color="text.secondary">Drag & drop or click to choose. PNG/JPEG/WebP up to 5MB.</Typography>
        </Stack>
        {preview && (
          <Tooltip title="Remove image">
            <span><IconButton onClick={clear} disabled={uploading}><DeleteIcon /></IconButton></span>
          </Tooltip>
        )}
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={onFileInput} />
      </Paper>
      {uploading && <LinearProgress sx={{ mt: 1 }} />}
    </Box>
  );
}

// ---------------------------------------------
// SingleQuestionForm (unchanged for now)
// ---------------------------------------------
function SingleQuestionForm() {
  const [toast, setToast] = useState({ open: false, msg: "", severity: "info" });
  const [saving, setSaving] = useState(false);

  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");

  const [form, setForm] = useState({
    difficulty: "medium",
    question: "",
    stem_image_url: "",
    explanation: "",
    correct_option: "A",
    options: {
      A: { text: "", image_url: "" },
      B: { text: "", image_url: "" },
      C: { text: "", image_url: "" },
      D: { text: "", image_url: "" },
    },
  });

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const isOptionValid = (opt) => !!(opt.text?.trim() || opt.image_url?.trim());

  const isValid = useMemo(() => {
    if (!subjectId) return false;
    if (!form.question?.trim() && !form.stem_image_url?.trim()) return false;
    const { A, B, C, D } = form.options;
    if (![A, B, C, D].every(isOptionValid)) return false;
    if (!"ABCD".includes(form.correct_option)) return false;
    return true;
  }, [form, subjectId]);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!isValid) { setToast({ open: true, msg: "Please complete all required fields.", severity: "error" }); return; }

    const payload = {
      subject_id: subjectId,
      difficulty: form.difficulty,
      question: form.question,
      stem_image_url: form.stem_image_url || null,
      explanation: form.explanation || null,
      option_a: form.options.A.text || null,
      option_b: form.options.B.text || null,
      option_c: form.options.C.text || null,
      option_d: form.options.D.text || null,
      option_a_image_url: form.options.A.image_url || null,
      option_b_image_url: form.options.B.image_url || null,
      option_c_image_url: form.options.C.image_url || null,
      option_d_image_url: form.options.D.image_url || null,
      correct_option: form.correct_option,
    };

    try {
      setSaving(true);
      await api.post("/admin/questions", payload);
      setToast({ open: true, msg: "Question saved successfully!", severity: "success" });
      setForm((f) => ({ ...f, question: "", stem_image_url: "", explanation: "", options: { A: { text: "", image_url: "" }, B: { text: "", image_url: "" }, C: { text: "", image_url: "" }, D: { text: "", image_url: "" } }, }));
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to save question.";
      setToast({ open: true, msg, severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      <Stack component="form" spacing={2} onSubmit={handleSubmit}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <SubjectSelect value={subjectId} onChange={setSubjectId} label="Select Subject (required)" onLoaded={setSubjects} />
          <TextField select label="Difficulty" value={form.difficulty} onChange={(e) => set({ difficulty: e.target.value })} sx={{ minWidth: 200 }}>
            <MenuItem value="easy">Easy</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="hard">Hard</MenuItem>
          </TextField>
        </Stack>

        <TextField label="Question (text)" value={form.question} onChange={(e) => set({ question: e.target.value })} multiline minRows={3} fullWidth />
        <ImageUploadField label="Question Image (optional)" value={form.stem_image_url} onChange={(url) => set({ stem_image_url: url })} />

        <Divider />
        <Typography variant="subtitle2" color="text.secondary">Options (mark exactly one as correct)</Typography>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          {(["A","B","C","D"]).map((l) => (
            <Chip key={l} label={`Correct: ${l}`} color={form.correct_option===l?"primary":"default"} onClick={() => set({ correct_option: l })} variant={form.correct_option===l?"filled":"outlined"} />
          ))}
        </Stack>

        {(["A","B","C","D"]).map((l) => (
          <Paper key={l} variant="outlined" sx={{ p:2, borderRadius:2 }}>
            <Stack direction={{ xs:"column", md:"row" }} spacing={2} alignItems="flex-start">
              <TextField label={`Option ${l} (text)`} value={form.options[l].text} onChange={(e) => set({ options: { ...form.options, [l]: { ...form.options[l], text: e.target.value } } })} fullWidth />
              <ImageUploadField label={`Option ${l} Image`} value={form.options[l].image_url} onChange={(url) => set({ options: { ...form.options, [l]: { ...form.options[l], image_url: url } } })} />
            </Stack>
          </Paper>
        ))}

        <TextField label="Explanation (optional)" value={form.explanation} onChange={(e) => set({ explanation: e.target.value })} multiline minRows={2} fullWidth />

        <Stack direction="row" spacing={1.5}>
          <Button type="button" variant="outlined" onClick={() => window.history.back()}>Cancel</Button>
          <Button type="submit" variant="contained" startIcon={<CheckCircleIcon />} disabled={!isValid || saving}>
            {saving ? "Saving..." : "Save Question"}
          </Button>
        </Stack>
      </Stack>

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast((t) => ({ ...t, open: false }))} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity={toast.severity} variant="filled" onClose={() => setToast((t) => ({ ...t, open: false }))}>{toast.msg}</Alert>
      </Snackbar>
    </Paper>
  );
}

// ---------------------------------------------
// BulkUploadPanel (SINGLE SUBJECT MODE)
// - Requires subject_id
// - Accepts CSV (file) and optional ZIP (images_zip)
// - Shows template buttons for selected subject code
// ---------------------------------------------
function BulkUploadPanel() {
  const [subjectId, setSubjectId] = useState("");
  const [subjects, setSubjects] = useState([]); // [{id,name,code,status}]
  const [csvFile, setCsvFile] = useState(null);
  const [zipFile, setZipFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: "", severity: "info" });
  const [preview, setPreview] = useState([]);
  const [templateExists, setTemplateExists] = useState({ csv:false, zip:false });

  const selected = useMemo(() => subjects.find((s) => s.id === subjectId) || null, [subjects, subjectId]);

  // check if template files exist in /templates/<CODE>.csv and .zip
  useEffect(() => {
    let cancelled = false;
    async function check(url) {
      try {
        const r = await fetch(url, { method: "HEAD" });
        return r.ok;
      } catch {
        return false;
      }
    }
    (async () => {
      if (!selected?.code) { setTemplateExists({ csv:false, zip:false }); return; }
      const base = `/templates/${selected.code.toUpperCase()}`;
      const [csvOk, zipOk] = await Promise.all([check(`${base}.csv`), check(`${base}.zip`)]);
      if (!cancelled) setTemplateExists({ csv: csvOk, zip: zipOk });
    })();
    return () => { cancelled = true; };
  }, [selected]);

  const parseCsvPreview = async (file) => {
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).slice(0, 6); // header + first 5 rows
      setPreview(lines);
    } catch { setPreview([]); }
  };

  const onPickCsv = (e) => { const f = e.target.files?.[0]; setCsvFile(f || null); if (f && f.type.includes("csv")) parseCsvPreview(f); e.target.value = ""; };
  const onPickZip = (e) => { const f = e.target.files?.[0]; setZipFile(f || null); e.target.value = ""; };

  const onUpload = async () => {
    if (!subjectId) { setToast({ open: true, msg: "Please select a subject.", severity: "error" }); return; }
    if (!csvFile) { setToast({ open: true, msg: "Please choose a CSV file.", severity: "error" }); return; }
    try {
      setBusy(true);
      const fd = new FormData();
      fd.append("subject_id", subjectId);
      fd.append("file", csvFile);
      if (zipFile) fd.append("images_zip", zipFile);
      const { data } = await api.post("/admin/questions/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      const msg = data?.message || `Upload finished. Inserted: ${data?.inserted ?? "?"}, Skipped: ${data?.skipped ?? 0}`;
      setToast({ open: true, msg, severity: "success" });
      setCsvFile(null); setZipFile(null); setPreview([]);
    } catch (e) {
      const msg = e?.response?.data?.message || "Upload failed.";
      setToast({ open: true, msg, severity: "error" });
    } finally { setBusy(false); }
  };

  const downloadTemplate = (kind) => {
    if (!selected?.code) return;
    const url = `/templates/${selected.code.toUpperCase()}.${kind}`;
    const a = document.createElement("a");
    a.href = url; a.download = `${selected.code.toUpperCase()}.${kind}`; a.style.display = "none";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle1" fontWeight={700}>Bulk Upload (CSV + optional ZIP)</Typography>
        <Typography variant="body2" color="text.secondary">
          Select a subject, attach a CSV, and optionally attach a ZIP of images referenced by filename. CSV should not contain subject_code.
        </Typography>

        <SubjectSelect value={subjectId} onChange={setSubjectId} label="Select Subject (required — CSV has no subject_code)" onLoaded={setSubjects} />

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>Choose CSV
            <input hidden type="file" accept=".csv" onChange={onPickCsv} />
          </Button>
          <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>Optional Images ZIP
            <input hidden type="file" accept=".zip, application/x-zip-compressed" onChange={onPickZip} />
          </Button>
          <Button variant="contained" startIcon={<CloudUploadIcon />} disabled={busy} onClick={onUpload}>
            {busy ? "Uploading..." : "Upload Questions"}
          </Button>
        </Stack>

        {/* Template buttons next to upload controls */}
        {selected?.code && (
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Tooltip title={templateExists.csv ? `Download ${selected.name} CSV template` : "Template not available yet"}>
              <span>
                <Button variant="text" startIcon={<DownloadIcon />} disabled={!templateExists.csv} onClick={() => downloadTemplate("csv")}>
                  Download {selected.name} CSV Template
                </Button>
              </span>
            </Tooltip>
            <Tooltip title={templateExists.zip ? `Download ${selected.name} ZIP template` : "Template not available yet"}>
              <span>
                <Button variant="text" startIcon={<DownloadIcon />} disabled={!templateExists.zip} onClick={() => downloadTemplate("zip")}>
                  Download {selected.name} ZIP Template
                </Button>
              </span>
            </Tooltip>
          </Stack>
        )}

        {csvFile && (
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle2">Selected file:</Typography>
              <Chip label={csvFile.name} />
              {zipFile && <Chip label={`ZIP: ${zipFile.name}`} />}
            </Stack>
            {preview.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">Preview (first lines)</Typography>
                <Paper variant="outlined" sx={{ p: 1, mt: 0.5, bgcolor: "#fafafa", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
                  {preview.join("\n")}
                </Paper>
              </Box>
            )}
          </Paper>
        )}

        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" onClick={() => { setCsvFile(null); setZipFile(null); setPreview([]); }}>Cancel</Button>
          <Button variant="contained" startIcon={<CloudUploadIcon />} disabled={busy || !csvFile} onClick={onUpload}>
            {busy ? "Uploading..." : "Upload All"}
          </Button>
        </Stack>
      </Stack>

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast((t) => ({ ...t, open: false }))} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity={toast.severity} variant="filled" onClose={() => setToast((t) => ({ ...t, open: false }))}>{toast.msg}</Alert>
      </Snackbar>
    </Paper>
  );
}

// ---------------------------------------------
// Main Page: UploadQuestionsPage
// ---------------------------------------------
export default function UploadQuestionsPage() {
  const [tab, setTab] = useState(1); // default user likely uses Bulk first

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
        Upload Questions
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Single-subject uploads only. Attach a CSV (and optional ZIP of images). Images referenced by filename will be mapped automatically.
      </Typography>

      <Paper variant="outlined" sx={{ borderRadius: 3 }}>
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
          CSV header (single subject): <b>question, stem_image_url, option_a, option_b, option_c, option_d, option_a_image_url, option_b_image_url, option_c_image_url, option_d_image_url, correct_option, explanation, difficulty</b>.
        </Alert>
      </Box>
    </Box>
  );
}
