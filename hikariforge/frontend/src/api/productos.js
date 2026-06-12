import api from "./client";

// Catálogo paginado (Page de Spring).
export const listarProductos = (params = { page: 0, size: 10 }) =>
  api.get("/productos", { params });

export const obtenerProducto = (id) => api.get(`/productos/${id}`);
export const crearProducto = (producto) => api.post("/productos", producto);
export const actualizarProducto = (id, producto) => api.put(`/productos/${id}`, producto);
export const eliminarProducto = (id) => api.delete(`/productos/${id}`);
