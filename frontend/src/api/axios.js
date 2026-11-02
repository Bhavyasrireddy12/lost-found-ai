
import axios from "axios";

// Deployed backend address
export const SERVER_URL = "https://lost-found-ai-8wgl.onrender.com";

// All API routes start with /api
const api = axios.create({
  baseURL: `${SERVER_URL}/api`,
});

// Build image address from saved file name
export const imageUrl = (fileName) =>
  fileName ? `${SERVER_URL}/uploads/${fileName}` : "";

// Add token before every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle unauthorized responses
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
