// ======================= ResetPassword.jsx (PREMIUM UI/UX) =======================
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(true);
  const [error, setError] = useState("");

  // ------------------------------------------------
  // Validate token on page load
  // ------------------------------------------------
  useEffect(() => {
    if (!token) {
      setValidated(false);
      setError("Invalid password reset link.");
      return;
    }

    api
      .post("/auth/password/validate-token", { token })
      .then(() => setValidated(true))
      .catch((err) => {
        const msg =
          err?.response?.data?.message ||
          "This reset link is invalid or has expired.";
        setValidated(false);
        setError(msg);
      });
  }, [token]);

  // ------------------------------------------------
  // Handle password reset
  // ------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      return setError("Password must be at least 6 characters long.");
    }

    if (password !== confirm) {
      return setError("Passwords do not match.");
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/auth/password/reset", {
        token,
        password,
      });
      navigate("/reset-success");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Unable to reset your password. Link may have expired.";
      setError(msg);
    }

    setLoading(false);
  };

  // ------------------------------------------------
  // Styles
  // ------------------------------------------------
  const cardStyle = {
    width: "100%",
    maxWidth: 450,
    padding: "35px 32px",
    background: "white",
    borderRadius: "14px",
    boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid #ced4da",
    outline: "none",
    fontSize: "15px",
    marginBottom: "18px",
    transition: "0.25s",
  };

  const buttonPrimary = {
    width: "100%",
    background: "#0d6efd",
    color: "white",
    padding: "13px 0",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    transition: "0.3s",
    marginTop: "4px",
  };

  return (
    <>
      <Navbar />

      <div
        style={{
          minHeight: "78vh",
          background: "#f4f6fb",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <div style={cardStyle}>
          <h2
            style={{
              textAlign: "center",
              marginBottom: "8px",
              fontWeight: 700,
            }}
          >
            Reset Password
          </h2>

          <p style={{ textAlign: "center", color: "#6c757d", marginBottom: 20 }}>
            Enter your new password below.
          </p>

          {/* ERROR MESSAGE */}
          {error && (
            <div
              style={{
                background: "#f8d7da",
                color: "#842029",
                padding: "12px 14px",
                borderRadius: "8px",
                marginBottom: "15px",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              {error}

              {/* Show request new link button only when invalid */}
              {!validated && (
                <button
                  style={{
                    ...buttonPrimary,
                    background: "#0d6efd",
                    marginTop: "15px",
                  }}
                  onClick={() => navigate("/forgot-password")}
                >
                  Request New Reset Link
                </button>
              )}
            </div>
          )}

          {validated && (
            <form onSubmit={handleSubmit}>
              <label style={{ fontWeight: 500 }}>New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                style={inputStyle}
                onFocus={(e) => (e.target.style.border = "1px solid #0d6efd")}
                onBlur={(e) => (e.target.style.border = "1px solid #ced4da")}
              />

              <label style={{ fontWeight: 500 }}>Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm new password"
                style={inputStyle}
                onFocus={(e) => (e.target.style.border = "1px solid #0d6efd")}
                onBlur={(e) => (e.target.style.border = "1px solid #ced4da")}
              />

              <button
                type="submit"
                disabled={loading}
                style={buttonPrimary}
                onMouseEnter={(e) =>
                  (e.target.style.background = "#0b5ed7")
                }
                onMouseLeave={(e) =>
                  (e.target.style.background = "#0d6efd")
                }
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
