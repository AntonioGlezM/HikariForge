import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { useProductos } from "../context/ProductosContext";

export default function Footer() {
  const { tr, trCat } = useSettings();
  const { categorias } = useProductos();

  return (
    <footer className="hf-footer">
      <div className="hf-wrap">
        <div className="hf-footcols">
          <div>
            <div className="hf-logo" style={{ fontSize: "1.35rem" }}>
              <span className="kanji" style={{ fontSize: "1.5rem" }}>光</span>
              <span className="name">HikariForge</span>
            </div>
            <p style={{ marginTop: 12 }}>{tr.footTag}</p>
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
            <h5>{tr.footFollow}</h5>
            <a href="#">X (Twitter)</a><a href="#">Instagram</a><a href="#">YouTube</a><a href="#">Discord</a>
          </div>
        </div>
        <div className="hf-foot-bottom">
          <span>© 2026 HikariForge</span>
          <div className="hf-pay">
            <i className="ti ti-brand-visa" /><i className="ti ti-brand-mastercard" />
            <i className="ti ti-brand-paypal" /><i className="ti ti-brand-apple" />
          </div>
        </div>
      </div>
    </footer>
  );
}
