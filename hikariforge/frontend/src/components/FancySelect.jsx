import { useEffect, useRef, useState } from "react";

/**
 * Desplegable personalizado con la estética redondeada de la página, en
 * sustitución del <select> nativo (cuyo desplegable lo dibuja el navegador/SO
 * y no respeta los estilos, sobre todo en Windows).
 *
 * props:
 *  - value: valor seleccionado ("" = ninguno)
 *  - onChange(valor)
 *  - placeholder: texto cuando no hay selección
 *  - opciones: array de { value, label, color? }
 *      color (opcional): si se indica, muestra un círculo de ese color a la izquierda
 */
export default function FancySelect({ value, onChange, placeholder, opciones }) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);

  // Cerrar al hacer clic fuera.
  useEffect(() => {
    const fuera = (e) => { if (ref.current && !ref.current.contains(e.target)) setAbierto(false); };
    document.addEventListener("mousedown", fuera);
    return () => document.removeEventListener("mousedown", fuera);
  }, []);

  const sel = opciones.find((o) => o.value === value) || null;
  const elegir = (v) => { onChange(v); setAbierto(false); };

  return (
    <div className="hf-fancysel" ref={ref}>
      <button type="button" className="hf-fancysel-btn" onClick={() => setAbierto((v) => !v)}>
        <span className="lbl">
          {sel
            ? <>{sel.color && <span className="dot" style={{ background: sel.color }} />}{sel.label}</>
            : <span className="ph">{placeholder}</span>}
        </span>
        <i className={`ti ${abierto ? "ti-chevron-up" : "ti-chevron-down"}`} />
      </button>
      {abierto && (
        <ul className="hf-fancysel-menu" role="listbox">
          <li role="option" className="opt" onClick={() => elegir("")}>
            <span className="ph">{placeholder}</span>
          </li>
          {opciones.map((o) => (
            <li key={o.value} role="option" className={`opt ${o.value === value ? "on" : ""}`}
                onClick={() => elegir(o.value)}>
              {o.color && <span className="dot" style={{ background: o.color }} />}{o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
