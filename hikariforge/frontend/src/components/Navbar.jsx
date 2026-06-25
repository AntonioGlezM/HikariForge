import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { I18N } from "../i18n/translations";
import { useSettings } from "../context/SettingsContext";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useProductos } from "../context/ProductosContext";
import logoHorizontal from "../assets/logo-horizontal.svg";

// Cabecera: logo con efecto, mega-menús, idioma, tema, buscador, cuenta y carrito.
export default function Navbar({ onOpenSearch }) {
  const { tr, trCat, lang, setLang, theme, toggleTheme } = useSettings();
  const [langOpen, setLangOpen] = useState(false);
  const [accOpen, setAccOpen] = useState(false);
  const langRef = useRef(null);
  const accRef = useRef(null);

  // Cierra los desplegables (idioma y cuenta) al hacer clic fuera.
  useEffect(() => {
    const fuera = (e) => {
      if (!langRef.current?.contains(e.target)) setLangOpen(false);
      if (!accRef.current?.contains(e.target)) setAccOpen(false);
    };
    document.addEventListener("mousedown", fuera);
    return () => document.removeEventListener("mousedown", fuera);
  }, []);
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { unidades, openCart } = useCart();
  const { productos, categorias } = useProductos();
  const navigate = useNavigate();

  const populares = productos.slice(0, 4);

  // Cierra el mega-menú al pulsar un enlace: el menú se abre por :hover (CSS),
  // así que al navegar quedaría visible hasta mover el ratón. Marcamos el navitem
  // como "cerrado" temporalmente; al salir el ratón (onMouseLeave) se reactiva el hover.
  const [megaCerrado, setMegaCerrado] = useState(false);
  const cerrarMega = () => setMegaCerrado(true);
  const reactivarMega = () => setMegaCerrado(false);

  return (
    <nav className="hf-nav">
      <Link to="/" className="hf-logo">
        <img src={logoHorizontal} alt="HikariForge" className="hf-logo-img" />
      </Link>

      <div className="hf-navlinks">
        {/* Mega-menú de productos: colecciones + más populares */}
        <div className={`hf-navitem ${megaCerrado ? "mega-cerrado" : ""}`} onMouseLeave={reactivarMega}>
          <span>{tr.navProducts} <i className="ti ti-chevron-down" /></span>
          <div className="hf-mega">
            <div className="hf-mega-grid">
              <div className="hf-mega-left">
                <span className="lbl">{tr.mmLabel}</span>
                {categorias.map((c) => (
                  <Link key={c} to={`/catalogo?cat=${encodeURIComponent(c)}`} className="col" onClick={cerrarMega}>{trCat(c)}</Link>
                ))}
                <Link to="/catalogo" className="viewall" onClick={cerrarMega}>{tr.mmViewAll} <i className="ti ti-arrow-right" /></Link>
              </div>
              <div>
                <div className="hf-mega-head">
                  <span className="lbl">{tr.mmPopular}</span>
                  <Link to="/catalogo" className="all" onClick={cerrarMega}>{tr.mmAll} · {tr.navProducts} ({productos.length}) <i className="ti ti-arrow-right" /></Link>
                </div>
                <div className="hf-mm-cards">
                  {populares.map((p) => (
                    <Link key={p.id} to={`/producto/${p.id}`} className="hf-mm-card" onClick={cerrarMega}>
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
            <Link to={`/catalogo?cat=${encodeURIComponent(c)}`}>{trCat(c)}</Link>
          </div>
        ))}

        {/* Mega-menú de soporte: tarjetas informativas */}
        <div className={`hf-navitem ${megaCerrado ? "mega-cerrado" : ""}`} onMouseLeave={reactivarMega}>
          <span>{tr.navSupport} <i className="ti ti-chevron-down" /></span>
          <div className="hf-mega">
            <div className="hf-mega-grid full">
              <div>
                <div className="hf-mega-head"><span className="lbl">{tr.navSupport}</span></div>
                <div className="hf-mm-info">
                  {[["contacto", "ti-mail", tr.ddContact], ["faq", "ti-help-circle", tr.ddFaq], ["garantia", "ti-shield-check", tr.ddWarranty]].map(([id, ic, [titulo, desc]]) => (
                    <Link key={id} to={`/soporte#${id}`} onClick={cerrarMega}><i className={`ti ${ic}`} /><b>{titulo}</b><small>{desc}</small></Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hf-navicons">
        <div className="hf-langsel" ref={langRef}>
          <button className="hf-lang-btn" onClick={() => setLangOpen((o) => !o)}>
            <img className="flag-img" src={`https://flagcdn.com/w40/${tr.flag}.png`} alt="" /> {lang.toUpperCase()} <i className="ti ti-chevron-down" />
          </button>
          <div className={`hf-lang-menu ${langOpen ? "open" : ""}`}>
            {Object.keys(I18N).filter((k) => k !== lang).map((k) => (
              <button key={k} onClick={() => { setLang(k); setLangOpen(false); }}>
                <img className="flag-img" src={`https://flagcdn.com/w40/${I18N[k].flag}.png`} alt="" /> {k.toUpperCase()} · {I18N[k].langName}
              </button>
            ))}
          </div>
        </div>
        <button className="hf-icon-btn" onClick={toggleTheme} aria-label="Tema">
          <i className={`ti ${theme === "dark" ? "ti-sun" : "ti-moon"}`} />
        </button>
        <button className="hf-icon-btn" onClick={onOpenSearch} aria-label="Buscar"><i className="ti ti-search" /></button>
        {isAuthenticated ? (
          <div className="hf-accsel" ref={accRef}>
            <button className="hf-acc-btn" onClick={() => setAccOpen((o) => !o)} aria-label="Cuenta">
              {(user?.email ?? "?").charAt(0).toUpperCase()}
            </button>
            <div className={`hf-acc-menu ${accOpen ? "open" : ""}`}>
              <div className="who">{user?.email}</div>
              <button onClick={() => { setAccOpen(false); navigate("/perfil"); }}><i className="ti ti-user" />{tr.accProfile}</button>
              <button onClick={() => { setAccOpen(false); navigate("/pedidos"); }}><i className="ti ti-package" />{tr.accOrders}</button>
              <button onClick={() => { setAccOpen(false); navigate("/favoritos"); }}><i className="ti ti-heart" />{tr.accFavs}</button>
              {isAdmin && (
                <button onClick={() => { setAccOpen(false); navigate("/admin"); }}><i className="ti ti-settings" />Admin</button>
              )}
              <div className="sep" />
              <button className="out" onClick={() => { setAccOpen(false); logout(); navigate("/"); }}><i className="ti ti-logout" />{tr.logout}</button>
            </div>
          </div>
        ) : (
          <button className="hf-icon-btn" onClick={() => navigate("/login")} aria-label="Cuenta" title={tr.loginTitle}>
            <i className="ti ti-user" />
          </button>
        )}
        <button className="hf-icon-btn" onClick={openCart} aria-label="Carrito">
          <i className="ti ti-shopping-cart" />
          <span className={`hf-cart-badge ${unidades ? "show" : ""}`}>{unidades}</span>
        </button>
      </div>
    </nav>
  );
}
