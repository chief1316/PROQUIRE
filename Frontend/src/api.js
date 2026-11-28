import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://proquire.onrender.com/api",
});

// Automatically attach the logged-in user's token to every API request.
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
