import { useSettings } from "../context/SettingsContext";
import { useFavs } from "../context/FavsContext";
import ProductCard from "../components/ProductCard";

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
        ? <p className="hf-sub">{tr.favsEmpty}</p>
        : <div className="hf-grid">{favs.map((p) => <ProductCard key={p.id} producto={p} />)}</div>}
    </main>
  );
}
