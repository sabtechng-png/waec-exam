import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function GoogleSuccess() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const email = params.get("email");
    const name = params.get("name");

    if (!token) {
      navigate("/login");
      return;
    }

    login(
      { email, full_name: name, role: "student" },
      token
    );

    navigate("/dashboard");
  }, []);

  return <div>Logging you in…</div>;
}
