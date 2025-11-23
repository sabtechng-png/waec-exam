import { Card, CardContent, Stack, Typography } from "@mui/material";

export default function AuthCard({ title, subtitle, children }) {
  return (
    <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '100vh', bgcolor: '#f7f9fc', px: 2 }}>
      <Card variant="outlined" sx={{ width: '100%', maxWidth: 460, borderRadius: 4 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Brand (text-only, per your choice) */}
          <Typography variant="h5" fontWeight={800} gutterBottom>
            CBT <span style={{ color: '#1976d2' }}>Master</span>
          </Typography>

          <Typography variant="h6" fontWeight={800} gutterBottom>{title}</Typography>
          {subtitle ? (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {subtitle}
            </Typography>
          ) : null}

          <Stack spacing={2}>{children}</Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
