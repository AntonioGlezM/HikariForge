import { Link } from "react-router-dom";

// Estado vacío reutilizable: icono, título, texto y (opcional) un botón de acción.
// Convierte una página sin contenido en una invitación a seguir navegando.
export default function EmptyState({ icon = "ti-mood-empty", title, text, ctaLabel, ctaTo }) {
  return (
    <div className="hf-empty">
      <div className="hf-empty-ic"><i className={`ti ${icon}`} /></div>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {ctaLabel && ctaTo && (
        <Link to={ctaTo} className="hf-btn hf-btn-main">{ctaLabel}</Link>
      )}
    </div>
  );
}
