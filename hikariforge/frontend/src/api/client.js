import axios from "axios";

// Instancia central de axios. La URL base viene del .env (VITE_API_URL).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
});

// Adjunta el token JWT (si existe) en cada petición.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si la API responde 401 (token caducado o ausente), limpia la sesión y manda
// al login dejando un aviso para que la página de login explique el porqué.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // El login lee esta marca una sola vez y muestra el aviso.
      sessionStorage.setItem("sesionCaducada", "1");
      if (window.location.pathname !== "/login") window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
