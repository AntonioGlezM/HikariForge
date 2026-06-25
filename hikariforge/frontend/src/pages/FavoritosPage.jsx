import { useSettings } from "../context/SettingsContext";
import { useFavs } from "../context/FavsContext";
import ProductCard from "../components/ProductCard";
import EmptyState from "../components/EmptyState";

// Lista de deseos: los productos marcados con el corazón.
export default function FavoritosPage() {
  const { tr } = useSettings();
  const { favs } = useFavs();

  return (
    <main className="hf-wrap hf-section">
      <div className="hf-section-head">
        <span className="hf-eyebrow">{tr.accFavs}</span>
        <h2 className="hf-h2">{tr.favsTitle}</h2>
      </div>
      {favs.length === 0
        ? <EmptyState icon="ti-heart" title={tr.favsEmptyTitle} text={tr.favsEmpty}
                      ctaLabel={tr.ctaCatalog} ctaTo="/catalogo" />
        : <div className="hf-grid">{favs.map((p) => <ProductCard key={p.id} producto={p} />)}</div>}
    </main>
  );
}
