// frontend/src/pages/VerifyEmail.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email...");
  const [redirectSeconds, setRedirectSeconds] = useState(5);
  const [resending, setResending] = useState(false);

  // ✨ Beautiful Modern Button Style
  const appButton = {
    width: "100%",
    background: "#0d6efd",
    color: "white",
    border: "none",
    padding: "13px 0",
    fontSize: "16px",
    fontWeight: 500,
    borderRadius: "8px",
    cursor: "pointer",
    transition: "0.3s",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    marginTop: "10px",
  };

  const disabledButton = {
    ...appButton,
    background: "#6c757d",
    cursor: "not-allowed",
  };

  // -----------------------------
  // VERIFY EMAIL
  // -----------------------------
  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    let cancelled = false;

    axios
      .get(`${process.env.REACT_APP_API_URL}/auth/verify-email?token=${token}`)
      .then((res) => {
        if (cancelled) return;
        const msg = res.data?.message;

        if (msg === "Email already verified") {
          setStatus("success");
          setMessage("Your email has already been verified!");
          return;
        }

        setStatus("success");
        setMessage("Your email has been verified successfully!");

        let timer = setInterval(() => {
          setRedirectSeconds((prev) => {
            if (prev === 1) {
              clearInterval(timer);
              navigate("/login");
            }
            return prev - 1;
          });
        }, 1000);
      })
      .catch((err) => {
        if (cancelled) return;
        const msg = err?.response?.data?.message;
        setStatus("error");
        setMessage(msg || "Verification link expired or invalid.");
      });

    return () => {
      cancelled = true;
    };
  }, [token, navigate]);

  // -----------------------------
  // RESEND EMAIL
  // -----------------------------
  const resendEmail = async () => {
    setResending(true);

    try {
      const email = localStorage.getItem("pending_email");
      await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/resend-verify-link`,
        { email }
      );
      alert("A new verification link has been sent.");
    } catch {
      alert("Unable to resend verification email.");
    }

    setResending(false);
  };

  const renderIcon = () => {
    if (status === "loading")
      return (
        <div className="spinner-border text-primary mb-3" role="status"></div>
      );

    if (status === "success")
      return <FaCheckCircle size={60} color="#28a745" className="mb-3" />;

    return <FaTimesCircle size={60} color="#dc3545" className="mb-3" />;
  };

  return (
    <>
      <Navbar />

      <div
        style={{
          minHeight: "70vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 480,
            padding: 30,
            background: "white",
            textAlign: "center",
            borderRadius: 12,
            boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
          }}
        >
          {renderIcon()}

          <h2>Email Verification</h2>
          <p className="mb-4">{message}</p>

          {/* SUCCESS VIEW */}
          {status === "success" && (
            <>
              <button
                style={appButton}
                onMouseEnter={(e) => (e.target.style.background = "#0b5ed7")}
                onMouseLeave={(e) => (e.target.style.background = "#0d6efd")}
                onClick={() => navigate("/login")}
              >
                Go to Login
              </button>


            </>
          )}

          {/* ERROR VIEW */}
          {status === "error" && (
            <>
              <button
                style={appButton}
                onMouseEnter={(e) => (e.target.style.background = "#0b5ed7")}
                onMouseLeave={(e) => (e.target.style.background = "#0d6efd")}
                onClick={() => navigate("/login")}
              >
                Back to Login
              </button>

              <button
                disabled={resending}
                onClick={resendEmail}
                style={resending ? disabledButton : appButton}
                onMouseEnter={(e) => {
                  if (!resending) e.target.style.background = "#0b5ed7";
                }}
                onMouseLeave={(e) => {
                  if (!resending) e.target.style.background = "#0d6efd";
                }}
              >
                {resending ? "Resending..." : "Resend Verification Email"}
              </button>
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
