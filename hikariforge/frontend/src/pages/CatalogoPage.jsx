import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { listarProductos, listarMarcas, listarColores } from "../api/productos";
import { useSettings } from "../context/SettingsContext";
import { useProductos } from "../context/ProductosContext";
import ProductCard from "../components/ProductCard";
import ColorSelect from "../components/ColorSelect";
import FancySelect from "../components/FancySelect";

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
  const [marca, setMarca] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [enStock, setEnStock] = useState(false);
  // Filtros avanzados (especificaciones)
  const [conexion, setConexion] = useState("");
  const [pesoMax, setPesoMax] = useState("");
  const [color, setColor] = useState("");
  const [rgb, setRgb] = useState(false);
  const [avanzados, setAvanzados] = useState(false);
  const [pagina, setPagina] = useState(0);

  const [marcas, setMarcas] = useState([]);
  const [colores, setColores] = useState([]);
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Marcas para el selector (una vez).
  useEffect(() => { listarMarcas().then(({ data }) => setMarcas(data)).catch(() => {}); }, []);
  useEffect(() => { listarColores().then(({ data }) => setColores(data)).catch(() => {}); }, []);

  // La categoría activa se deriva directamente de la URL (?cat=Nombre). Así, al
  // pulsar otra categoría en el menú, la vista se actualiza sola y de forma fiable.
  // Un <select> manual de categoría actualiza la URL (catManual) para el mismo flujo.
  const [catManual, setCatManual] = useState(null);
  const categoriaActual = catManual !== null
    ? catManual
    : (catParam ? categoriasFull.find((x) => x.nombre === catParam) ?? null : null);
  const categoriaId = categoriaActual?.id ?? "";
  // Si cambia el cat de la URL, descartamos la selección manual previa.
  useEffect(() => { setCatManual(null); }, [catParam]);

  // Cualquier cambio de filtro vuelve a la primera página.
  useEffect(() => { setPagina(0); }, [texto, categoriaId, marca, precioMax, enStock, conexion, pesoMax, color, rgb]);

  // Petición al backend con los filtros activos (reutilizable para "Reintentar").
  const cargar = useCallback(() => {
    setCargando(true);
    const query = { page: pagina, size: TAM_PAGINA };
    if (texto.trim()) query.texto = texto.trim();
    if (categoriaId) query.categoriaId = categoriaId;
    if (marca) query.marca = marca;
    if (precioMax) query.precioMax = precioMax;
    if (enStock) query.enStock = true;
    if (conexion) query.conexion = conexion;
    if (pesoMax) query.pesoMax = pesoMax;
    if (color.trim()) query.color = color.trim();
    if (rgb) query.rgb = true;

    listarProductos(query)
      .then(({ data }) => { setDatos(data); setError(false); })
      .catch(() => setError(true))
      .finally(() => setCargando(false));
  }, [pagina, texto, categoriaId, marca, precioMax, enStock, conexion, pesoMax, color, rgb]);

  useEffect(() => { cargar(); }, [cargar]);

  const hayFiltros = texto || categoriaId || marca || precioMax || enStock || conexion || pesoMax || color || rgb;
  const limpiar = () => {
    setTexto(""); setMarca(""); setPrecioMax(""); setEnStock(false);
    setConexion(""); setPesoMax(""); setColor(""); setRgb(false);
    setCatManual(null);
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
      <div className={`hf-section-head ${tituloCat ? "is-categoria" : ""}`}>
        <span className="hf-eyebrow">{tituloCat ? tr.navCatalog : tr.catalogAll}</span>
        <h2 className="hf-h2">{tituloCat ? trCat(tituloCat) : tr.catalogTitle}</h2>
        <p className="hf-sub">
          {tituloCat ? tr.catalogCatSub.replace("{cat}", trCat(tituloCat)) : tr.catalogSub}
          {datos != null && ` · ${datos.totalElements} ${tr.catalogCount}`}
        </p>
      </div>

      {/* Barra de filtros (se resuelven en el backend) */}
      <div className="hf-cat-filters">
        <input className="hf-input" placeholder={tr.searchPh} value={texto}
               onChange={(e) => setTexto(e.target.value)} />
        <FancySelect value={categoriaId} placeholder={tr.filterCat}
          onChange={(v) => setCatManual(categoriasFull.find((c) => c.id === v) ?? null)}
          opciones={categoriasFull.map((c) => ({ value: c.id, label: trCat(c.nombre) }))} />
        <FancySelect value={marca} onChange={setMarca} placeholder={tr.filterBrand}
          opciones={marcas.map((m) => ({ value: m, label: m }))} />
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

      {/* Filtros avanzados (especificaciones): plegables para no saturar la barra */}
      <button className="hf-filter-toggle" onClick={() => setAvanzados((v) => !v)}>
        <i className={`ti ${avanzados ? "ti-chevron-up" : "ti-chevron-down"}`} /> {tr.filterAdvanced}
      </button>
      {avanzados && (
        <div className="hf-cat-filters hf-cat-filters-adv">
          <FancySelect value={conexion} onChange={setConexion} placeholder={tr.specConexion}
            opciones={[
              { value: "cable", label: tr.connWired },
              { value: "inalambrico", label: tr.connWireless },
              { value: "ambos", label: tr.connBoth },
            ]} />
          <input className="hf-input" type="number" min="0" placeholder={tr.filterMaxWeight}
                 value={pesoMax} onChange={(e) => setPesoMax(e.target.value)} />
          <ColorSelect value={color} onChange={setColor} opciones={colores} placeholder={tr.specColor} />
          <label className="hf-filter-check">
            <input type="checkbox" checked={rgb} onChange={(e) => setRgb(e.target.checked)} />
            RGB
          </label>
        </div>
      )}

      {error ? (
        <div className="hf-neterror">
          <div className="hf-neterror-ic"><i className="ti ti-wifi-off" /></div>
          <h3>{tr.netErrorTitle}</h3>
          <p>{tr.netErrorText}</p>
          <button className="hf-btn hf-btn-main" onClick={cargar}>{tr.retry}</button>
        </div>
      ) : (
        <>
          {!cargando && datos && lista.length === 0 && <p className="hf-sub">{tr.noResults}</p>}

          {/* Mientras llegan los productos, recuadros con la forma de las tarjetas */}
          {cargando && !datos ? (
            <div className="hf-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="hf-card-skel">
                  <div className="hf-skel-thumb" />
                  <div className="hf-skel-body">
                    <span className="hf-skel-line short" />
                    <span className="hf-skel-line" />
                    <span className="hf-skel-line tiny" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="hf-grid">
              {lista.map((p) => <ProductCard key={p.id} producto={p} />)}
            </div>
          )}

          {totalPaginas > 1 && (
            <div className="hf-pagination">
              <button className="hf-btn" disabled={pagina === 0 || cargando}
                      onClick={() => setPagina((n) => Math.max(0, n - 1))}>{tr.prev}</button>
              <span className="hf-page-info">{tr.page} {pagina + 1} {tr.of} {totalPaginas}</span>
              <button className="hf-btn" disabled={pagina >= totalPaginas - 1 || cargando}
                      onClick={() => setPagina((n) => n + 1)}>{tr.next}</button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
