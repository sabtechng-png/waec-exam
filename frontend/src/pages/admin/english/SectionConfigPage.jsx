import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import {
  Container,
  Paper,
  Typography,
  Grid,
  Switch,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";

export default function SectionConfigPage() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");

  // ---------------------------------------------
  // Load section config
  // ---------------------------------------------
  const loadConfig = async () => {
    try {
      const res = await api.get("/admin/english/section-config");
      setConfigs(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load configuration.");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadConfig();
  }, []);

  // ---------------------------------------------
  // Update a single config entry
  // ---------------------------------------------
  const handleSave = async (config) => {
    setSavingId(config.id);
    setError("");

    try {
      await api.put(`/admin/english/section-config/${config.id}`, {
        number_of_questions: config.number_of_questions,
        enabled: config.enabled,
      });

      await loadConfig();
    } catch (err) {
      console.error(err);
      setError("Failed to save configuration.");
    }

    setSavingId(null);
  };

  // ---------------------------------------------
  // Render loading screen
  // ---------------------------------------------
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading section configuration...</Typography>
        </Paper>
      </Container>
    );
  }

  // ---------------------------------------------
  // Main UI
  // ---------------------------------------------
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
          English Section Configuration
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {configs.map((c) => (
            <Grid item xs={12} md={6} key={c.id}>
              <Paper sx={{ p: 3, borderLeft: "6px solid #1976d2" }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  {(c.section_name || "").replace(/_/g, " ").toUpperCase()}
                </Typography>

                <TextField
                  label="Number of Questions"
                  type="number"
                  fullWidth
                  sx={{ mb: 2 }}
                  value={c.number_of_questions}
                  onChange={(e) =>
                    setConfigs((prev) =>
                      prev.map((item) =>
                        item.id === c.id
                          ? { ...item, number_of_questions: Number(e.target.value) }
                          : item
                      )
                    )
                  }
                />

                <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
                  <Typography>Enabled</Typography>
                  <Switch
                    checked={c.enabled}
                    onChange={(e) =>
                      setConfigs((prev) =>
                        prev.map((item) =>
                          item.id === c.id
                            ? { ...item, enabled: e.target.checked }
                            : item
                        )
                      )
                    }
                  />
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  disabled={savingId === c.id}
                  onClick={() => handleSave(c)}
                >
                  {savingId === c.id ? (
                    <CircularProgress size={22} sx={{ color: "#fff" }} />
                  ) : (
                    "Save"
                  )}
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  );
}
