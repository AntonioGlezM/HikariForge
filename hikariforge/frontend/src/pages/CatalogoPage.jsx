import { useEffect, useState } from "react";
import { listarProductos } from "../api/productos";

// Placeholder del catálogo: solo lista los nombres para comprobar que el cliente
// API funciona contra el backend. Las tarjetas y el diseño vendrán en el paso del catálogo.
export default function CatalogoPage() {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    listarProductos({ page: 0, size: 10 })
      .then(({ data }) => setProductos(data.content)) // data es una Page de Spring
      .catch(() => setError("No se pudo cargar el catálogo"));
  }, []);

  if (error) return <p style={{ color: "crimson" }}>{error}</p>;

  return (
    <div>
      <h2>Catálogo (placeholder)</h2>
      <ul>
        {productos.map((p) => (
          <li key={p.id}>
            {p.nombre} — {p.precio} € ({p.categoriaNombre})
          </li>
        ))}
      </ul>
    </div>
  );
}
