import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { crearPedido } from "../api/pedidos";
import { precioEfectivo } from "../utils/precio";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";

// Checkout (Fase 1): el usuario revisa su pedido y rellena la dirección de
// envío antes de confirmar. El pago llegará en la fase 3 sobre esta misma página.
export default function CheckoutPage() {
  const { tr } = useSettings();
  const { items, total, clear } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Campos del formulario de envío (los obligatorios valida el navegador con required).
  const [envio, setEnvio] = useState({
    destinatario: "", direccion: "", ciudad: "", provincia: "",
    codigoPostal: "", telefono: "", notas: "",
  });
  const [error, setError] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const campo = (k) => (e) => setEnvio((f) => ({ ...f, [k]: e.target.value }));

  const confirmar = async (e) => {
    e.preventDefault();
    setError(null);
    setProcesando(true);
    const lineas = items.map((l) => ({ productoId: l.producto.id, cantidad: l.cantidad }));
    try {
      await crearPedido(lineas, envio);
      clear();
      toast(tr.orderCreated, "package");
      navigate("/pedidos");
    } catch (err) {
      setError(err.response?.data?.mensaje ?? tr.orderError);
      setProcesando(false);
    }
  };

  // Sin artículos no hay nada que pagar: invitamos a volver al catálogo.
  if (items.length === 0) {
    return (
      <main className="hf-wrap hf-section">
        <EmptyState icon="ti-shopping-cart" title={tr.checkoutEmptyTitle} text={tr.checkoutEmptyText}
                    ctaLabel={tr.ctaCatalog} ctaTo="/catalogo" />
      </main>
    );
  }

  return (
    <main className="hf-wrap hf-section">
      <div className="hf-section-head">
        <span className="hf-eyebrow">{tr.checkoutEyebrow}</span>
        <h2 className="hf-h2">{tr.checkoutTitle}</h2>
      </div>

      <form className="hf-checkout" onSubmit={confirmar}>
        {/* Columna izquierda: datos de envío */}
        <section className="hf-co-form">
          <h3><i className="ti ti-truck-delivery" /> {tr.shippingTitle}</h3>
          <div className="hf-co-grid">
            <input className="hf-input wide" placeholder={tr.shipName} value={envio.destinatario}
                   onChange={campo("destinatario")} required maxLength={120} autoComplete="name" />
            <input className="hf-input wide" placeholder={tr.shipAddress} value={envio.direccion}
                   onChange={campo("direccion")} required maxLength={200} autoComplete="street-address" />
            <input className="hf-input" placeholder={tr.shipCity} value={envio.ciudad}
                   onChange={campo("ciudad")} required maxLength={80} autoComplete="address-level2" />
            <input className="hf-input" placeholder={tr.shipProvince} value={envio.provincia}
                   onChange={campo("provincia")} required maxLength={80} autoComplete="address-level1" />
            <input className="hf-input" placeholder={tr.shipZip} value={envio.codigoPostal}
                   onChange={campo("codigoPostal")} required maxLength={10} autoComplete="postal-code"
                   pattern="[0-9]{4,10}" title={tr.shipZipHelp} />
            <input className="hf-input" type="tel" placeholder={tr.shipPhone} value={envio.telefono}
                   onChange={campo("telefono")} required maxLength={20} autoComplete="tel" />
            <textarea className="hf-input wide" placeholder={tr.shipNotes} value={envio.notas}
                      onChange={campo("notas")} maxLength={300} rows={2} />
          </div>
        </section>

        {/* Columna derecha: resumen y confirmación */}
        <aside className="hf-co-summary">
          <h3>{tr.orderSummary}</h3>
          <ul className="hf-co-lines">
            {items.map((l) => (
              <li key={l.producto.id}>
                <span className="n">{l.producto.nombre} ×{l.cantidad}</span>
                <span className="p">{(precioEfectivo(l.producto) * l.cantidad).toFixed(2)} €</span>
              </li>
            ))}
          </ul>
          <div className="hf-co-total"><span>Total</span><span>{total.toFixed(2)} €</span></div>

          {error && <p className="hf-error">{error}</p>}

          <button className="hf-btn hf-btn-main" type="submit" disabled={procesando}>
            {procesando ? <><Spinner /> {tr.checkoutProcessing}</> : tr.confirmOrder}
          </button>
          <p className="hf-co-note"><i className="ti ti-lock" /> {tr.payLater}</p>
          <Link to="/catalogo" className="hf-co-back">{tr.keepShopping}</Link>
        </aside>
      </form>
    </main>
  );
}
