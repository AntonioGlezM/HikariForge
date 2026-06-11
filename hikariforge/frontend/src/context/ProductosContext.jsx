import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { listarProductos } from "../api/productos";

const ProductosContext = createContext(null);

// Carga el catálogo una vez para alimentar mega-menús, buscador y home.
// (Las páginas de catálogo paginan contra la API por su cuenta.)
export function ProductosProvider({ children }) {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    listarProductos({ page: 0, size: 50 })
      .then(({ data }) => setProductos(data.content))
      .catch(() => setError("error"))
      .finally(() => setCargando(false));
  }, []);

  // Categorías únicas, derivadas de los propios productos.
  const categorias = useMemo(
    () => [...new Set(productos.map((p) => p.categoriaNombre))],
    [productos]
  );

  return (
    <ProductosContext.Provider value={{ productos, categorias, cargando, error }}>
      {children}
    </ProductosContext.Provider>
  );
}

export function useProductos() {
  const ctx = useContext(ProductosContext);
  if (!ctx) throw new Error("useProductos debe usarse dentro de <ProductosProvider>");
  return ctx;
}
