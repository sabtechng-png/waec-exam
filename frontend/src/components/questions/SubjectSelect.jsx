import { useEffect, useState } from "react";
import { TextField, MenuItem } from "@mui/material";
import api from "../../utils/api";

export default function SubjectSelect({ value, onChange }) {
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
