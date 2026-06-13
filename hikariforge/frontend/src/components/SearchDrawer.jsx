import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { useProductos } from "../context/ProductosContext";
import { listarProductos } from "../api/productos";

// Panel lateral de búsqueda. Sin texto muestra sugerencias agrupadas por categoría
// (de los productos ya cargados); al escribir, consulta al backend con un pequeño
// retardo (debounce) para no lanzar una petición por tecla.
export default function SearchDrawer({ open, onClose }) {
  const { tr, trCat } = useSettings();
  const { productos } = useProductos();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [resultados, setResultados] = useState(null); // null = mostrar sugerencias
  const [buscando, setBuscando] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) { setQ(""); setResultados(null); inputRef.current?.focus(); }
  }, [open]);

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);

  // Búsqueda en el backend con debounce de 300 ms.
  useEffect(() => {
    const texto = q.trim();
    if (!texto) { setResultados(null); return; }
    setBuscando(true);
    const t = setTimeout(() => {
      listarProductos({ texto, page: 0, size: 20 })
        .then(({ data }) => setResultados(data.content))
        .catch(() => setResultados([]))
        .finally(() => setBuscando(false));
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  // Sugerencias agrupadas por categoría cuando no hay texto.
  const grupos = useMemo(() => {
    const g = {};
    productos.forEach((p) => (g[p.categoriaNombre] ??= []).push(p));
    return g;
  }, [productos]);

  const irACatalogo = () => { onClose(); navigate(`/catalogo?texto=${encodeURIComponent(q.trim())}`); };

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
               value={q} onChange={(e) => setQ(e.target.value)}
               onKeyDown={(e) => e.key === "Enter" && q.trim() && irACatalogo()} />

        <div className="hf-search-results">
          {resultados === null ? (
            Object.entries(grupos).map(([cat, lista]) => (
              <div key={cat} className="hf-search-group">
                <span className="glbl">{trCat(cat)}</span>
                {lista.map(fila)}
              </div>
            ))
          ) : buscando ? (
            <p className="hf-sub" style={{ textAlign: "center" }}>{tr.loading}</p>
          ) : resultados.length ? (
            resultados.map(fila)
          ) : (
            <p className="hf-noresults">{tr.noResults}</p>
          )}
        </div>
      </aside>
    </>
  );
}
