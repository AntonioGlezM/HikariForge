import { Link, useNavigate } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useProductos } from "../context/ProductosContext";

// Cabecera: logo con efecto, mega-menús, idioma, tema, buscador, cuenta y carrito.
export default function Navbar({ onOpenSearch }) {
  const { tr, lang, setLang, theme, toggleTheme } = useSettings();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { items, openCart } = useCart();
  const { productos, categorias } = useProductos();
  const navigate = useNavigate();

  const populares = productos.slice(0, 4);

  return (
    <nav className="hf-nav">
      <Link to="/" className="hf-logo">
        <span className="kanji">光</span><span className="name">HikariForge</span>
      </Link>

      <div className="hf-navlinks">
        {/* Mega-menú de productos: colecciones + más populares */}
        <div className="hf-navitem">
          <span>{tr.navProducts} <i className="ti ti-chevron-down" /></span>
          <div className="hf-mega">
            <div className="hf-mega-grid">
              <div className="hf-mega-left">
                <span className="lbl">{tr.mmLabel}</span>
                {categorias.map((c) => (
                  <Link key={c} to={`/catalogo?cat=${encodeURIComponent(c)}`} className="col">{c}</Link>
                ))}
                <Link to="/catalogo" className="viewall">{tr.mmViewAll} <i className="ti ti-arrow-right" /></Link>
              </div>
              <div>
                <div className="hf-mega-head">
                  <span className="lbl">{tr.mmPopular}</span>
                  <Link to="/catalogo" className="all">{tr.mmAll} · {tr.navProducts} ({productos.length}) <i className="ti ti-arrow-right" /></Link>
                </div>
                <div className="hf-mm-cards">
                  {populares.map((p) => (
                    <Link key={p.id} to={`/producto/${p.id}`} className="hf-mm-card">
                      <div className="th">{p.nombre.split(" ")[0]}</div>
                      <b>{p.nombre}</b>
                      <small>{tr.mmFrom} {p.precio} €</small>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enlaces directos por categoría */}
        {categorias.slice(0, 3).map((c) => (
          <div key={c} className="hf-navitem">
            <Link to={`/catalogo?cat=${encodeURIComponent(c)}`}>{c}</Link>
          </div>
        ))}

        {/* Mega-menú de soporte: tarjetas informativas */}
        <div className="hf-navitem">
          <span>{tr.navSupport} <i className="ti ti-chevron-down" /></span>
          <div className="hf-mega">
            <div className="hf-mega-grid full">
              <div>
                <div className="hf-mega-head"><span className="lbl">{tr.navSupport}</span></div>
                <div className="hf-mm-info">
                  {[["contacto", "ti-mail", tr.ddContact], ["faq", "ti-help-circle", tr.ddFaq], ["garantia", "ti-shield-check", tr.ddWarranty]].map(([id, ic, [titulo, desc]]) => (
                    <Link key={id} to={`/soporte#${id}`}><i className={`ti ${ic}`} /><b>{titulo}</b><small>{desc}</small></Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hf-navicons">
        <div className="hf-lang">
          <button className={lang === "es" ? "on" : ""} onClick={() => setLang("es")}>ES</button>
          <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
        </div>
        <button className="hf-icon-btn" onClick={toggleTheme} aria-label="Tema">
          <i className={`ti ${theme === "dark" ? "ti-sun" : "ti-moon"}`} />
        </button>
        <button className="hf-icon-btn" onClick={onOpenSearch} aria-label="Buscar"><i className="ti ti-search" /></button>
        <button className="hf-icon-btn" onClick={() => (isAuthenticated ? logout() : navigate("/login"))}
                aria-label="Cuenta" title={isAuthenticated ? `${user?.email} · ${tr.logout}` : tr.loginTitle}>
          <i className={`ti ${isAuthenticated ? "ti-logout" : "ti-user"}`} />
        </button>
        {isAdmin && (
          <button className="hf-icon-btn" onClick={() => navigate("/admin")} aria-label="Admin"><i className="ti ti-settings" /></button>
        )}
        <button className="hf-icon-btn" onClick={openCart} aria-label="Carrito">
          <i className="ti ti-shopping-cart" />
          <span className={`hf-cart-badge ${items.length ? "show" : ""}`}>{items.length}</span>
        </button>
      </div>
    </nav>
  );
}
