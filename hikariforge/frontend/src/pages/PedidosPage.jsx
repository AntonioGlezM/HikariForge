import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { misPedidos, cancelarPedido } from "../api/pedidos";
import { crearSesionPago, confirmarPago } from "../api/pagos";
import { useSettings } from "../context/SettingsContext";
import { useToast } from "../context/ToastContext";
import EmptyState from "../components/EmptyState";
import Spinner from "../components/Spinner";

const ESTADOS = ["PENDIENTE", "PAGADO", "ENVIADO", "ENTREGADO"];

// Pedidos del usuario: seguimiento, dirección de envío, detalle y cancelación
// (solo pedidos pendientes, con confirmación y reposición de stock en la API).
export default function PedidosPage() {
  const { tr } = useSettings();
  const { toast } = useToast();
  const [pedidos, setPedidos] = useState(null);
  const [error, setError] = useState(false);
  const [confirmando, setConfirmando] = useState(null); // id del pedido en confirmación
  const [cancelando, setCancelando] = useState(null);   // id del pedido cancelándose
  const [pagando, setPagando] = useState(null);         // id del pedido yendo a Stripe
  const [params, setParams] = useSearchParams();

  useEffect(() => {
    sessionStorage.removeItem("pagoEnCurso"); // ya está viendo sus pedidos
    misPedidos()
      .then(({ data }) => setPedidos(data))
      .catch(() => setError(true));
  }, []);

  // Al volver de Stripe: verificamos la sesión EN EL SERVIDOR y refrescamos.
  useEffect(() => {
    const sessionId = params.get("session_id");
    if (sessionId) {
      confirmarPago(sessionId)
        .then(({ data }) => {
          setPedidos((xs) => (xs ? xs.map((p) => (p.id === data.id ? data : p)) : xs));
          toast(tr.payDone, "circle-check");
        })
        .catch((err) => toast(err.response?.data?.mensaje ?? tr.payError, "alert-triangle"))
        .finally(() => setParams({}, { replace: true })); // limpia la URL
    } else if (params.get("pago") === "cancelado") {
      toast(tr.payCancelled, "circle-x");
      setParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pagar = async (id) => {
    setPagando(id);
    try {
      const { data } = await crearSesionPago(id);
      window.location.href = data.url; // a la página de pago de Stripe
    } catch (err) {
      toast(err.response?.data?.mensaje ?? tr.payError, "alert-triangle");
      setPagando(null);
    }
  };

  const cancelar = async (id) => {
    setCancelando(id);
    try {
      const { data } = await cancelarPedido(id);
      // Sustituimos el pedido por su versión cancelada, sin recargar la lista.
      setPedidos((xs) => xs.map((p) => (p.id === id ? data : p)));
      toast(tr.orderCancelled, "circle-x");
    } catch (err) {
      toast(err.response?.data?.mensaje ?? tr.orderCancelError, "alert-triangle");
    } finally {
      setCancelando(null);
      setConfirmando(null);
    }
  };

  if (error) return <main className="hf-wrap hf-section"><p className="hf-error">{tr.loadError}</p></main>;
  if (!pedidos) return <main className="hf-wrap hf-section"><p className="hf-sub">{tr.loading}</p></main>;

  return (
    <main className="hf-wrap hf-section">
      <div className="hf-section-head">
        <span className="hf-eyebrow">{tr.accOrders}</span>
        <h2 className="hf-h2">{tr.ordersTitle}</h2>
      </div>

      {pedidos.length === 0 && (
        <EmptyState icon="ti-package" title={tr.ordersEmptyTitle} text={tr.ordersEmpty}
                    ctaLabel={tr.ctaCatalog} ctaTo="/catalogo" />
      )}

      <div className="hf-support">
        {pedidos.map((p) => {
          const cancelado = p.estado === "CANCELADO";
          const paso = ESTADOS.indexOf(p.estado); // fase actual del seguimiento
          return (
            <section key={p.id} className="hf-sup-card">
              <div className="hf-order-head">
                <h3><i className="ti ti-package" />{tr.orderNum} #{p.id.slice(0, 8)}</h3>
                <span className="hf-order-date">{new Date(p.fecha).toLocaleString()}</span>
              </div>

              {/* Cancelado: insignia en lugar del seguimiento */}
              {cancelado ? (
                <div className="hf-order-cancelled">
                  <i className="ti ti-circle-x" /> {tr.orderCancelledBadge}
                </div>
              ) : (
                <div className="hf-track">
                  {tr.orderSteps.map((etiqueta, i) => (
                    <div key={etiqueta} className={`hf-track-step ${i <= paso ? "done" : ""}`}>
                      <span className="dot"><i className={`ti ${i <= paso ? "ti-check" : "ti-point"}`} /></span>
                      <small>{etiqueta}</small>
                    </div>
                  ))}
                </div>
              )}

              {/* Dirección de envío en vertical (los pedidos antiguos pueden no tenerla) */}
              {p.destinatario && (
                <div className="hf-order-ship">
                  <div className="hf-ship-head"><i className="ti ti-map-pin" /> {tr.shipTo}</div>
                  <div className="hf-ship-lines">
                    <span>{p.destinatario}</span>
                    <span>{p.direccion}</span>
                    <span>{p.codigoPostal} {p.ciudad}, {p.provincia}</span>
                    <span>{p.telefono}</span>
                    {p.notas && <em>“{p.notas}”</em>}
                  </div>
                </div>
              )}

              {/* Líneas del pedido */}
              <div className="hf-order-lines">
                {p.lineas.map((l, i) => (
                  <div key={i} className="hf-cart-row">
                    <div><div>{l.productoNombre}</div><div className="p">{l.cantidad} × {l.precioUnitario} €</div></div>
                    <b>{(l.cantidad * l.precioUnitario).toFixed(2)} €</b>
                  </div>
                ))}
              </div>
              <div className="hf-cart-total" style={{ marginTop: 14 }}>
                <span>{tr.orderTotal}</span><span>{Number(p.total).toFixed(2)} €</span>
              </div>

              {/* Pago: solo pedidos pendientes */}
              {p.estado === "PENDIENTE" && (
                <button className="hf-btn hf-btn-main hf-order-pay" onClick={() => pagar(p.id)}
                        disabled={pagando === p.id}>
                  {pagando === p.id ? <><Spinner /> {tr.payRedirect}</> : <><i className="ti ti-credit-card" /> {tr.payNow}</>}
                </button>
              )}

              {/* Cancelación: solo pedidos pendientes, confirmación en dos pasos */}
              {p.estado === "PENDIENTE" && (
                confirmando === p.id ? (
                  <div className="hf-confirm">
                    <span>{tr.orderCancelConfirm}</span>
                    <div className="hf-confirm-actions">
                      <button className="hf-confirm-cancel" onClick={() => setConfirmando(null)}>{tr.cancel}</button>
                      <button className="hf-confirm-ok" onClick={() => cancelar(p.id)} disabled={cancelando === p.id}>
                        {cancelando === p.id ? <Spinner size={13} /> : tr.orderCancelYes}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button className="hf-order-cancel-btn" onClick={() => setConfirmando(p.id)}>
                    {tr.orderCancelBtn}
                  </button>
                )
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}
