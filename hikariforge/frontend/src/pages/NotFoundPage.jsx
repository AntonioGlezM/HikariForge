import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";

// Página 404 con la identidad de la marca: el kanji 光 partido en el "0".
export default function NotFoundPage() {
  const { tr } = useSettings();

  return (
    <main className="hf-nf">
      <div className="code">4<span className="kanji">光</span>4</div>
      <h1>{tr.nfTitle}</h1>
      <p>{tr.nfSub}</p>
      <div className="acciones">
        <Link to="/" className="hf-btn hf-btn-main">{tr.nfBtn}</Link>
        <Link to="/catalogo" className="hf-btn">{tr.nfCatalog}</Link>
      </div>
    </main>
  );
}
