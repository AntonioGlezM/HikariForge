import api from "./client";

// Cupones (Fase 5): validación en el checkout y gestión admin.
export const validarCupon = (codigo) => api.get(`/cupones/validar/${encodeURIComponent(codigo)}`);
export const listarCupones = () => api.get("/cupones");
export const crearCupon = (datos) => api.post("/cupones", datos);
export const alternarCupon = (id) => api.put(`/cupones/${id}/activo`);
export const eliminarCupon = (id) => api.delete(`/cupones/${id}`);
