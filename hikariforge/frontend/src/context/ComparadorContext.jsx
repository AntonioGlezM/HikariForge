import { createContext, useContext, useEffect, useState } from "react";

const ComparadorContext = createContext(null);
const leer = () => { try { return JSON.parse(localStorage.getItem("comparar")) ?? []; } catch { return []; } };
const MAX = 3;

// Comparador (Fase 5): hasta 3 productos seleccionados desde el catálogo,
// persistidos en el navegador. La página /comparar los muestra lado a lado.
export function ComparadorProvider({ children }) {
  const [ids, setIds] = useState(leer);

  useEffect(() => localStorage.setItem("comparar", JSON.stringify(ids)), [ids]);

  const enComparador = (id) => ids.includes(id);
  const toggleComparar = (id) =>
    setIds((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : xs.length >= MAX ? xs : [...xs, id]));
  const limpiar = () => setIds([]);

  return (
    <ComparadorContext.Provider value={{ ids, enComparador, toggleComparar, limpiar, MAX }}>
      {children}
    </ComparadorContext.Provider>
  );
}

export function useComparador() {
  const ctx = useContext(ComparadorContext);
  if (!ctx) throw new Error("useComparador debe usarse dentro de <ComparadorProvider>");
  return ctx;
}
