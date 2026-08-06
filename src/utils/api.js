import axios from "axios";

// 1. Setup dasar URL backend lu
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

// 2. REQUEST INTERCEPTOR (Otomatis masukin token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("kasir_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 3. RESPONSE INTERCEPTOR (Tangkep error token expired)
api.interceptors.response.use(
  (response) => {
    // Kalau response sukses, biarin lewat
    return response;
  },
  (error) => {
    // Kalau backend ngasih error 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      console.warn("Token expired atau tidak valid. Logout otomatis...");

      // Bersihin localStorage
      localStorage.removeItem("kasir_token");
      localStorage.removeItem("user_role");
      localStorage.removeItem("user");
      localStorage.removeItem("user_name");

      // Tendang balik ke halaman login secara paksa
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
