import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { crearPedido } from "../api/pedidos";
import { precioEfectivo } from "../utils/precio";
import Spinner from "./Spinner";

// Panel lateral del carrito: líneas con selector de cantidad, pestaña de vistos
// recientemente, estado vacío y checkout real contra la API.
export default function CartDrawer() {
  const { tr } = useSettings();
  const { items, cambiarCantidad, quitar, clear, total, recent, open, closeCart, tab, setTab } = useCart();
  const { isAuthenticated } = useAuth();
  const [msg, setMsg] = useState(null);
  const [procesando, setProcesando] = useState(false);   // checkout en curso
  const [confirmarVaciar, setConfirmarVaciar] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && closeCart();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [closeCart]);

  // Al cerrar el carrito, descartamos cualquier confirmación pendiente.
  useEffect(() => { if (!open) setConfirmarVaciar(false); }, [open]);

  const irCatalogo = () => { closeCart(); navigate("/catalogo"); };

  // Checkout: las líneas ya tienen su cantidad; se mandan tal cual a la API.
  const finalizar = async () => {
    setMsg(null);
    if (!isAuthenticated) { closeCart(); navigate("/login"); return; }
    const lineas = items.map((l) => ({ productoId: l.producto.id, cantidad: l.cantidad }));
    setProcesando(true);
    try {
      await crearPedido(lineas);
      clear();
      closeCart();
      navigate("/pedidos");
    } catch (err) {
      setMsg(err.response?.data?.mensaje ?? tr.orderError);
    } finally {
      setProcesando(false);
    }
  };

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
            items.map((l) => (
              <div key={l.producto.id} className="hf-cart-row">
                <div>
                  <div>{l.producto.nombre}</div>
                  <div className="p">{precioEfectivo(l.producto)} € · {(precioEfectivo(l.producto) * l.cantidad).toFixed(2)} €</div>
                </div>
                <div className="hf-qty">
                  <button onClick={() => cambiarCantidad(l.producto.id, -1)} aria-label="Menos"><i className="ti ti-minus" /></button>
                  <b>{l.cantidad}</b>
                  <button onClick={() => cambiarCantidad(l.producto.id, +1)} aria-label="Más"><i className="ti ti-plus" /></button>
                </div>
                <button className="hf-quitar" onClick={() => quitar(l.producto.id)} aria-label="Quitar"><i className="ti ti-x" /></button>
              </div>
            ))
          )}
        </div>

        {tab === "cart" && items.length > 0 && (
          <div className="hf-cart-foot">
            <div className="hf-cart-total"><span>Total</span><span>{total.toFixed(2)} €</span></div>
            {msg && <p className="hf-error" style={{ margin: "0 0 10px" }}>{msg}</p>}
            <button className="hf-btn hf-btn-main" style={{ width: "100%" }} onClick={finalizar} disabled={procesando}>
              {procesando ? <><Spinner /> {tr.checkoutProcessing}</> : (isAuthenticated ? tr.checkout : tr.checkoutLogin)}
            </button>

            {/* Vaciar carrito con confirmación en dos pasos */}
            {confirmarVaciar ? (
              <div className="hf-confirm">
                <span>{tr.clearConfirm}</span>
                <div className="hf-confirm-actions">
                  <button className="hf-confirm-cancel" onClick={() => setConfirmarVaciar(false)}>{tr.cancel}</button>
                  <button className="hf-confirm-ok" onClick={() => { clear(); setConfirmarVaciar(false); }}>{tr.clearYes}</button>
                </div>
              </div>
            ) : (
              <button className="hf-cart-clear" onClick={() => setConfirmarVaciar(true)} disabled={procesando}>
                {tr.clearCart}
              </button>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
