import FancySelect from "./FancySelect";

// Mapa de nombres de color (es/en) a un valor CSS para la muestra circular.
// Si un color no está en el mapa, se intenta usar el propio nombre como color CSS.
const COLOR_CSS = {
  negro: "#1a1a1a", black: "#1a1a1a",
  blanco: "#f5f5f5", white: "#f5f5f5",
  gris: "#9aa0a6", gray: "#9aa0a6", grey: "#9aa0a6",
  plata: "#c8ccd0", silver: "#c8ccd0",
  rosa: "#ff77a9", pink: "#ff77a9",
  rojo: "#e5484d", red: "#e5484d",
  azul: "#4a7bff", blue: "#4a7bff",
  verde: "#3ec46d", green: "#3ec46d",
  amarillo: "#ffd23f", yellow: "#ffd23f",
  morado: "#7c5cff", púrpura: "#7c5cff", purpura: "#7c5cff", purple: "#7c5cff",
  naranja: "#ff8c42", orange: "#ff8c42",
  lila: "#c9a7ff", lilac: "#c9a7ff",
  dorado: "#d4af37", gold: "#d4af37",
};

function muestraDe(nombre) {
  const k = nombre.toLowerCase().trim();
  return COLOR_CSS[k] || k; // si no está en el mapa, prueba el nombre como color CSS
}

/**
 * Desplegable de color: un FancySelect cuyas opciones llevan el círculo del
 * color correspondiente. La lista de colores la pobla el catálogo real.
 */
export default function ColorSelect({ value, onChange, opciones, placeholder }) {
  const items = opciones.map((c) => ({ value: c, label: c, color: muestraDe(c) }));
  return <FancySelect value={value} onChange={onChange} placeholder={placeholder} opciones={items} />;
}
