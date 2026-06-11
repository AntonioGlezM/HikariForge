import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { useCart } from "../context/CartContext";

// Panel lateral del carrito con pestañas Carrito / Vistos recientemente
// y estado vacío con "Seguir comprando".
export default function CartDrawer() {
  const { tr } = useSettings();
  const { items, removeAt, total, recent, open, closeCart, tab, setTab } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && closeCart();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [closeCart]);

  const irCatalogo = () => { closeCart(); navigate("/catalogo"); };

  return (
    <>
      <div className={`hf-backdrop ${open ? "open" : ""}`} onClick={closeCart} />
      <aside className={`hf-drawer ${open ? "open" : ""}`}>
        <div className="hf-drawer-head">
          <div className="hf-drawer-tabs">
            <button className={`tab ${tab === "cart" ? "on" : ""}`} onClick={() => setTab("cart")}>{tr.cartTitle}</button>
            <button className={`tab ${tab === "recent" ? "on" : ""}`} onClick={() => setTab("recent")}>{tr.recentTitle}</button>
          </div>
          <button className="hf-close-round" onClick={closeCart} aria-label="Cerrar"><i className="ti ti-x" /></button>
        </div>

        <div className="hf-cart-items">
          {tab === "recent" ? (
            recent.length ? recent.map((p) => (
              <div key={p.id} className="hf-cart-row">
                <div><div>{p.nombre}</div><div className="p">{p.precio} €</div></div>
              </div>
            )) : <p className="hf-cart-empty">{tr.recentEmpty}</p>
          ) : items.length === 0 ? (
            <div className="hf-cart-emptybox">
              <h4>{tr.emptyTitle}</h4>
              <p>{tr.emptyHint[0]}<br />{tr.emptyHint[1]}</p>
              <button className="hf-continue" onClick={irCatalogo}>
                {tr.continueShopping} <i className="ti ti-arrow-right" />
              </button>
            </div>
          ) : (
            items.map((p, i) => (
              <div key={i} className="hf-cart-row">
                <div><div>{p.nombre}</div><div className="p">{p.precio} €</div></div>
                <button onClick={() => removeAt(i)} aria-label="Quitar"><i className="ti ti-x" /></button>
              </div>
            ))
          )}
        </div>

        {tab === "cart" && items.length > 0 && (
          <div className="hf-cart-foot">
            <div className="hf-cart-total"><span>Total</span><span>{total.toFixed(2)} €</span></div>
            <button className="hf-btn hf-btn-main" style={{ width: "100%" }}>{tr.checkout}</button>
          </div>
        )}
      </aside>
    </>
  );
}
