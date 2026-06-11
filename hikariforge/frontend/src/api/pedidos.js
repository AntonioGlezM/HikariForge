import api from "./client";

// Crea un pedido a partir de las líneas del carrito: [{ productoId, cantidad }].
export const crearPedido = (lineas) => api.post("/pedidos", { lineas });
export const misPedidos = () => api.get("/pedidos/mios");
