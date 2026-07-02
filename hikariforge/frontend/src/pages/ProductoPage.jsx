import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { obtenerProducto } from "../api/productos";
import { useSettings } from "../context/SettingsContext";
import { useCart } from "../context/CartContext";
import { tieneOferta, precioEfectivo, porcentajeDescuento } from "../utils/precio";
import { useProductos } from "../context/ProductosContext";
import ProductCard from "../components/ProductCard";
import Reviews from "../components/Reviews";
import SpecSheet from "../components/SpecSheet";
import SpecHighlights from "../components/SpecHighlights";
import Accordion from "../components/Accordion";

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
  const pocas = !agotado && p.stock <= 5;   // mismo umbral que la tarjeta del catálogo

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
            <div className="hf-spec">
              <span className="k"><i className="ti ti-circle-check" />{tr.specStock}</span>
              <span className={`hf-avail ${agotado ? "out" : pocas ? "few" : "ok"}`}>
                {agotado ? tr.out : pocas ? tr.stockFew : tr.stockOk}
              </span>
            </div>
          </div>
          <div className="price">
            {precioEfectivo(p)}<span> €</span>
            {tieneOferta(p) && (
              <>
                <span className="hf-price-old">{p.precio} €</span>
                <span className="hf-off-badge inline">-{porcentajeDescuento(p)}%</span>
              </>
            )}
          </div>
          {/* Aviso de vigencia de la oferta */}
          {tieneOferta(p) && p.ofertaHastaAgotar && (
            <p className="hf-offer-note"><i className="ti ti-flame" />{tr.offWhileStock}</p>
          )}
          {tieneOferta(p) && !p.ofertaHastaAgotar && p.ofertaHasta && (
            <p className="hf-offer-note"><i className="ti ti-clock" />{tr.offUntil} {new Date(p.ofertaHasta).toLocaleDateString()}</p>
          )}
          {/* Oferta definida pero aún no empezada */}
          {p.ofertaProgramada && (
            <p className="hf-offer-note soon"><i className="ti ti-calendar-clock" />{tr.offSoon}: {tr.offFrom} {new Date(p.ofertaDesde).toLocaleDateString()}</p>
          )}
          {/* Precio más bajo de los últimos 30 días (cumplimiento Omnibus de la UE) */}
          {tieneOferta(p) && p.precioMinimo30d != null && (
            <p className="hf-min30"><i className="ti ti-info-circle" />{tr.priceMin30.replace("{precio}", p.precioMinimo30d)}</p>
          )}
          {/* Aviso de stock bajo: empuja a comprar cuando quedan pocas unidades */}
          {pocas && (
            <p className="hf-lowstock"><i className="ti ti-flame" />{tr.stockFew}</p>
          )}
          <button className="hf-add" style={{ maxWidth: 320 }} disabled={agotado} onClick={() => add(p)}>
            {agotado ? tr.noStock : tr.add}
          </button>

          {/* Cabecera de especificaciones destacadas (los atributos importantes) */}
          <SpecHighlights categoriaId={p.categoriaId} specs={p.specs} tr={tr} />
        </div>
      </div>

      {/* Información del producto en acordeón: ficha técnica, envío y garantía */}
      <section className="hf-product-acc">
        <Accordion abiertoInicial={0} secciones={[
          {
            titulo: tr.specSheetTitle,
            contenido: <SpecSheet categoriaId={p.categoriaId} specs={p.specs} tr={tr} embedded />,
          },
          {
            titulo: tr.accShipping,
            contenido: <p className="hf-acc-text">{tr.accShippingText}</p>,
          },
          {
            titulo: tr.accWarranty,
            contenido: <p className="hf-acc-text">{tr.accWarrantyText}</p>,
          },
        ]} />
      </section>

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
