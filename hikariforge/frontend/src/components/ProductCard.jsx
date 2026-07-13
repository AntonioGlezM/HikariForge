import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { useCart } from "../context/CartContext";
import { useFavs } from "../context/FavsContext";
import { tieneOferta, precioEfectivo, porcentajeDescuento } from "../utils/precio";

const STOCK_BAJO = 5; // umbral para avisar de "pocas unidades"

// Tarjeta de producto del catálogo. El stock no se muestra como número exacto,
// sino de forma cualitativa (en stock / pocas unidades / agotado).
export default function ProductCard({ producto }) {
  const { tr, trCat } = useSettings();
  const { add } = useCart();
  const { esFav, toggleFav } = useFavs();

  const agotado = producto.stock <= 0;
  const pocas = !agotado && producto.stock <= STOCK_BAJO;

  // Estado de disponibilidad mostrado en las specs (texto + estilo).
  const disponibilidad = agotado
    ? { texto: tr.out, clase: "out" }
    : pocas
      ? { texto: tr.stockFew, clase: "few" }
      : { texto: tr.stockOk, clase: "ok" };

  return (
    <article className="hf-card">
      <Link to={`/producto/${producto.id}`}>
        <div className="hf-thumb">
          <span className="hf-tag">{trCat(producto.categoriaNombre)}</span>
          {tieneOferta(producto) && <span className="hf-off-badge">-{porcentajeDescuento(producto)}%</span>}
          {producto.imagenUrl
            ? <img className="hf-thumb-img" src={producto.imagenUrl} alt={producto.nombre} loading="lazy" />
            : <span className="hf-letter">{producto.nombre.split(" ")[0]}</span>}
        </div>
      </Link>
      {/* Corazón de favoritos (no navega: detiene el clic) */}
      <button className={`hf-fav ${esFav(producto.id) ? "on" : ""}`} aria-label="Favorito"
              onClick={(e) => { e.preventDefault(); toggleFav(producto); }}>
        <i className={`ti ${esFav(producto.id) ? "ti-heart-filled" : "ti-heart"}`} />
      </button>
      <h3>{producto.nombre}</h3>
      <div className="hf-specs">
        <div className="hf-spec"><span className="k"><i className="ti ti-tag" />{tr.specBrand}</span><span>{producto.marca ?? "—"}</span></div>
        <div className="hf-spec"><span className="k"><i className="ti ti-truck" />{tr.specShip}</span><span>{tr.shipFast}</span></div>
        <div className="hf-spec">
          <span className="k"><i className="ti ti-circle-check" />{tr.specStock}</span>
          <span className={`hf-avail ${disponibilidad.clase}`}>{disponibilidad.texto}</span>
        </div>
      </div>
      <div className="hf-card-foot">
        <div className="hf-price">
          {precioEfectivo(producto)}<span>€</span>
          {tieneOferta(producto) && <span className="hf-price-old">{producto.precio} €</span>}
        </div>
      </div>
      <button className="hf-add" disabled={agotado} onClick={() => add(producto)}>
        {agotado ? tr.noStock : tr.add}
      </button>
    </article>
  );
}
