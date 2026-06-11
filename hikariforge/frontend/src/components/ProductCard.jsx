import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { useCart } from "../context/CartContext";
import { useFavs } from "../context/FavsContext";

// Tarjeta de producto del catálogo, con specs y añadir al carrito.
export default function ProductCard({ producto }) {
  const { tr, trCat } = useSettings();
  const { add } = useCart();
  const { esFav, toggleFav } = useFavs();
  const agotado = producto.stock <= 0;

  return (
    <article className="hf-card">
      <Link to={`/producto/${producto.id}`}>
        <div className="hf-thumb">
          <span className="hf-tag">{trCat(producto.categoriaNombre)}</span>
          <span className="hf-letter">{producto.nombre.split(" ")[0]}</span>
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
        <div className="hf-spec"><span className="k"><i className="ti ti-category-2" />{tr.specCat}</span><span>{trCat(producto.categoriaNombre)}</span></div>
        <div className="hf-spec"><span className="k"><i className="ti ti-box" />{tr.specStock}</span><span>{agotado ? "—" : producto.stock}</span></div>
      </div>
      <div className="hf-card-foot">
        <div className="hf-price">{producto.precio}<span>€</span></div>
        <div className={`hf-stock ${agotado ? "out" : ""}`}>{agotado ? tr.out : tr.avail}</div>
      </div>
      <button className="hf-add" disabled={agotado} onClick={() => add(producto)}>
        {agotado ? tr.noStock : tr.add}
      </button>
    </article>
  );
}
