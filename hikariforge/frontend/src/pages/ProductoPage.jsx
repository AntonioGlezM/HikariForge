import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { obtenerProducto } from "../api/productos";
import { useSettings } from "../context/SettingsContext";
import { useCart } from "../context/CartContext";
import { useProductos } from "../context/ProductosContext";
import ProductCard from "../components/ProductCard";
import Reviews from "../components/Reviews";

// Ficha de producto: carga por id, registra la visita en "vistos recientemente"
// y permite añadir al carrito.
export default function ProductoPage() {
  const { id } = useParams();
  const { tr, trCat } = useSettings();
  const { add, addRecent } = useCart();
  const { productos } = useProductos();
  const [p, setP] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    obtenerProducto(id)
      .then(({ data }) => { setP(data); addRecent(data); })
      .catch(() => setError(true));
  }, [id]); // eslint-disable-line

  if (error) return <main className="hf-wrap hf-section"><p className="hf-error">{tr.loadError}</p></main>;
  if (!p) return <main className="hf-wrap hf-section"><p className="hf-sub">{tr.loading}</p></main>;

  const agotado = p.stock <= 0;

  return (
    <main className="hf-wrap">
      <div className="hf-product">
        <div className="hf-promo-visual">
          <span className="big">{p.nombre.split(" ")[0].toUpperCase()}</span>
          <span className="chip"><b>{trCat(p.categoriaNombre)}</b> · {p.marca ?? "HikariForge"}</span>
        </div>
        <div>
          <span className="hf-promo-kicker"><i className="ti ti-category-2" />{trCat(p.categoriaNombre)}</span>
          <h1>{p.nombre}</h1>
          {p.descripcion && <p className="hf-sub">{p.descripcion}</p>}
          <div className="hf-specs" style={{ maxWidth: 380, margin: "18px 0" }}>
            <div className="hf-spec"><span className="k"><i className="ti ti-tag" />{tr.specBrand}</span><span>{p.marca ?? "—"}</span></div>
            <div className="hf-spec"><span className="k"><i className="ti ti-box" />{tr.specStock}</span><span>{agotado ? "—" : p.stock}</span></div>
          </div>
          <div className="price">{p.precio}<span> €</span></div>
          <div className={`hf-stock ${agotado ? "out" : ""}`} style={{ marginBottom: 16 }}>
            {agotado ? tr.out : tr.avail}
          </div>
          {/* Aviso de stock bajo: empuja a comprar cuando quedan pocas unidades */}
          {!agotado && p.stock <= 5 && (
            <p className="hf-lowstock"><i className="ti ti-flame" />{tr.stockLeft.replace("{n}", p.stock)}</p>
          )}
          <button className="hf-add" style={{ maxWidth: 320 }} disabled={agotado} onClick={() => add(p)}>
            {agotado ? tr.noStock : tr.add}
          </button>
        </div>
      </div>

      {/* Valoraciones del producto */}
      <Reviews productoId={p.id} />

      {/* Relacionados: misma categoría, excluyendo el producto actual */}
      {(() => {
        const relacionados = productos
          .filter((x) => x.categoriaNombre === p.categoriaNombre && x.id !== p.id)
          .slice(0, 4);
        if (!relacionados.length) return null;
        return (
          <section className="hf-related">
            <h2 className="hf-h2" style={{ marginBottom: 24 }}>{tr.relatedTitle}</h2>
            <div className="hf-grid">
              {relacionados.map((r) => <ProductCard key={r.id} producto={r} />)}
            </div>
          </section>
        );
      })()}
    </main>
  );
}
