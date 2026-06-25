// Spinner circular reutilizable para indicar carga/proceso en curso.
// Tamaño en px configurable; hereda el color del texto (currentColor).
export default function Spinner({ size = 16 }) {
  return <span className="hf-spinner" style={{ width: size, height: size }} aria-hidden="true" />;
}
