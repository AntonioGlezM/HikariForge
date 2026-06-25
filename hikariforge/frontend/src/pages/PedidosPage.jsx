import { useEffect, useState } from "react";
import { misPedidos } from "../api/pedidos";
import { useSettings } from "../context/SettingsContext";
import EmptyState from "../components/EmptyState";

const ESTADOS = ["PENDIENTE", "PAGADO", "ENVIADO", "ENTREGADO"];

// Pedidos del usuario con su línea de seguimiento y el detalle de cada uno.
export default function PedidosPage() {
  const { tr } = useSettings();
  const [pedidos, setPedidos] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    misPedidos()
      .then(({ data }) => setPedidos(data))
      .catch(() => setError(true));
  }, []);

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
          const paso = ESTADOS.indexOf(p.estado); // fase actual del seguimiento
          return (
            <section key={p.id} className="hf-sup-card">
              <div className="hf-order-head">
                <h3><i className="ti ti-package" />{tr.orderNum} #{p.id.slice(0, 8)}</h3>
                <span className="hf-order-date">{new Date(p.fecha).toLocaleString()}</span>
              </div>

              {/* Seguimiento del pedido */}
              <div className="hf-track">
                {tr.orderSteps.map((etiqueta, i) => (
                  <div key={etiqueta} className={`hf-track-step ${i <= paso ? "done" : ""}`}>
                    <span className="dot"><i className={`ti ${i <= paso ? "ti-check" : "ti-point"}`} /></span>
                    <small>{etiqueta}</small>
                  </div>
                ))}
              </div>

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
            </section>
          );
        })}
      </div>
    </main>
  );
}
