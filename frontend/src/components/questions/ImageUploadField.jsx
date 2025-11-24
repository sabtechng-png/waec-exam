import { useEffect, useRef, useState } from "react";
import { Box, Paper, Typography, Stack, IconButton, LinearProgress } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import api from "../../utils/api";
import { fileToDataUrl } from "./fileToDataUrl";

export default function ImageUploadField({ label, value, onChange }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(value || "");
  const [uploading, setUploading] = useState(false);

  useEffect(() => setPreview(value || ""), [value]);

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

      onChange(data?.url || dataUrl);
    } catch {
      onChange(dataUrl);
    } finally {
      setUploading(false);
    }
  };

  const clear = (e) => {
    e.stopPropagation();
    setPreview("");
    onChange("");
  };

  return (
    <Box>
      <Typography variant="overline">{label}</Typography>

      <Paper
        variant="outlined"
        sx={{
          mt: 1,
          p: 2,
          borderRadius: 3,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderStyle: "dashed",
        }}
        onClick={pick}
      >
        {preview ? (
          <img src={preview} alt="preview" style={{ width: 80, height: 80, objectFit: "contain" }} />
        ) : (
          <ImageIcon />
        )}

        <Stack sx={{ flex: 1 }}>
          <Typography>{preview ? "Image selected" : "Click to upload"}</Typography>
          <Typography variant="caption">PNG / JPG / WEBP</Typography>
        </Stack>

        {preview && (
          <IconButton size="small" onClick={clear}>
            <DeleteIcon />
          </IconButton>
        )}

        <input hidden ref={inputRef} type="file" accept="image/*" onChange={(e) => handleFile(e.target.files[0])} />
      </Paper>

      {uploading && <LinearProgress sx={{ mt: 1 }} />}
    </Box>
  );
}
