import api from "./client";

export const register = (datos) => api.post("/auth/register", datos);
export const login = (credenciales) => api.post("/auth/login", credenciales);
// Login con Google: se envía el idToken que emite Google en el navegador.
export const loginGoogle = (idToken) => api.post("/auth/google", { idToken });
