import api from "./client";

// Perfil del usuario autenticado.
export const miPerfil = () => api.get("/usuarios/me");
// Devuelve un token nuevo (el email forma parte del JWT).
export const actualizarPerfil = (datos) => api.put("/usuarios/me", datos);
export const cambiarPassword = (datos) => api.put("/usuarios/me/password", datos);
