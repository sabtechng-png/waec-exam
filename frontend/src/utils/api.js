import axios from "axios";
import { logoutOn401 } from "./authHelpers";

export const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://waec-exam.onrender.com"
    : "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 7000, // prevents slow freeze
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("waec_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) logoutOn401();
    return Promise.reject(err);
  }
);

// 🔵 backend warm-up (Render waking)
export async function warmUpBackend() {
  try {
    await api.get("/auth/ping");
  } catch {}
}

export default api;
