// frontend/src/pages/RegistrationSuccess.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";
import { FaEnvelopeOpenText, FaRedo } from "react-icons/fa";

export default function RegistrationSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location?.state?.email;

  const [cooldown, setCooldown] = useState(60);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!email) navigate("/register");

    let timer = setInterval(() => {
      setCooldown((v) => {
        if (v <= 1) {
          clearInterval(timer);
          return 0;
        }
        return v - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const maskEmail = (e) => {
    if (!e) return "";
    const [user, domain] = e.split("@");
    return `${user.slice(0, 2)}***@${domain}`;
  };

  const resendEmail = async () => {
    if (cooldown > 0) return;

    setSending(true);

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/resend-verify-link`,
        { email }
      );
      alert("Verification email resent!");
      setCooldown(60);
    } catch (err) {
      alert("Error sending verification email.");
    }

    setSending(false);
  };

  // ✨ Beautiful Modern Button Style
  const appButton = (disabled = false) => ({
    width: "100%",
    background: disabled ? "#6c757d" : "#0d6efd",
    color: "white",
    border: "none",
    padding: "13px 0",
    fontSize: "16px",
    fontWeight: 500,
    borderRadius: "8px",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "0.3s",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    marginBottom: "12px",
  });

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
          <FaEnvelopeOpenText size={60} color="#0d6efd" className="mb-3" />

          <h2>Almost There!</h2>

          <p className="mb-3">
            A verification link has been sent to:
            <br />
            <b>{maskEmail(email)}</b>
          </p>

          {/* Open Email App Button */}
          <button
            style={appButton(false)}
            onMouseEnter={(e) => (e.target.style.background = "#0b5ed7")}
            onMouseLeave={(e) => (e.target.style.background = "#0d6efd")}
            onClick={() => window.open("https://mail.google.com", "_blank")}
          >
            Open Email App
          </button>

          <p className="text-muted" style={{ fontSize: 14 }}>
            Didn’t receive the email?
          </p>

          {/* Resend Button */}
          <button
            disabled={sending || cooldown > 0}
            onClick={resendEmail}
            style={appButton(sending || cooldown > 0)}
            onMouseEnter={(e) => {
              if (cooldown === 0 && !sending)
                e.target.style.background = "#0b5ed7";
            }}
            onMouseLeave={(e) => {
              if (cooldown === 0 && !sending)
                e.target.style.background = "#0d6efd";
            }}
          >
            {sending
              ? "Sending..."
              : cooldown > 0
              ? `Resend in ${cooldown}s`
              : "Resend Verification Email"}
          </button>

          <p className="mt-3 text-muted" style={{ fontSize: 12 }}>
            Check your Spam/Junk folder if you don't see the email.
          </p>
        </div>
      </div>

      <Footer />
    </>
  );
}
