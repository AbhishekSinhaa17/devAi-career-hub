import axios from "axios";
import { env } from "../env";

// Create Axios instance pointing to the Express backend proxy
export const apiClient = axios.create({
  baseURL: env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT from localStorage
apiClient.interceptors.request.use(
  (config) => {
    // Check if we are running in the browser
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("devai_jwt");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401s (token expiry)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("devai_jwt");
        localStorage.removeItem("devai_user");
        window.dispatchEvent(new Event("devai_auth_change"));
      }
    }
    return Promise.reject(error);
  }
);

export const serverApiClient = axios.create({
  baseURL: env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  }
});