import { useEffect, useState } from "react";
import { listarAtributos } from "../api/atributos";

/**
 * Cabecera de especificaciones destacadas, bajo el precio del producto. Muestra
 * en una rejilla los atributos marcados como "destacados" en el catálogo, cada
 * uno con su icono, etiqueta y valor (estilo ficha de tienda de periféricos).
 */
export default function SpecHighlights({ categoriaId, specs, tr }) {
  const [atributos, setAtributos] = useState([]);

  useEffect(() => {
    if (!categoriaId) return;
    listarAtributos(categoriaId).then(({ data }) => setAtributos(data)).catch(() => setAtributos([]));
  }, [categoriaId]);

  const valores = specs || {};
  const destacados = atributos.filter(
    (a) => a.destacado && valores[a.clave] !== null && valores[a.clave] !== undefined && valores[a.clave] !== ""
  );
  if (destacados.length === 0) return null;

  const mostrar = (a) => {
    const v = valores[a.clave];
    if (a.tipo === "BOOLEANO" || typeof v === "boolean") return v === true || v === "true" ? tr.yes : tr.no;
    return a.unidad ? `${v} ${a.unidad}` : `${v}`;
  };

  return (
    <div className="hf-highlights">
      {destacados.map((a) => (
        <div key={a.id} className="hf-hl-item">
          <i className={`ti ti-${a.icono || "point"}`} />
          <div className="hf-hl-txt">
            <span className="k">{a.etiqueta}</span>
            <span className="v">{mostrar(a)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
