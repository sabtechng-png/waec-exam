// =====================================================================
// Register.jsx — Two-Column UI (Benefits Left, Form Right) + Confirm Password
// Logic preserved: full_name, email, password -> /auth/register
// =====================================================================
import { useState } from "react";
import {
  TextField,
  Button,
  Snackbar,
  Alert,
  InputAdornment,
  IconButton,
  Box,
  Link as MLink,
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
import api from "../utils/api";

export default function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ------------------ Validation ------------------
  const validate = () => {
    if (!fullName) return "Full name is required";
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Enter a valid email address";
    if (!password) return "Password is required";
    if (password.length < 6)
      return "Password must be at least 6 characters";
    if (password !== confirm) return "Passwords do not match";
    return "";
  };

  // ------------------ Submit Handler ------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/auth/register", {
        full_name: fullName, // ✅ matches DB column
        email,
        password,
      });

      // Optional: save email for later use (resend verification, etc.)
      localStorage.setItem("pending_email", email);

      // Go to success page (your existing route)
      navigate("/registration-success", { state: { email } });

      // Clear form
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirm("");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <Box
        sx={{
          minHeight: "88vh",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          background: "#f4f6fb",
          alignItems: "center",
          py: { xs: 3, md: 0 },
        }}
      >
        {/* LEFT — BENEFITS / INSTRUCTIONS */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            px: { xs: 3, md: 8 },
            py: 4,
            background:
              "linear-gradient(135deg, rgba(13,110,253,0.08), rgba(13,110,253,0.02))",
          }}
        >
          <Typography variant="h4" fontWeight={900} mb={2}>
            Why Join CBT-Master?
          </Typography>

          <Typography sx={{ mb: 2, fontSize: 15, lineHeight: 1.8 }}>
            ✔ Practice real WAEC / JAMB / NECO CBT exams{"\n"}
            ✔ Access hundreds of quality past questions{"\n"}
            ✔ Track your scores and improvements{"\n"}
            ✔ Get used to real exam timing and pressure{"\n"}
            ✔ Prepare anytime, anywhere
          </Typography>

          <Typography sx={{ mt: 3, fontSize: 15 }}>
            After registering, please check your <b>email</b> (and <b>spam</b>)
            for a verification link to activate your account.
          </Typography>
        </Box>

        {/* RIGHT — REGISTRATION FORM CARD */}
        <Box
          sx={{
            px: { xs: 3, md: 6 },
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              width: "100%",
              maxWidth: 460,
              p: 4,
              borderRadius: 4,
              border: "1px solid #e0e0e0",
              backgroundColor: "white",
            }}
          >
            <Typography
              variant="h4"
              fontWeight={800}
              textAlign="center"
              mb={2}
              sx={{ letterSpacing: -0.5 }}
            >
              Create Your Account
            </Typography>

            {/* ERROR TOAST */}
            <Snackbar
              open={!!error}
              autoHideDuration={4500}
              onClose={() => setError("")}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
              <Alert
                severity="error"
                variant="filled"
                sx={{ width: "100%" }}
                onClose={() => setError("")}
              >
                {error}
              </Alert>
            </Snackbar>

            {/* GOOGLE LOGIN */}
 {/*   <GoogleAuthButton />    <Divider sx={{ my: 3 }}>or</Divider> */}

            <form onSubmit={handleSubmit} noValidate>
              {/* FULL NAME */}
              <TextField
                label="Full Name"
                fullWidth
                margin="normal"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={!!error && !fullName}
                helperText={!!error && !fullName ? "Full name is required" : ""}
              />

              {/* EMAIL */}
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={
                  !!error &&
                  (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                }
                helperText={
                  !!error &&
                  (!email
                    ? "Email is required"
                    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                    ? "Enter a valid email address"
                    : "")
                }
              />

              {/* PASSWORD */}
              <TextField
                label="Password"
                type={showPass ? "text" : "password"}
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!error && (!password || password.length < 6)}
                helperText={
                  !!error &&
                  (!password
                    ? "Password is required"
                    : password.length < 6
                    ? "Minimum 6 characters"
                    : "")
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPass((prev) => !prev)}
                        edge="end"
                        aria-label="Toggle password visibility"
                      >
                        {showPass ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* CONFIRM PASSWORD */}
              <TextField
                label="Confirm Password"
                type={showConfirm ? "text" : "password"}
                fullWidth
                margin="normal"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                error={!!error && password !== confirm}
                helperText={
                  !!error && password !== confirm
                    ? "Passwords do not match"
                    : ""
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirm((prev) => !prev)}
                        edge="end"
                        aria-label="Toggle confirm password visibility"
                      >
                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* SUBMIT BUTTON */}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  mt: 3,
                  py: 1.3,
                  fontSize: 16,
                  borderRadius: 2,
                  textTransform: "none",
                }}
              >
                {loading ? "Creating Account..." : "Register"}
              </Button>
            </form>

            {/* FOOTER LINK */}
            <Box sx={{ textAlign: "center", mt: 2 }}>
              Already have an account?{" "}
              <MLink component={Link} to="/login" underline="hover">
                Login
              </MLink>
            </Box>
          </Paper>
        </Box>
      </Box>

      <Footer />
    </>
  );
}
