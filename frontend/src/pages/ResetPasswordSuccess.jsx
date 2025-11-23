// ======================= ResetPasswordSuccess.jsx (FINAL) =======================
import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";
import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function ResetPasswordSuccess() {
  const navigate = useNavigate();

  const buttonStyle = {
    width: "100%",
    background: "#0d6efd",
    color: "white",
    border: "none",
    padding: "12px 0",
    fontSize: "16px",
    fontWeight: 500,
    borderRadius: "8px",
    cursor: "pointer",
    transition: "0.3s",
    marginTop: "15px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
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
          background: "#f4f6fb",
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
          <FaCheckCircle size={60} color="#28a745" className="mb-3" />

          <h2>Password Reset Successful</h2>

          <p className="mt-3">
            Your password has been updated successfully. You can now log in with
            your new password.
          </p>

          <button
            style={buttonStyle}
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
}
