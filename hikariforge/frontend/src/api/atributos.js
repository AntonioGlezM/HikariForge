import client from "./client";

// Catálogo de atributos por categoría. El listado es público; el resto, admin.
export const listarAtributos = (categoriaId) =>
  client.get("/atributos", { params: { categoriaId } });

export const crearAtributo = (datos) => client.post("/atributos", datos);
export const actualizarAtributo = (id, datos) => client.put(`/atributos/${id}`, datos);
export const eliminarAtributo = (id) => client.delete(`/atributos/${id}`);
