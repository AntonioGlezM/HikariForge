import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

// Lee el carrito guardado. Migra el formato antiguo (lista de productos sueltos)
// al nuevo (líneas {producto, cantidad}).
const leerCarrito = () => {
  try {
    const datos = JSON.parse(localStorage.getItem("cart")) ?? [];
    if (datos.length && !datos[0].producto) {
      const porId = {};
      datos.forEach((p) => {
        porId[p.id] = porId[p.id] ?? { producto: p, cantidad: 0 };
        porId[p.id].cantidad++;
      });
      return Object.values(porId);
    }
    return datos;
  } catch { return []; }
};
const leerRecent = () => { try { return JSON.parse(localStorage.getItem("recent")) ?? []; } catch { return []; } };

// Carrito con líneas {producto, cantidad} y "vistos recientemente", persistidos.
export function CartProvider({ children }) {
  const [items, setItems] = useState(leerCarrito);
  const [recent, setRecent] = useState(leerRecent);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("cart");

  useEffect(() => localStorage.setItem("cart", JSON.stringify(items)), [items]);
  useEffect(() => localStorage.setItem("recent", JSON.stringify(recent)), [recent]);

  // Añadir suma cantidad si el producto ya está en el carrito.
  const add = (p) => {
    setItems((xs) => {
      const existe = xs.find((l) => l.producto.id === p.id);
      return existe
        ? xs.map((l) => (l.producto.id === p.id ? { ...l, cantidad: l.cantidad + 1 } : l))
        : [...xs, { producto: p, cantidad: 1 }];
    });
    setTab("cart");
    setOpen(true);
  };

  // Cambia la cantidad de una línea (+1/-1); si llega a 0, la quita.
  const cambiarCantidad = (id, delta) =>
    setItems((xs) => xs
      .map((l) => (l.producto.id === id ? { ...l, cantidad: l.cantidad + delta } : l))
      .filter((l) => l.cantidad > 0));

  const quitar = (id) => setItems((xs) => xs.filter((l) => l.producto.id !== id));
  const clear = () => setItems([]);

  const addRecent = (p) =>
    setRecent((xs) => [p, ...xs.filter((x) => x.id !== p.id)].slice(0, 10));

  const unidades = items.reduce((s, l) => s + l.cantidad, 0);
  const total = items.reduce((s, l) => s + Number(l.producto.precio) * l.cantidad, 0);

  const value = {
    items, add, cambiarCantidad, quitar, clear, total, unidades,
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
