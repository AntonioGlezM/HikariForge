import api from "./client";

// Crea un pedido a partir de las líneas del carrito: [{ productoId, cantidad }].
export const crearPedido = (lineas) => api.post("/pedidos", { lineas });
export const misPedidos = () => api.get("/pedidos/mios");

// Zona admin: todos los pedidos y cambio de estado del seguimiento.
export const todosPedidos = () => api.get("/pedidos");
export const cambiarEstadoPedido = (id, estado) => api.put(`/pedidos/${id}/estado`, { estado });
