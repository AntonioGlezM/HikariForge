import api from "./client";

export const listarCategorias = () => api.get("/categorias");
