import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { useProductos } from "../context/ProductosContext";

// Panel lateral de búsqueda: sin texto muestra sugerencias agrupadas por categoría;
// al escribir, filtra en vivo.
export default function SearchDrawer({ open, onClose }) {
  const { tr, trCat } = useSettings();
  const { productos } = useProductos();
  const [q, setQ] = useState("");
  const [verFiltros, setVerFiltros] = useState(false);
  const [fCat, setFCat] = useState(null);     // categoría seleccionada
  const [fMarca, setFMarca] = useState(null); // marca seleccionada
  const [fPrecio, setFPrecio] = useState(null); // precio máximo
  const [fStock, setFStock] = useState(false); // solo disponibles
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) { setQ(""); setFCat(null); setFMarca(null); setFPrecio(null); setFStock(false); setVerFiltros(false); inputRef.current?.focus(); }
  }, [open]);

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);

  const precioTope = useMemo(
    () => Math.ceil(Math.max(0, ...productos.map((p) => Number(p.precio)))),
    [productos]
  );
  const marcas = useMemo(
    () => [...new Set(productos.map((p) => p.marca).filter(Boolean))],
    [productos]
  );
  const hayFiltros = fCat || fMarca || fPrecio !== null || fStock;

  const filtrados = useMemo(() => {
    const texto = q.toLowerCase().trim();
    if (!texto && !hayFiltros) return null; // null = mostrar sugerencias agrupadas
    return productos.filter((p) =>
      (!texto || p.nombre.toLowerCase().includes(texto) || p.categoriaNombre.toLowerCase().includes(texto)) &&
      (!fCat || p.categoriaNombre === fCat) &&
      (!fMarca || p.marca === fMarca) &&
      (fPrecio === null || Number(p.precio) <= fPrecio) &&
      (!fStock || p.stock > 0));
  }, [q, productos, fCat, fMarca, fPrecio, fStock, hayFiltros]);

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

        <button className={`hf-filters-toggle ${verFiltros || hayFiltros ? "on" : ""}`}
                onClick={() => setVerFiltros((v) => !v)}>
          <i className="ti ti-adjustments-horizontal" /> {tr.filters}
          <i className={`ti ti-chevron-down ${verFiltros ? "up" : ""}`} />
        </button>

        {verFiltros && (
          <div className="hf-filters">
            <div className="hf-filter-group">
              <span className="glbl">{tr.filterCat}</span>
              <div className="chips">
                {[...new Set(productos.map((p) => p.categoriaNombre))].map((c) => (
                  <button key={c} className={`chip ${fCat === c ? "on" : ""}`}
                          onClick={() => setFCat(fCat === c ? null : c)}>{trCat(c)}</button>
                ))}
              </div>
            </div>
            <div className="hf-filter-group">
              <span className="glbl">{tr.filterBrand}</span>
              <div className="chips">
                {marcas.map((m) => (
                  <button key={m} className={`chip ${fMarca === m ? "on" : ""}`}
                          onClick={() => setFMarca(fMarca === m ? null : m)}>{m}</button>
                ))}
              </div>
            </div>
            <div className="hf-filter-group">
              <span className="glbl">{tr.filterMaxPrice}: <b>{fPrecio ?? precioTope} €</b></span>
              <input type="range" min="0" max={precioTope} value={fPrecio ?? precioTope}
                     onChange={(e) => setFPrecio(Number(e.target.value))} />
            </div>
            <label className="hf-filter-check">
              <input type="checkbox" checked={fStock} onChange={(e) => setFStock(e.target.checked)} />
              {tr.filterStock}
            </label>
            {hayFiltros && (
              <button className="hf-filter-clear"
                      onClick={() => { setFCat(null); setFMarca(null); setFPrecio(null); setFStock(false); }}>
                <i className="ti ti-x" /> {tr.filterClear}
              </button>
            )}
          </div>
        )}
        <div className="hf-search-results">
          {filtrados === null ? (
            Object.entries(grupos).map(([cat, lista]) => (
              <div key={cat} className="hf-search-group">
                <span className="glbl">{trCat(cat)}</span>
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
