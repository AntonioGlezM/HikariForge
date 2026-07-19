import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { crearPedido } from "../api/pedidos";
import { crearSesionPago } from "../api/pagos";
import { validarCupon } from "../api/cupones";
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
  // Cupón (Fase 5): código escrito, cupón validado y su error propio.
  const [cuponTxt, setCuponTxt] = useState("");
  const [cupon, setCupon] = useState(null);      // { codigo, porcentaje } validado
  const [cuponError, setCuponError] = useState(null);

  const aplicarCupon = async () => {
    setCuponError(null);
    if (!cuponTxt.trim()) return;
    try {
      const { data } = await validarCupon(cuponTxt.trim());
      setCupon(data);
    } catch (err) {
      setCupon(null);
      setCuponError(err.response?.data?.mensaje ?? tr.couponError);
    }
  };

  const campo = (k) => (e) => setEnvio((f) => ({ ...f, [k]: e.target.value }));
  // CP internacional: dígitos y letras (Reino Unido, Países Bajos…), más
  // espacio y guion (Portugal). Se normaliza a mayúsculas al teclear.
  const campoCP = (e) => setEnvio((f) =>
    ({ ...f, codigoPostal: e.target.value.toUpperCase().replace(/[^A-Z0-9\s-]/g, "") }));
  // Teléfono: dígitos, espacios y el "+" del prefijo internacional.
  const campoTel = (e) => setEnvio((f) => ({ ...f, telefono: e.target.value.replace(/[^\d\s+]/g, "") }));

  const confirmar = async (e) => {
    e.preventDefault();
    setError(null);
    setProcesando(true);
    const lineas = items.map((l) => ({ productoId: l.producto.id, cantidad: l.cantidad }));
    try {
      const { data: pedido } = await crearPedido(lineas, { ...envio, cupon: cupon?.codigo ?? null });
      clear();
      // Si Stripe está configurado, vamos directos a la página de pago.
      // Si no (o falla), el pedido queda PENDIENTE y se puede pagar desde Mis pedidos.
      try {
        const { data } = await crearSesionPago(pedido.id);
        // Miga de pan: si el usuario vuelve con el botón atrás del navegador
        // (sin pasar por la URL de cancelación de Stripe), sabremos que hay
        // un pedido creado pendiente de pago y no le enseñaremos el carrito vacío.
        sessionStorage.setItem("pagoEnCurso", pedido.id);
        window.location.href = data.url;
        return;
      } catch {
        toast(tr.orderCreated, "package");
        navigate("/pedidos");
      }
    } catch (err) {
      const data = err.response?.data;
      // Si la API devuelve errores de validación por campo, los mostramos juntos.
      const detalle = data?.errores ? Object.values(data.errores).join(" · ") : null;
      setError(detalle ?? data?.mensaje ?? tr.orderError);
      setProcesando(false);
    }
  };

  // Vuelta con el botón atrás del navegador desde Stripe: el carrito está
  // vacío (el pedido ya existe), así que en vez del carrito vacío llevamos
  // a Mis pedidos con un aviso de que el pedido está pendiente de pago.
  useEffect(() => {
    if (items.length === 0 && sessionStorage.getItem("pagoEnCurso")) {
      sessionStorage.removeItem("pagoEnCurso");
      toast(tr.payPendingBack, "credit-card");
      navigate("/pedidos", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                   onChange={campoCP} required maxLength={10} autoComplete="postal-code"
                   pattern="[A-Za-z0-9][A-Za-z0-9 -]{2,9}" title={tr.shipZipHelp} />
            <input className="hf-input" type="tel" placeholder={tr.shipPhone} value={envio.telefono}
                   onChange={campoTel} required maxLength={20} autoComplete="tel" />
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
          {/* Cupón de descuento */}
          <div className="hf-co-coupon">
            {cupon ? (
              <div className="hf-coupon-ok">
                <span><i className="ti ti-ticket" /> {cupon.codigo} · −{cupon.porcentaje}%</span>
                <button type="button" onClick={() => { setCupon(null); setCuponTxt(""); }}>{tr.couponRemove}</button>
              </div>
            ) : (
              <div className="hf-coupon-row">
                <input className="hf-input" placeholder={tr.couponPh} value={cuponTxt}
                       onChange={(e) => setCuponTxt(e.target.value.toUpperCase())} />
                <button type="button" className="hf-btn" onClick={aplicarCupon}>{tr.couponApply}</button>
              </div>
            )}
            {cuponError && <p className="hf-error" style={{ margin: "6px 0 0" }}>{cuponError}</p>}
          </div>

          {cupon && (
            <div className="hf-co-discount">
              <span>{tr.couponDiscount}</span>
              <span>−{(total * cupon.porcentaje / 100).toFixed(2)} €</span>
            </div>
          )}
          <div className="hf-co-total"><span>Total</span>
            <span>{(cupon ? total * (100 - cupon.porcentaje) / 100 : total).toFixed(2)} €</span>
          </div>

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
