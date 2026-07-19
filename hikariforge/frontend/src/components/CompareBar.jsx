import { useLocation, useNavigate } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { useComparador } from "../context/ComparadorContext";

// Barra flotante (Fase 5): aparece cuando hay 2+ productos marcados para
// comparar, desde cualquier página salvo el propio comparador.
export default function CompareBar() {
  const { tr } = useSettings();
  const { ids, limpiar } = useComparador();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (ids.length < 2 || pathname === "/comparar") return null;

  return (
    <div className="hf-compare-bar">
      <span><i className="ti ti-arrows-diff" /> {ids.length} {tr.compareSelected}</span>
      <button className="hf-btn hf-btn-main" onClick={() => navigate("/comparar")}>
        {tr.compareGo}
      </button>
      <button className="hf-compare-clear" onClick={limpiar} aria-label={tr.compareClear}>
        <i className="ti ti-x" />
      </button>
    </div>
  );
}
