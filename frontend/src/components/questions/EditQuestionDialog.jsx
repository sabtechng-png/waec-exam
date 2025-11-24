import { useEffect, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stack, TextField, Typography, MenuItem, Chip
} from "@mui/material";


import api from "../../utils/api";
import ImageUploadField from "./ImageUploadField";

export default function EditQuestionDialog({ open, onClose, question, onSaved }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (question) {
      setForm({
        id: question.id,
        question: question.question,
        option_a: question.option_a,
        option_b: question.option_b,
        option_c: question.option_c,
        option_d: question.option_d,
        correct_option: question.correct_option,
        explanation: question.explanation,
        difficulty: question.difficulty,
        stem_image_url: question.stem_image_url,
      });
    } else setForm(null);
  }, [question]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);

    try {
      const payload = { ...form };
      const { data } = await api.put(`/admin/questions/${form.id}`, payload);
      onSaved(data.question);
    } finally {
      setSaving(false);
    }
  };

  if (!form) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Edit Question</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField
            label="Question"
            value={form.question}
            onChange={(e) => update("question", e.target.value)}
            multiline
            minRows={3}
          />

          <ImageUploadField
            label="Question Image"
            value={form.stem_image_url}
            onChange={(v) => update("stem_image_url", v)}
          />

          <Typography variant="subtitle2">Options</Typography>

          {["a", "b", "c", "d"].map((l) => (
            <TextField
              key={l}
              label={`Option ${l.toUpperCase()}`}
              value={form[`option_${l}`]}
              onChange={(e) => update(`option_${l}`, e.target.value)}
            />
          ))}

          <Typography variant="subtitle2">Correct Option</Typography>

          <Stack direction="row" spacing={1}>
            {["A", "B", "C", "D"].map((l) => (
              <Chip
                key={l}
                label={l}
                color={form.correct_option === l ? "primary" : "default"}
                onClick={() => update("correct_option", l)}
              />
            ))}
          </Stack>

          <TextField
            label="Explanation"
            value={form.explanation}
            onChange={(e) => update("explanation", e.target.value)}
            multiline
            minRows={2}
          />

          <TextField
            label="Difficulty"
            select
            value={form.difficulty}
            onChange={(e) => update("difficulty", e.target.value)}
          >
            <MenuItem value="easy">Easy</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="hard">Hard</MenuItem>
          </TextField>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button disabled={saving} onClick={handleSave} variant="contained">
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
