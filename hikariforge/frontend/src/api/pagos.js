import api from "./client";

// Pago con Stripe (Fase 3): sesión de pago de un pedido y confirmación al volver.
export const crearSesionPago = (pedidoId) => api.post(`/pagos/sesion/${pedidoId}`);
export const confirmarPago = (sessionId) => api.post("/pagos/confirmar", { sessionId });
