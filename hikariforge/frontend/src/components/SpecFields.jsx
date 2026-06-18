import { useEffect, useState } from "react";
import { listarAtributos } from "../api/atributos";

/**
 * Renderiza los campos de la ficha técnica (specs) de un producto según el
 * catálogo de atributos de su categoría. Cada atributo se pinta con el control
 * adecuado a su tipo (texto, número, sí/no o lista), agrupado por secciones.
 *
 * props:
 *  - categoriaId: categoría seleccionada (define qué atributos se muestran)
 *  - specs: objeto { clave: valor } con los valores actuales
 *  - onChange: callback(nuevasSpecs) cuando cambia algún valor
 *  - tr: traducciones
 */
export default function SpecFields({ categoriaId, specs, onChange, tr }) {
  const [atributos, setAtributos] = useState([]);

  // Al cambiar de categoría, recargamos su catálogo de atributos.
  useEffect(() => {
    if (!categoriaId) { setAtributos([]); return; }
    listarAtributos(categoriaId)
      .then(({ data }) => setAtributos(data))
      .catch(() => setAtributos([]));
  }, [categoriaId]);

  if (!categoriaId) return null;
  if (atributos.length === 0) return null;

  // Cambia el valor de un atributo y propaga el specs completo actualizado.
  const set = (clave, valor) => onChange({ ...specs, [clave]: valor });

  // Agrupar por sección para mostrar como en una ficha técnica real.
  const secciones = {};
  for (const a of atributos) {
    const s = a.seccion || tr.specOther;
    (secciones[s] ??= []).push(a);
  }

  return (
    <div className="hf-specfields">
      <p className="hf-specfields-title">{tr.admSpecsTitle}</p>
      {Object.entries(secciones).map(([seccion, attrs]) => (
        <fieldset key={seccion} className="hf-specgroup">
          <legend>{seccion}</legend>
          {attrs.map((a) => (
            <label key={a.id} className="hf-specfield">
              <span>{a.etiqueta}{a.unidad ? ` (${a.unidad})` : ""}</span>
              {renderControl(a, specs[a.clave], set, tr)}
            </label>
          ))}
        </fieldset>
      ))}
    </div>
  );
}

// Devuelve el control de formulario apropiado para el tipo de atributo.
function renderControl(attr, valor, set, tr) {
  const v = valor ?? "";
  switch (attr.tipo) {
    case "NUMERO":
      return <input className="hf-input" type="number" step="any" value={v}
                    onChange={(e) => set(attr.clave, e.target.value)} />;
    case "BOOLEANO":
      return (
        <select className="hf-input" value={v === true ? "true" : v === false ? "false" : ""}
                onChange={(e) => set(attr.clave, e.target.value === "" ? null : e.target.value === "true")}>
          <option value="">—</option>
          <option value="true">{tr.yes}</option>
          <option value="false">{tr.no}</option>
        </select>
      );
    case "LISTA":
      return (
        <select className="hf-input" value={v} onChange={(e) => set(attr.clave, e.target.value || null)}>
          <option value="">—</option>
          {attr.opciones.map((op) => <option key={op} value={op}>{op}</option>)}
        </select>
      );
    default: // TEXTO
      return <input className="hf-input" value={v}
                    onChange={(e) => set(attr.clave, e.target.value)} />;
  }
}
