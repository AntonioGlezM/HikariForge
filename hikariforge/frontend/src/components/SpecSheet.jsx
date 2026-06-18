import { useEffect, useState } from "react";
import { listarAtributos } from "../api/atributos";

/**
 * Ficha técnica del producto en la página de detalle. Combina los valores
 * guardados (producto.specs: clave -> valor) con el catálogo de atributos de la
 * categoría (que aporta etiqueta, sección, unidad y orden) para mostrarlos
 * agrupados por secciones, al estilo de una ficha de tienda real.
 *
 * props:
 *  - categoriaId: categoría del producto (define el catálogo de atributos)
 *  - specs: objeto { clave: valor } del producto
 *  - tr: traducciones
 */
export default function SpecSheet({ categoriaId, specs, tr, embedded = false }) {
  const [atributos, setAtributos] = useState([]);

  useEffect(() => {
    if (!categoriaId) return;
    listarAtributos(categoriaId)
      .then(({ data }) => setAtributos(data))
      .catch(() => setAtributos([]));
  }, [categoriaId]);

  const valores = specs || {};
  // Solo mostramos atributos del catálogo que tengan un valor en este producto.
  const conValor = atributos.filter((a) => {
    const v = valores[a.clave];
    return v !== null && v !== undefined && v !== "";
  });

  if (conValor.length === 0) return null;

  // Agrupar por sección, conservando el orden que ya trae el backend.
  const secciones = {};
  for (const a of conValor) {
    const s = a.seccion || tr.specOther;
    (secciones[s] ??= []).push(a);
  }

  // Formatea un valor para mostrarlo: booleano -> Sí/No, y añade la unidad.
  const mostrar = (a) => {
    let v = valores[a.clave];
    if (a.tipo === "BOOLEANO" || typeof v === "boolean") {
      return v === true || v === "true" ? tr.yes : tr.no;
    }
    return a.unidad ? `${v} ${a.unidad}` : `${v}`;
  };

  return (
    <section className={embedded ? "hf-specsheet embedded" : "hf-specsheet"}>
      {!embedded && <h2 className="hf-h2">{tr.specSheetTitle}</h2>}
      <div className="hf-specsheet-grid">
        {Object.entries(secciones).map(([seccion, attrs]) => (
          <div key={seccion} className="hf-specsheet-block">
            <h3>{seccion}</h3>
            <dl>
              {attrs.map((a) => (
                <div key={a.id} className="hf-specrow">
                  <dt>{a.etiqueta}</dt>
                  <dd>{mostrar(a)}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}
