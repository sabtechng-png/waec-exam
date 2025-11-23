import { Box, CircularProgress } from "@mui/material";

export default function FullScreenLoader() {
  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        display: "grid",
        placeItems: "center",
        bgcolor: "rgba(255,255,255,0.6)",
        zIndex: 2000,
      }}
    >
      <CircularProgress />
    </Box>
  );
}
