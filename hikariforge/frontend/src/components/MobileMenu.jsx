import { Link, useNavigate } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { useProductos } from "../context/ProductosContext";
import { useAuth } from "../context/AuthContext";

// Menú de navegación móvil: panel lateral con categorías, catálogo completo,
// soporte y accesos de cuenta. Sustituye a los enlaces del navbar en pantallas
// pequeñas (donde se ocultan por espacio).
export default function MobileMenu({ open, onClose }) {
  const { tr, trCat } = useSettings();
  const { categorias } = useProductos();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const ir = (ruta) => { onClose(); navigate(ruta); };

  return (
    <>
      <div className={`hf-backdrop ${open ? "open" : ""}`} onClick={onClose} />
      <aside className={`hf-mobile-menu ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="hf-mm-head">
          <b>{tr.menuTitle}</b>
          <button className="hf-close-round" onClick={onClose} aria-label="Cerrar"><i className="ti ti-x" /></button>
        </div>

        <nav className="hf-mm-nav">
          <span className="lbl">{tr.navProducts}</span>
          {categorias.map((c) => (
            <button key={c} onClick={() => ir(`/catalogo?cat=${encodeURIComponent(c)}`)}>
              {trCat(c)} <i className="ti ti-chevron-right" />
            </button>
          ))}
          <button className="destacado" onClick={() => ir("/catalogo")}>
            {tr.mmViewAll} <i className="ti ti-arrow-right" />
          </button>

          <span className="lbl">{tr.navSupport}</span>
          <button onClick={() => ir("/soporte#contacto")}>{tr.footContact} <i className="ti ti-chevron-right" /></button>
          <button onClick={() => ir("/soporte#faq")}>{tr.footFaq} <i className="ti ti-chevron-right" /></button>
          <button onClick={() => ir("/soporte#garantia")}>{tr.footWarranty} <i className="ti ti-chevron-right" /></button>

          <span className="lbl">{tr.accTitle}</span>
          {isAuthenticated ? (
            <>
              <button onClick={() => ir("/perfil")}>{tr.accProfile} <i className="ti ti-chevron-right" /></button>
              <button onClick={() => ir("/pedidos")}>{tr.accOrders} <i className="ti ti-chevron-right" /></button>
              <button onClick={() => ir("/favoritos")}>{tr.accFavs} <i className="ti ti-chevron-right" /></button>
            </>
          ) : (
            <button className="destacado" onClick={() => ir("/login")}>{tr.loginBtn} <i className="ti ti-arrow-right" /></button>
          )}
        </nav>
      </aside>
    </>
  );
}
