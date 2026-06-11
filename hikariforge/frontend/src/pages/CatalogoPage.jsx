import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { listarProductos } from "../api/productos";
import { useSettings } from "../context/SettingsContext";
import ProductCard from "../components/ProductCard";

const TAM_PAGINA = 8;

// Catálogo paginado contra la API. Admite ?cat=Nombre para filtrar por categoría
// (filtro en cliente de momento; pasará al backend cuando exista el endpoint).
export default function CatalogoPage() {
  const { tr } = useSettings();
  const [params] = useSearchParams();
  const cat = params.get("cat");

  const [pagina, setPagina] = useState(0);
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => { setPagina(0); }, [cat]);

  useEffect(() => {
    setCargando(true);
    listarProductos({ page: pagina, size: TAM_PAGINA })
      .then(({ data }) => { setDatos(data); setError(false); })
      .catch(() => setError(true))
      .finally(() => setCargando(false));
  }, [pagina]);

  const lista = (datos?.content ?? []).filter((p) => !cat || p.categoriaNombre === cat);
  const totalPaginas = datos?.totalPages ?? 0;

  return (
    <main className="hf-wrap hf-section">
      <div className="hf-section-head">
        <span className="hf-eyebrow">{tr.navCatalog}</span>
        <h2 className="hf-h2">{cat ?? tr.catalogTitle}</h2>
        <p className="hf-sub">{tr.catalogSub}</p>
      </div>

      {error && <p className="hf-error">{tr.loadError}</p>}
      {cargando && !datos && <p className="hf-sub">{tr.loading}</p>}

      <div className="hf-grid">
        {lista.map((p) => <ProductCard key={p.id} producto={p} />)}
      </div>

      {!cat && totalPaginas > 1 && (
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
