import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { obtenerProducto } from "../api/productos";
import { listarAtributos } from "../api/atributos";
import { useSettings } from "../context/SettingsContext";
import { useComparador } from "../context/ComparadorContext";
import { precioEfectivo, tieneOferta } from "../utils/precio";
import EmptyState from "../components/EmptyState";

// Comparador (Fase 5): muestra hasta 3 productos lado a lado — precio, marca,
// stock y la unión de sus especificaciones (con las etiquetas del catálogo).
export default function CompararPage() {
  const { tr, trCat } = useSettings();
  const { ids, toggleComparar, limpiar } = useComparador();
  const [productos, setProductos] = useState(null);
  const [etiquetas, setEtiquetas] = useState({}); // clave -> etiqueta legible

  useEffect(() => {
    if (ids.length === 0) { setProductos([]); return; }
    // Cargamos cada producto y, con sus categorías, las etiquetas de los atributos.
    Promise.all(ids.map((id) => obtenerProducto(id).then(({ data }) => data).catch(() => null)))
      .then((lista) => {
        const validos = lista.filter(Boolean);
        setProductos(validos);
        const categorias = [...new Set(validos.map((p) => p.categoriaId))];
        return Promise.all(categorias.map((c) => listarAtributos(c).then(({ data }) => data).catch(() => [])));
      })
      .then((porCategoria) => {
        const mapa = {};
        (porCategoria ?? []).flat().forEach((a) => { if (!mapa[a.clave]) mapa[a.clave] = a.etiqueta; });
        setEtiquetas(mapa);
      });
  }, [ids]);

  if (productos === null) return <main className="hf-wrap hf-section"><p className="hf-sub">{tr.loading}</p></main>;

  if (productos.length === 0) {
    return (
      <main className="hf-wrap hf-section">
        <EmptyState icon="ti-arrows-diff" title={tr.compareEmptyTitle} text={tr.compareEmptyText}
                    ctaLabel={tr.ctaCatalog} ctaTo="/catalogo" />
      </main>
    );
  }

  // Filas de specs: la unión de las claves presentes en los productos comparados.
  const claves = [...new Set(productos.flatMap((p) => Object.keys(p.specs ?? {})))];
  const mostrar = (v) => {
    if (v === true || v === "true") return tr.yes;
    if (v === false || v === "false") return tr.no;
    return v ?? "—";
  };

  return (
    <main className="hf-wrap hf-section">
      <div className="hf-section-head">
        <span className="hf-eyebrow">{tr.compareEyebrow}</span>
        <h2 className="hf-h2">{tr.compareTitle}</h2>
      </div>

      <div className="hf-compare-scroll">
        <table className="hf-compare-table">
          <thead>
            <tr>
              <th />
              {productos.map((p) => (
                <th key={p.id}>
                  <div className="hf-cmp-head">
                    {p.imagenUrl
                      ? <img src={p.imagenUrl} alt={p.nombre} />
                      : <div className="hf-cmp-ph">{p.nombre.split(" ")[0]}</div>}
                    <Link to={`/producto/${p.id}`}>{p.nombre}</Link>
                    <button type="button" className="hf-cmp-quitar" onClick={() => toggleComparar(p.id)}>
                      {tr.compareRemove}
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="k">{tr.specPrice}</td>
              {productos.map((p) => (
                <td key={p.id}>
                  <b>{precioEfectivo(p).toFixed(2)} €</b>
                  {tieneOferta(p) && <s style={{ marginLeft: 6, opacity: .6 }}>{p.precio} €</s>}
                </td>
              ))}
            </tr>
            <tr>
              <td className="k">{tr.specBrand}</td>
              {productos.map((p) => <td key={p.id}>{p.marca ?? "—"}</td>)}
            </tr>
            <tr>
              <td className="k">{tr.compareCategory}</td>
              {productos.map((p) => <td key={p.id}>{trCat(p.categoriaNombre)}</td>)}
            </tr>
            <tr>
              <td className="k">Stock</td>
              {productos.map((p) => (
                <td key={p.id}>{p.stock > 0 ? `${p.stock} ${tr.compareUnits}` : tr.out}</td>
              ))}
            </tr>
            {claves.map((clave) => (
              <tr key={clave}>
                <td className="k">{etiquetas[clave] ?? clave}</td>
                {productos.map((p) => <td key={p.id}>{mostrar(p.specs?.[clave])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="hf-btn" style={{ marginTop: 20 }} onClick={limpiar}>{tr.compareClear}</button>
    </main>
  );
}
