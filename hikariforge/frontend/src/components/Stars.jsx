/**
 * Estrellas de valoración. En modo lectura pinta la nota (admite medias, con
 * relleno parcial de la última estrella). Con la prop onRate se vuelve
 * interactivo para que el usuario elija su puntuación.
 */
export default function Stars({ value = 0, onRate = null, size = "1rem" }) {
  const estrellas = [1, 2, 3, 4, 5];

  return (
    <span className={`hf-stars ${onRate ? "interactive" : ""}`} style={{ fontSize: size }}>
      {estrellas.map((n) => {
        // Relleno de cada estrella: completa, parcial (solo en modo lectura) o vacía.
        const relleno = Math.max(0, Math.min(1, value - (n - 1)));
        const pct = onRate ? (value >= n ? 100 : 0) : relleno * 100;
        return (
          <button key={n} type="button" className="star" disabled={!onRate}
                  onClick={() => onRate?.(n)} aria-label={`${n}`}>
            <i className="ti ti-star bg" />
            <i className="ti ti-star-filled fg" style={{ width: `${pct}%` }} />
          </button>
        );
      })}
    </span>
  );
}
