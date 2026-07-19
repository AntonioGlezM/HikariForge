import api from "./client";

// Catálogo paginado con filtros opcionales (Page de Spring).
// params admite: page, size, texto, categoriaId, marca, precioMax, enStock.
export const listarProductos = (params = { page: 0, size: 10 }) =>
  api.get("/productos", { params });

// Marcas disponibles para el filtro del catálogo.
export const listarMarcas = () => api.get("/productos/marcas");
export const listarColores = () => api.get("/productos/colores");

export const obtenerProducto = (id) => api.get(`/productos/${id}`);
export const crearProducto = (producto) => api.post("/productos", producto);
export const actualizarProducto = (id, producto) => api.put(`/productos/${id}`, producto);
// "Eliminar" es borrado lógico: retira el producto de la venta.
export const eliminarProducto = (id) => api.delete(`/productos/${id}`);
// Zona admin: catálogo completo (incluidos retirados) y reactivación.
export const listarProductosAdmin = (params = { page: 0, size: 100 }) => api.get("/productos/todos", { params });
export const reactivarProducto = (id) => api.put(`/productos/${id}/activar`);

// Galería de imágenes (Fase 4): URLs adicionales del producto.
export const obtenerGaleria = (id) => api.get(`/productos/${id}/galeria`);
export const guardarGaleria = (id, urls) => api.put(`/productos/${id}/galeria`, urls);

// Aviso "disponible de nuevo" (Fase 5): apuntarse a la vuelta de stock.
export const avisarStock = (id, email) => api.post(`/productos/${id}/avisar-stock`, { email });
