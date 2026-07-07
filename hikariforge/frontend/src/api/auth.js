import api from "./client";

export const register = (datos) => api.post("/auth/register", datos);
export const login = (credenciales) => api.post("/auth/login", credenciales);
// Login con Google: se envía el idToken que emite Google en el navegador.
export const loginGoogle = (idToken) => api.post("/auth/google", { idToken });

// Recuperación de contraseña (Fase 2): pedir el enlace y restablecer con el token.
export const recuperarPassword = (email) => api.post("/auth/recuperar", { email });
export const restablecerPassword = (token, nuevaPassword) =>
  api.post("/auth/restablecer", { token, nuevaPassword });
