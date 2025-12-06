// =========================================
// Login.jsx — Redesigned, Logic Preserved
// =========================================
import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Snackbar,
  Alert,
  Link as MLink,
  InputAdornment,
  IconButton,
  Box,
  Divider,
  Typography,
  Paper,
} from "@mui/material";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";

import GoogleAuthButton from "../components/GoogleAuthButton";

import { useAuth } from "../context/AuthContext";
import api, { warmUpBackend } from "../utils/api";
import ResendVerifyModal from "../components/ResendVerifyModal";
import Toast from "../components/Toast";

export default function Login() {
  const navigate = useNavigate();
  const { login, token } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isUnverified, setIsUnverified] = useState(false);

  // Modal for resend verification
  const [modalOpen, setModalOpen] = useState(false);

  // Warm backend
  useEffect(() => {
    warmUpBackend();
  }, []);

  // Redirect logged-in users
  useEffect(() => {
    if (token) navigate("/dashboard");
  }, [token, navigate]);

  const validate = () => {
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email";
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      setIsUnverified(false);
      return;
    }

    setError("");
    setIsUnverified(false);
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", { email, password });

      // Extra safety (backend already checks this) :contentReference[oaicite:2]{index=2}
      if (!data?.user?.is_verified) {
        setIsUnverified(true);
        Toast.info("Your email is not verified. Please check your inbox.");
        navigate("/email-verification-notice", { state: { email } });
        return;
      }

      login(data.user, data.token);

      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;

      // Handle “Email not verified” coming from backend :contentReference[oaicite:3]{index=3}
      if (status === 403 && msg === "Email not verified") {
        setIsUnverified(true);
        setError("Your email is not verified. Please verify to continue.");
        return;
      }

      setIsUnverified(false);
      setError(
        msg ||
          "Login failed. Please check your email and password and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      {/* Modal: Resend email verification */}
      <ResendVerifyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultEmail={email}
      />

      <Box
        sx={{
          minHeight: "85vh",
          background: "#f4f6fb",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" },
          alignItems: "stretch",
        }}
      >
        {/* LEFT SIDE: LOGIN CARD */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            px: { xs: 2, md: 6 },
            py: { xs: 4, md: 0 },
          }}
        >
          <Paper
            elevation={0}
            sx={{
              width: "100%",
              maxWidth: 420,
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "white",
            }}
          >
            <Typography
              variant="h5"
              fontWeight={800}
              textAlign="center"
              mb={1.5}
              sx={{ letterSpacing: -0.5 }}
            >
              Login to Your Account
            </Typography>

            <Typography
              textAlign="center"
              sx={{ mb: 2.5, color: "text.secondary", fontSize: 14 }}
            >
              Continue your CBT practice, track your progress and view results.
            </Typography>

            <Snackbar
              open={!!error}
              autoHideDuration={4000}
              onClose={() => setError("")}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
              <Alert
                onClose={() => setError("")}
                severity={isUnverified ? "warning" : "error"}
                variant="filled"
                sx={{ width: "100%" }}
              >
                {error}
              </Alert>
            </Snackbar>

 {/*   <GoogleAuthButton />    <Divider sx={{ my: 3 }}>or</Divider> */}
          

           

            <form onSubmit={handleSubmit} noValidate>
              <TextField
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
                margin="normal"
              />

              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((s) => !s)}
                        edge="end"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  mt: 3,
                  py: 1.3,
                  fontSize: "16px",
                  textTransform: "none",
                  borderRadius: 2,
                }}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>

            <MLink
              component={Link}
              to="/forgot-password"
              underline="hover"
              sx={{
                mt: 2,
                fontSize: 14,
                display: "block",
                textAlign: "center",
              }}
            >
              Forgot password?
            </MLink>

            <MLink
              component={Link}
              to="/register"
              underline="hover"
              sx={{
                mt: 1,
                fontSize: 14,
                display: "block",
                textAlign: "center",
              }}
            >
              Don’t have an account? Register
            </MLink>
          </Paper>
        </Box>

        {/* RIGHT SIDE: INSTRUCTIONS / LOGIN DIFFICULTIES */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            justifyContent: "center",
            px: 6,
            py: 4,
            borderLeft: "1px solid #e0e0e0",
            background:
              "linear-gradient(135deg, rgba(13,110,253,0.08), rgba(13,110,253,0.02))",
          }}
        >
          <Typography variant="h4" fontWeight={900} mb={2}>
            Having Trouble Logging In?
          </Typography>

          <Typography sx={{ mb: 2, fontSize: 15, lineHeight: 1.8 }}>
            • Make sure you typed the <b>correct email address</b> and password.
            <br />
            • Your account email must be <b>verified</b> before you can log in.
          </Typography>

          <Typography sx={{ mb: 2, fontSize: 15, lineHeight: 1.8 }}>
            If your email is not verified:
            <br />– Check your <b>inbox</b> and <b>spam folder</b> for a
            verification email from CBT Master.
            <br />– If you can’t find it, click the button below to resend the
            verification link.
          </Typography>

          <Button
            variant="outlined"
            sx={{ mt: 1.5, maxWidth: 260 }}
            onClick={() => setModalOpen(true)}
          >
            Resend Verification Email
          </Button>

          <Typography sx={{ mt: 3, fontSize: 14, color: "text.secondary" }}>
            Still having issues? You can try resetting your password or contact
            support for more help.
          </Typography>
        </Box>
      </Box>

      <Footer />
    </>
  );
}
