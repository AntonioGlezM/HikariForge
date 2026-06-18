import { useState } from "react";

/**
 * Acordeón reutilizable. Recibe una lista de secciones { titulo, contenido } y
 * muestra cada una como una fila plegable. Por defecto todas cerradas; se puede
 * indicar cuál abrir de inicio con `abiertoInicial` (índice).
 *
 * Se usa en la ficha de producto para ordenar la información densa (specs,
 * dimensiones, envío, garantía) sin alargar la página, al estilo de las tiendas
 * de periféricos.
 */
export default function Accordion({ secciones, abiertoInicial = null }) {
  const [abierto, setAbierto] = useState(abiertoInicial);

  return (
    <div className="hf-accordion">
      {secciones.map((s, i) => {
        const activa = abierto === i;
        return (
          <div key={i} className={`hf-acc-item ${activa ? "on" : ""}`}>
            <button className="hf-acc-head" onClick={() => setAbierto(activa ? null : i)}
                    aria-expanded={activa}>
              <span>{s.titulo}</span>
              <i className={`ti ${activa ? "ti-minus" : "ti-plus"}`} />
            </button>
            {activa && <div className="hf-acc-body">{s.contenido}</div>}
          </div>
        );
      })}
    </div>
  );
}
