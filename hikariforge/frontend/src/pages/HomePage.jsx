import { Link, useNavigate } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { useProductos } from "../context/ProductosContext";

// Home: hero oscuro que se tapa al hacer scroll + bloques promocionales
// (uno por producto destacado, con enlace compacto a su ficha) + comunidad.
export default function HomePage() {
  const { tr } = useSettings();
  const { productos } = useProductos();
  const navigate = useNavigate();

  // Las promos del home son los 3 primeros productos del catálogo real.
  const destacados = productos.slice(0, 3);

  return (
    <main className="hf-stack">
      <section className="hf-hero">
        <div className="hf-wrap">
          <span className="badge"><i className="ti ti-sparkles" /> {tr.heroBadge}</span>
          <h1>{tr.heroTitle[0]}<em>{tr.heroTitle[1]}</em></h1>
          <p>{tr.heroSub}</p>
          <div className="hf-hero-ctas">
            <button className="hf-btn hf-btn-main" onClick={() => navigate("/catalogo")}>{tr.ctaCatalog}</button>
            <button className="hf-btn hf-btn-ghost" onClick={() => navigate("/catalogo")}>{tr.ctaNew}</button>
          </div>
        </div>
        <i className="ti ti-chevron-down scroll-hint" />
      </section>

      {/* Lámina que cubre el hero; a partir de aquí scroll normal */}
      <div className="hf-rest">
        {destacados.map((p, i) => (
          <section key={p.id} className={`hf-promo ${i % 2 ? "alt" : ""}`}>
            <div className="hf-wrap">
              <div className="hf-promo-banner">
                <div className="hf-promo-copy">
                  <span className="hf-promo-kicker"><i className="ti ti-sparkles" />{tr.promoKickers[i]}</span>
                  <h2>{p.nombre}</h2>
                  <p>{tr.promoTexts[i]}</p>
                  <div className="hf-promo-points">
                    {tr.promoPoints.map(([ic, x]) => (
                      <span key={x}><i className={`ti ${ic}`} />{x}</span>
                    ))}
                  </div>
                  <Link to={`/producto/${p.id}`} className="hf-promo-link">
                    <span className="lbl">{tr.seeProduct}</span>
                    <b>{p.nombre}</b>
                    <span className="pr">{p.precio} €</span>
                    <i className="ti ti-arrow-right" />
                  </Link>
                </div>
                <div className="hf-promo-visual">
                  <span className="big">{p.nombre.split(" ")[0].toUpperCase()}</span>
                  <span className="chip"><b>{p.categoriaNombre}</b> · {p.marca ?? "HikariForge"}</span>
                </div>
              </div>
            </div>
          </section>
        ))}

        <section className="hf-section">
          <div className="hf-wrap">
            <div className="hf-community">
              <div className="ic"><i className="ti ti-brand-discord" /></div>
              <h2>{tr.commTitle}</h2>
              <p>{tr.commSub}</p>
              <button className="hf-btn hf-btn-main">{tr.commCta}</button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
