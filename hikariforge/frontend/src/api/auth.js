import api from "./client";

// Registro: devuelve { token, email, rol }.
export const register = (datos) => api.post("/auth/register", datos);

// Login: devuelve { token, email, rol }.
export const login = (credenciales) => api.post("/auth/login", credenciales);
