import api from "./client";

// Catálogo paginado: GET /productos?page=&size=&sort=. Devuelve una Page de Spring.
export const listarProductos = (params = { page: 0, size: 10 }) =>
  api.get("/productos", { params });

// Un producto por su UUID.
export const obtenerProducto = (id) => api.get(`/productos/${id}`);

// Crear producto (requiere rol ADMIN).
export const crearProducto = (producto) => api.post("/productos", producto);

// Borrar producto (requiere rol ADMIN).
export const eliminarProducto = (id) => api.delete(`/productos/${id}`);
