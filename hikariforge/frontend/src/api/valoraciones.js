import api from "./client";

/**
 * Llamadas a la API de valoraciones. El resumen es público; valorar y borrar
 * requieren sesión (el token se adjunta solo en el cliente axios).
 */

// Media, total y lista de reseñas de un producto.
export const obtenerValoraciones = (productoId) =>
  api.get(`/productos/${productoId}/valoraciones`);

// Crea o actualiza la valoración propia del producto.
export const enviarValoracion = (productoId, datos) =>
  api.post(`/productos/${productoId}/valoraciones`, datos);

// Borra una valoración propia.
export const borrarValoracion = (id) => api.delete(`/valoraciones/${id}`);

// Zona admin: todas las reseñas de la tienda para moderación.
export const todasValoraciones = () => api.get("/valoraciones");
