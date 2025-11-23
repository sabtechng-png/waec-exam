import axios from "axios";
import { logoutOn401 } from "./authHelpers";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "https://cbt-master.com.ng";

const api = axios.create({
  baseURL: API_BASE_URL,     // 👈 NO localhost fallback
  withCredentials: false,
});

// ✅ Auto attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("waec_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ✅ Auto logout on token failure
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) logoutOn401();
    return Promise.reject(err);
  }
);

export default api;
