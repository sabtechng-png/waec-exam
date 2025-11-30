import { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cbt_cookie_consent");
    if (!consent) setShow(true);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cbt_cookie_consent", "accepted");
    setShow(false);
  };

  if (!show) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        bgcolor: "#1a1a1a",
        color: "white",
        py: 2,
        px: 3,
        zIndex: 2000,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <Typography sx={{ fontSize: 14, maxWidth: "70%" }}>
        We use cookies to improve your experience, analyze traffic, and show
        personalized ads. By using our site, you agree to our use of cookies.
      </Typography>

      <Button
        variant="contained"
        onClick={acceptCookies}
        sx={{ bgcolor: "#4caf50", mt: { xs: 1, md: 0 } }}
      >
        Accept
      </Button>
    </Box>
  );
}
