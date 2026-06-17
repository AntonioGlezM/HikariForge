import { useEffect, useState } from "react";
import { useSettings } from "../context/SettingsContext";
import { useAuth } from "../context/AuthContext";
import { obtenerValoraciones, enviarValoracion, borrarValoracion } from "../api/valoraciones";
import Stars from "./Stars";

/**
 * Bloque de valoraciones de la ficha de producto: cabecera con nota media,
 * formulario para que el usuario deje o edite la suya, y la lista de reseñas.
 * La regla de "solo quien compró puede valorar" la aplica el backend; aquí solo
 * mostramos el mensaje si la rechaza.
 */
export default function Reviews({ productoId }) {
  const { tr } = useSettings();
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState(null);     // { media, total, valoraciones }
  const [estrellas, setEstrellas] = useState(0);
  const [comentario, setComentario] = useState("");
  const [aviso, setAviso] = useState(null);

  const cargar = () =>
    obtenerValoraciones(productoId).then(({ data }) => {
      setData(data);
      // Si el usuario ya tiene reseña, precargamos el formulario para editarla.
      const mia = data.valoraciones.find((v) => v.mia);
      if (mia) { setEstrellas(mia.estrellas); setComentario(mia.comentario ?? ""); }
    });

  useEffect(() => { cargar(); }, [productoId]); // eslint-disable-line

  const miReseña = data?.valoraciones.find((v) => v.mia);

  const enviar = async () => {
    setAviso(null);
    if (estrellas < 1) return;
    try {
      await enviarValoracion(productoId, { estrellas, comentario: comentario || null });
      setAviso({ ok: true, texto: tr.reviewThanks });
      cargar();
    } catch (err) {
      const msg = err.response?.status === 400 ? tr.reviewMustBuy
                : err.response?.data?.mensaje ?? tr.loadError;
      setAviso({ ok: false, texto: msg });
    }
  };

  const borrar = async () => {
    if (!miReseña) return;
    await borrarValoracion(miReseña.id);
    setEstrellas(0); setComentario(""); setAviso(null);
    cargar();
  };

  if (!data) return null;

  return (
    <section className="hf-reviews">
      <div className="hf-reviews-head">
        <h2 className="hf-h2">{tr.reviewsTitle}</h2>
        {data.total > 0 && (
          <div className="resumen">
            <Stars value={data.media} size="1.3rem" />
            <b>{tr.reviewsAvg.replace("{n}", data.media)}</b>
            <span className="hf-sub">· {tr.reviewsCount.replace("{n}", data.total)}</span>
          </div>
        )}
      </div>

      {/* Formulario: solo con sesión. El backend valida la compra al enviar. */}
      {isAuthenticated ? (
        <div className="hf-review-form">
          <span className="lbl">{miReseña ? tr.reviewEdit : tr.reviewWrite}</span>
          <Stars value={estrellas} onRate={setEstrellas} size="1.6rem" />
          <textarea className="hf-input" rows="2" placeholder={tr.reviewPlaceholder}
                    value={comentario} onChange={(e) => setComentario(e.target.value)} />
          <div className="acciones">
            <button className="hf-btn hf-btn-main" onClick={enviar} disabled={estrellas < 1}>
              {miReseña ? tr.reviewUpdate : tr.reviewSend}
            </button>
            {miReseña && <button className="hf-btn" onClick={borrar}>{tr.reviewDelete}</button>}
          </div>
          {aviso && <p className={aviso.ok ? "hf-ok" : "hf-error"}>{aviso.texto}</p>}
        </div>
      ) : (
        <p className="hf-sub">{tr.reviewLoginNeeded}</p>
      )}

      {/* Lista de reseñas */}
      {data.total === 0 ? (
        <p className="hf-sub">{tr.reviewsNone}</p>
      ) : (
        <div className="hf-review-list">
          {data.valoraciones.map((v) => (
            <article key={v.id} className={`hf-review ${v.mia ? "mine" : ""}`}>
              <div className="top">
                <span className="autor">{v.autor}{v.mia && <em> · {tr.reviewMine}</em>}</span>
                <Stars value={v.estrellas} />
              </div>
              {v.comentario && <p>{v.comentario}</p>}
              <span className="fecha">{new Date(v.fecha).toLocaleDateString()}</span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
