import axios from "axios";

export const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://waec-exam.onrender.com"
    : "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  withCredentials: false,
});

// Attach token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("waec_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// DO NOT AUTO-LOGOUT ON 401 (this was the problem)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Just return the error, let AuthContext decide softly
    return Promise.reject(err);
  }
);

// warm-up
export async function warmUpBackend() {
  try {
    await api.get("/auth/ping");
  } catch {}
}

export default api;
