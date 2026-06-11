import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const leer = (k) => { try { return JSON.parse(localStorage.getItem(k)) ?? []; } catch { return []; } };

// Carrito y "vistos recientemente", persistidos en el navegador.
// También controla la apertura del panel lateral y su pestaña activa.
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => leer("cart"));
  const [recent, setRecent] = useState(() => leer("recent"));
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("cart");

  useEffect(() => localStorage.setItem("cart", JSON.stringify(items)), [items]);
  useEffect(() => localStorage.setItem("recent", JSON.stringify(recent)), [recent]);

  const add = (p) => { setItems((xs) => [...xs, p]); setTab("cart"); setOpen(true); };
  const removeAt = (i) => setItems((xs) => xs.filter((_, n) => n !== i));
  // Registra una visita a la ficha de un producto (sin duplicados, el último primero).
  const addRecent = (p) =>
    setRecent((xs) => [p, ...xs.filter((x) => x.id !== p.id)].slice(0, 10));

  const total = items.reduce((s, p) => s + Number(p.precio), 0);

  const value = {
    items, add, removeAt, total,
    recent, addRecent,
    open, openCart: () => { setTab("cart"); setOpen(true); }, closeCart: () => setOpen(false),
    tab, setTab,
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
