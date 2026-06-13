import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { listarProductos, listarMarcas } from "../api/productos";
import { useSettings } from "../context/SettingsContext";
import { useProductos } from "../context/ProductosContext";
import ProductCard from "../components/ProductCard";

const TAM_PAGINA = 8;

// Catálogo paginado con filtros aplicados EN EL BACKEND (texto, categoría, marca,
// precio máximo y solo-stock). El parámetro ?cat= preselecciona una categoría.
export default function CatalogoPage() {
  const { tr, trCat } = useSettings();
  const { categoriasFull } = useProductos();
  const [params, setParams] = useSearchParams();
  const catParam = params.get("cat");      // nombre de categoría que llega del menú
  const textoParam = params.get("texto");  // búsqueda que llega del buscador lateral

  // Estado de los filtros.
  const [texto, setTexto] = useState(textoParam ?? "");
  const [categoriaId, setCategoriaId] = useState("");
  const [marca, setMarca] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [enStock, setEnStock] = useState(false);
  const [pagina, setPagina] = useState(0);

  const [marcas, setMarcas] = useState([]);
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Marcas para el selector (una vez).
  useEffect(() => { listarMarcas().then(({ data }) => setMarcas(data)).catch(() => {}); }, []);

  // Si llega ?cat=Nombre desde el menú, lo traducimos a su id de categoría.
  useEffect(() => {
    if (catParam && categoriasFull.length) {
      const c = categoriasFull.find((x) => x.nombre === catParam);
      if (c) setCategoriaId(c.id);
    }
  }, [catParam, categoriasFull]);

  // Cualquier cambio de filtro vuelve a la primera página.
  useEffect(() => { setPagina(0); }, [texto, categoriaId, marca, precioMax, enStock]);

  // Petición al backend con los filtros activos.
  useEffect(() => {
    setCargando(true);
    const query = { page: pagina, size: TAM_PAGINA };
    if (texto.trim()) query.texto = texto.trim();
    if (categoriaId) query.categoriaId = categoriaId;
    if (marca) query.marca = marca;
    if (precioMax) query.precioMax = precioMax;
    if (enStock) query.enStock = true;

    listarProductos(query)
      .then(({ data }) => { setDatos(data); setError(false); })
      .catch(() => setError(true))
      .finally(() => setCargando(false));
  }, [pagina, texto, categoriaId, marca, precioMax, enStock]);

  const hayFiltros = texto || categoriaId || marca || precioMax || enStock;
  const limpiar = () => {
    setTexto(""); setCategoriaId(""); setMarca(""); setPrecioMax(""); setEnStock(false);
    if (catParam) setParams({}, { replace: true });
  };

  const lista = datos?.content ?? [];
  const totalPaginas = datos?.totalPages ?? 0;
  const tituloCat = useMemo(
    () => categoriasFull.find((c) => c.id === categoriaId)?.nombre,
    [categoriaId, categoriasFull]
  );

  return (
    <main className="hf-wrap hf-section">
      <div className="hf-section-head">
        <span className="hf-eyebrow">{tr.navCatalog}</span>
        <h2 className="hf-h2">{tituloCat ? trCat(tituloCat) : tr.catalogTitle}</h2>
        <p className="hf-sub">{tr.catalogSub}</p>
      </div>

      {/* Barra de filtros (se resuelven en el backend) */}
      <div className="hf-cat-filters">
        <input className="hf-input" placeholder={tr.searchPh} value={texto}
               onChange={(e) => setTexto(e.target.value)} />
        <select className="hf-input" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
          <option value="">{tr.filterCat}</option>
          {categoriasFull.map((c) => <option key={c.id} value={c.id}>{trCat(c.nombre)}</option>)}
        </select>
        <select className="hf-input" value={marca} onChange={(e) => setMarca(e.target.value)}>
          <option value="">{tr.filterBrand}</option>
          {marcas.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <input className="hf-input" type="number" min="0" placeholder={tr.filterMaxPrice}
               value={precioMax} onChange={(e) => setPrecioMax(e.target.value)} />
        <label className="hf-filter-check">
          <input type="checkbox" checked={enStock} onChange={(e) => setEnStock(e.target.checked)} />
          {tr.filterStock}
        </label>
        {hayFiltros && (
          <button className="hf-filter-clear" onClick={limpiar}><i className="ti ti-x" /> {tr.filterClear}</button>
        )}
      </div>

      {error && <p className="hf-error">{tr.loadError}</p>}
      {cargando && !datos && <p className="hf-sub">{tr.loading}</p>}
      {!cargando && datos && lista.length === 0 && <p className="hf-sub">{tr.noResults}</p>}

      <div className="hf-grid">
        {lista.map((p) => <ProductCard key={p.id} producto={p} />)}
      </div>

      {totalPaginas > 1 && (
        <div className="hf-pagination">
          <button className="hf-btn" disabled={pagina === 0 || cargando}
                  onClick={() => setPagina((n) => Math.max(0, n - 1))}>{tr.prev}</button>
          <span className="hf-page-info">{tr.page} {pagina + 1} {tr.of} {totalPaginas}</span>
          <button className="hf-btn" disabled={pagina >= totalPaginas - 1 || cargando}
                  onClick={() => setPagina((n) => n + 1)}>{tr.next}</button>
        </div>
      )}
    </main>
  );
}
