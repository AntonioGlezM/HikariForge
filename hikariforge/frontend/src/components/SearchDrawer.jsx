import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { useProductos } from "../context/ProductosContext";

// Panel lateral de búsqueda: sin texto muestra sugerencias agrupadas por categoría;
// al escribir, filtra en vivo.
export default function SearchDrawer({ open, onClose }) {
  const { tr } = useSettings();
  const { productos } = useProductos();
  const [q, setQ] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) { setQ(""); inputRef.current?.focus(); }
  }, [open]);

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);

  const filtrados = useMemo(() => {
    const texto = q.toLowerCase().trim();
    if (!texto) return null; // null = mostrar sugerencias agrupadas
    return productos.filter((p) =>
      p.nombre.toLowerCase().includes(texto) || p.categoriaNombre.toLowerCase().includes(texto));
  }, [q, productos]);

  const grupos = useMemo(() => {
    const g = {};
    productos.forEach((p) => (g[p.categoriaNombre] ??= []).push(p));
    return g;
  }, [productos]);

  const fila = (p) => (
    <Link key={p.id} to={`/producto/${p.id}`} className="hf-result" onClick={onClose}>
      <span>{p.nombre}</span><span className="c">{p.precio} €</span>
    </Link>
  );

  return (
    <>
      <div className={`hf-backdrop ${open ? "open" : ""}`} onClick={onClose} />
      <aside className={`hf-search-drawer ${open ? "open" : ""}`}>
        <h3>{tr.searchTitle}
          <button className="hf-close-round" onClick={onClose} aria-label="Cerrar"><i className="ti ti-x" /></button>
        </h3>
        <input ref={inputRef} className="hf-search-input" placeholder={tr.searchPh}
               value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="hf-search-results">
          {filtrados === null ? (
            Object.entries(grupos).map(([cat, lista]) => (
              <div key={cat} className="hf-search-group">
                <span className="glbl">{cat}</span>
                {lista.map(fila)}
              </div>
            ))
          ) : filtrados.length ? (
            filtrados.map(fila)
          ) : (
            <p className="hf-noresults">{tr.noResults}</p>
          )}
        </div>
      </aside>
    </>
  );
}
