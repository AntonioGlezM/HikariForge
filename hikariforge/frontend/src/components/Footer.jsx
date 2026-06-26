import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { useProductos } from "../context/ProductosContext";
import logoHielo from "../assets/logo-horizontal-hielo.svg";

// Footer estilo tienda: franja de garantías arriba + cuerpo oscuro (siempre, en
// ambos temas) con columnas de enlaces, redes y barra inferior con pagos.
export default function Footer() {
  const { tr, trCat } = useSettings();
  const { categorias } = useProductos();

  // Ventajas de la franja superior (icono Tabler + título + texto)
  const ventajas = [
    ["ti-headset", tr.footPerk1, tr.footPerk1Sub],
    ["ti-truck", tr.footPerk2, tr.footPerk2Sub],
    ["ti-shield-check", tr.footPerk3, tr.footPerk3Sub],
    ["ti-credit-card", tr.footPerk4, tr.footPerk4Sub],
  ];

  return (
    <footer className="hf-footer">
      {/* Franja de garantías/ventajas */}
      <div className="hf-foot-perks">
        <div className="hf-wrap">
          <div className="hf-perks-grid">
            {ventajas.map(([ic, t, s]) => (
              <div key={t} className="hf-perk">
                <i className={`ti ${ic}`} />
                <div><strong>{t}</strong><span>{s}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cuerpo oscuro */}
      <div className="hf-foot-main">
        <div className="hf-wrap">
          <div className="hf-footcols">
            <div className="hf-foot-brand">
              <img src={logoHielo} alt="HikariForge" className="hf-logo-img foot" />
              <p>{tr.footTag}</p>
              <div className="hf-foot-social">
                <a href="#" aria-label="X (Twitter)"><i className="ti ti-brand-x" /></a>
                <a href="#" aria-label="Instagram"><i className="ti ti-brand-instagram" /></a>
                <a href="#" aria-label="YouTube"><i className="ti ti-brand-youtube" /></a>
                <a href="#" aria-label="TikTok"><i className="ti ti-brand-tiktok" /></a>
                <a href="#" aria-label="Discord"><i className="ti ti-brand-discord" /></a>
              </div>
            </div>
            <div>
              <h5>{tr.footProducts}</h5>
              {categorias.map((c) => (
                <Link key={c} to={`/catalogo?cat=${encodeURIComponent(c)}`}>{trCat(c)}</Link>
              ))}
            </div>
            <div>
              <h5>{tr.footSupport}</h5>
              <Link to="/soporte#contacto">{tr.footContact}</Link>
              <Link to="/soporte#faq">{tr.footFaq}</Link>
              <Link to="/soporte#garantia">{tr.footWarranty}</Link>
              <Link to="/soporte#faq">{tr.footShipping}</Link>
            </div>
            <div>
              <h5>{tr.footExplore}</h5>
              <Link to="/catalogo">{tr.navCatalog}</Link>
              <Link to="/soporte">{tr.navSupport}</Link>
              <a href="#">{tr.footNews}</a>
            </div>
            <div>
              <h5>{tr.footFollow}</h5>
              <a href="#">X (Twitter)</a><a href="#">Instagram</a>
              <a href="#">YouTube</a><a href="#">Discord</a>
            </div>
          </div>
          <div className="hf-foot-bottom">
            <span>© 2026 HikariForge · {tr.footRights}</span>
            <div className="hf-pay">
              <i className="ti ti-brand-visa" /><i className="ti ti-brand-mastercard" />
              <i className="ti ti-brand-paypal" /><i className="ti ti-brand-apple" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
