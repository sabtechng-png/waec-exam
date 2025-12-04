import React from "react";
import { Box, Button, Container, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function EnglishManagerPage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }} elevation={3}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
          English Question Manager
        </Typography>

        <Box display="flex" flexDirection="column" gap={2}>
          <Button
            variant="contained"
            onClick={() => navigate("/admin/english/passages")}
          >
            📘 Manage Passages
          </Button>

          <Button
            variant="contained"
            onClick={() => navigate("/admin/english/objectives")}
          >
            ✏️ Manage Lexis / Structure / Oral MCQs
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate("/admin/english/config")}
          >
            ⚙️ Section Config (Question Count)
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
