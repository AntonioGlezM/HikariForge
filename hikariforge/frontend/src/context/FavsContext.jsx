import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "./ToastContext";
import { useSettings } from "./SettingsContext";

const FavsContext = createContext(null);
const leer = () => { try { return JSON.parse(localStorage.getItem("favs")) ?? []; } catch { return []; } };

// Lista de deseos, persistida en el navegador.
export function FavsProvider({ children }) {
  const [favs, setFavs] = useState(leer);
  const { toast } = useToast();
  const { tr } = useSettings();

  useEffect(() => localStorage.setItem("favs", JSON.stringify(favs)), [favs]);

  const esFav = (id) => favs.some((p) => p.id === id);
  const toggleFav = (producto) =>
    setFavs((xs) => {
      const ya = esFav(producto.id);
      toast(ya ? tr.favRemoved : tr.favAdded, ya ? "heart" : "heart-filled");
      return ya ? xs.filter((p) => p.id !== producto.id) : [producto, ...xs];
    });

  return (
    <FavsContext.Provider value={{ favs, esFav, toggleFav }}>{children}</FavsContext.Provider>
  );
}

export function useFavs() {
  const ctx = useContext(FavsContext);
  if (!ctx) throw new Error("useFavs debe usarse dentro de <FavsProvider>");
  return ctx;
}
