import { createContext, useContext, useEffect, useState } from "react";

const FavsContext = createContext(null);
const leer = () => { try { return JSON.parse(localStorage.getItem("favs")) ?? []; } catch { return []; } };

// Lista de deseos, persistida en el navegador.
export function FavsProvider({ children }) {
  const [favs, setFavs] = useState(leer);

  useEffect(() => localStorage.setItem("favs", JSON.stringify(favs)), [favs]);

  const esFav = (id) => favs.some((p) => p.id === id);
  const toggleFav = (producto) =>
    setFavs((xs) => (esFav(producto.id) ? xs.filter((p) => p.id !== producto.id) : [producto, ...xs]));

  return (
    <FavsContext.Provider value={{ favs, esFav, toggleFav }}>{children}</FavsContext.Provider>
  );
}

export function useFavs() {
  const ctx = useContext(FavsContext);
  if (!ctx) throw new Error("useFavs debe usarse dentro de <FavsProvider>");
  return ctx;
}
