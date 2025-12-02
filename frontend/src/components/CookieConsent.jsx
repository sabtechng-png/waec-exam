import { useState, useEffect } from "react";
import { Box, Button, Typography, Link } from "@mui/material";
import CookieIcon from "@mui/icons-material/Cookie";

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
        bottom: { xs: 10, md: 22 },
        left: 0,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        zIndex: 3000,
      }}
    >
      <Box
        sx={{
          width: { xs: "92%", sm: "85%", md: "620px" },
          bgcolor: "rgba(18, 18, 18, 0.90)", // premium dark background
          backdropFilter: "blur(10px)",
          borderRadius: "16px",
          px: 3,
          py: 2.8,
          boxShadow: "0 6px 26px rgba(0, 0, 0, 0.45)",
          color: "#f5f7fa",
          display: "flex",
          alignItems: "flex-start",
          gap: 2,
        }}
      >
        <CookieIcon sx={{ fontSize: 34, color: "#FFC107" }} />

        <Box sx={{ flexGrow: 1 }}>
          <Typography
            sx={{ fontWeight: 700, mb: 0.8, fontSize: 17, letterSpacing: 0.2 }}
          >
            Your Privacy Matters
          </Typography>

          <Typography sx={{ fontSize: 14.5, opacity: 0.85, mb: 1.5, lineHeight: 1.5 }}>
            To enhance your learning experience, analyze performance, and
            support our free services through ads, we use cookies. By continuing,
            you agree to our cookie policy.
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
            <Button
              variant="contained"
              onClick={acceptCookies}
              sx={{
                backgroundColor: "#0A66C2",
                textTransform: "none",
                px: 3.5,
                py: 1,
                borderRadius: "10px",
                fontWeight: 600,
                fontSize: 14,
                "&:hover": { backgroundColor: "#084C99" },
                boxShadow: "0px 3px 10px rgba(10,102,194,0.3)",
              }}
            >
              Accept Cookies
            </Button>

            <Link
              href="/privacy-policy"
              underline="hover"
              sx={{
                color: "#1E88E5",
                fontSize: 14,
                alignSelf: "center",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Learn More
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
