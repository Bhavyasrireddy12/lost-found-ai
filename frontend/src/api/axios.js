import axios from "axios";

// Backend address (same one your current code already uses)
export const SERVER_URL = "http://localhost:5000";

// All API routes start with /api
const api = axios.create({
  baseURL: `${SERVER_URL}/api`,
});

// Helper to build an image address from a saved file name
export const imageUrl = (fileName) =>
  fileName ? `${SERVER_URL}/uploads/${fileName}` : "";

// Before every request: add the token if we have one
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// After every response: if the backend says 401 (missing, invalid
// or expired token), remove the token and tell the app to log out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("auth:logout"));
    }

    return Promise.reject(error);
  }
);

export default api;