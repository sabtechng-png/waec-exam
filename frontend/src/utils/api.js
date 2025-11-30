import axios from "axios";
import { logoutOn401 } from "./authHelpers";

export const API_BASE_URL = 
  process.env.NODE_ENV === "production"
    ? "https://waec-exam.onrender.com"
   : "http://localhost:4000";   // ✅ FIXED PORT!!!


const api = axios.create({
  baseURL: API_BASE_URL,
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

export default api;
