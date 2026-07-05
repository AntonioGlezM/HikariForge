import api from "./client";

// Crea un pedido: líneas del carrito + dirección de envío del checkout.
// envio = { destinatario, direccion, ciudad, provincia, codigoPostal, telefono, notas }
export const crearPedido = (lineas, envio) => api.post("/pedidos", { lineas, ...envio });
export const misPedidos = () => api.get("/pedidos/mios");

// El cliente cancela su propio pedido (solo si sigue pendiente).
export const cancelarPedido = (id) => api.put(`/pedidos/${id}/cancelar`);

// Zona admin: todos los pedidos y cambio de estado del seguimiento.
export const todosPedidos = () => api.get("/pedidos");
export const cambiarEstadoPedido = (id, estado) => api.put(`/pedidos/${id}/estado`, { estado });
