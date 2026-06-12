import { useEffect, useMemo, useState } from "react";
import { listarProductosAdmin, crearProducto, actualizarProducto, eliminarProducto, reactivarProducto } from "../api/productos";
import { listarCategorias } from "../api/categorias";
import { todosPedidos, cambiarEstadoPedido } from "../api/pedidos";
import { useSettings } from "../context/SettingsContext";

const ESTADOS = ["PENDIENTE", "PAGADO", "ENVIADO", "ENTREGADO"];
const STOCK_BAJO = 5;
const FORM_VACIO = { nombre: "", descripcion: "", marca: "", precio: "", stock: "", imagenUrl: "", categoriaId: "" };

// Zona de administración: gestión del catálogo (crear/editar/borrar, stock)
// y gestión de pedidos (avanzar el estado del seguimiento).
export default function AdminPage() {
  const { tr, trCat } = useSettings();
  const [pestana, setPestana] = useState("productos");

  /* ===== Productos ===== */
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [form, setForm] = useState(null);      // null = formulario cerrado
  const [editandoId, setEditandoId] = useState(null);
  const [msg, setMsg] = useState(null);

  const cargarProductos = () =>
    listarProductosAdmin({ page: 0, size: 100 }).then(({ data }) => setProductos(data.content));

  useEffect(() => {
    cargarProductos();
    listarCategorias().then(({ data }) => setCategorias(data));
  }, []);

  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    return q ? productos.filter((p) => p.nombre.toLowerCase().includes(q)) : productos;
  }, [productos, busqueda]);

  const abrirNuevo = () => { setForm(FORM_VACIO); setEditandoId(null); setMsg(null); };
  const abrirEditar = (p) => {
    setForm({ nombre: p.nombre, descripcion: p.descripcion ?? "", marca: p.marca ?? "",
              precio: p.precio, stock: p.stock, imagenUrl: p.imagenUrl ?? "", categoriaId: p.categoriaId });
    setEditandoId(p.id);
    setMsg(null);
  };

  const guardar = async (e) => {
    e.preventDefault();
    setMsg(null);
    const cuerpo = { ...form, precio: Number(form.precio), stock: Number(form.stock),
                     imagenUrl: form.imagenUrl || null, descripcion: form.descripcion || null, marca: form.marca || null };
    try {
      if (editandoId) await actualizarProducto(editandoId, cuerpo);
      else await crearProducto(cuerpo);
      setForm(null);
      setMsg({ ok: true, texto: tr.admSaved });
      cargarProductos();
    } catch (err) {
      setMsg({ ok: false, texto: err.response?.data?.mensaje ?? tr.loadError });
    }
  };

  // "Eliminar" = borrado lógico: retira el producto de la venta.
  const retirar = async (p) => {
    if (!window.confirm(`${tr.admDeleteConfirm} (${p.nombre})`)) return;
    try {
      await eliminarProducto(p.id);
      setMsg({ ok: true, texto: tr.admDeleted });
      cargarProductos();
    } catch (err) {
      setMsg({ ok: false, texto: err.response?.data?.mensaje ?? tr.loadError });
    }
  };

  const reactivar = async (p) => {
    try {
      await reactivarProducto(p.id);
      setMsg({ ok: true, texto: tr.admRestored });
      cargarProductos();
    } catch (err) {
      setMsg({ ok: false, texto: err.response?.data?.mensaje ?? tr.loadError });
    }
  };

  const campo = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  /* ===== Pedidos ===== */
  const [pedidos, setPedidos] = useState([]);

  const cargarPedidos = () => todosPedidos().then(({ data }) => setPedidos(data));
  useEffect(() => { if (pestana === "pedidos") cargarPedidos(); }, [pestana]);

  // Avanza el pedido a la siguiente fase del seguimiento.
  const avanzar = async (p) => {
    const siguiente = ESTADOS[Math.min(ESTADOS.indexOf(p.estado) + 1, ESTADOS.length - 1)];
    await cambiarEstadoPedido(p.id, siguiente);
    cargarPedidos();
  };

  return (
    <main className="hf-wrap hf-section">
      <div className="hf-section-head">
        <span className="hf-eyebrow">{tr.adminTitle}</span>
        <h2 className="hf-h2">{tr.adminTitle}</h2>
      </div>

      {/* Pestañas */}
      <div className="hf-adm-tabs">
        <button className={pestana === "productos" ? "on" : ""} onClick={() => setPestana("productos")}>
          <i className="ti ti-box" /> {tr.admProducts}
        </button>
        <button className={pestana === "pedidos" ? "on" : ""} onClick={() => setPestana("pedidos")}>
          <i className="ti ti-package" /> {tr.admOrders}
        </button>
      </div>

      {pestana === "productos" && (
        <>
          <div className="hf-adm-bar">
            <input className="hf-input" placeholder={tr.admSearch} value={busqueda}
                   onChange={(e) => setBusqueda(e.target.value)} />
            <button className="hf-btn hf-btn-main" onClick={abrirNuevo}>
              <i className="ti ti-plus" /> {tr.admNew}
            </button>
          </div>

          {msg && <p className={msg.ok ? "hf-ok" : "hf-error"}>{msg.texto}</p>}

          {/* Formulario de creación/edición */}
          {form && (
            <form className="hf-sup-card hf-adm-form" onSubmit={guardar}>
              <h3><i className={`ti ${editandoId ? "ti-pencil" : "ti-plus"}`} />{editandoId ? tr.admEdit : tr.admNew}</h3>
              <div className="grid">
                <input className="hf-input" placeholder={tr.admName} value={form.nombre} onChange={campo("nombre")} required />
                <input className="hf-input" placeholder={tr.admBrand} value={form.marca} onChange={campo("marca")} />
                <input className="hf-input" type="number" step="0.01" min="0.01" placeholder={tr.admPrice}
                       value={form.precio} onChange={campo("precio")} required />
                <input className="hf-input" type="number" min="0" placeholder={tr.admStock}
                       value={form.stock} onChange={campo("stock")} required />
                <select className="hf-input" value={form.categoriaId} onChange={campo("categoriaId")} required>
                  <option value="" disabled>{tr.admCat}</option>
                  {categorias.map((c) => <option key={c.id} value={c.id}>{trCat(c.nombre)}</option>)}
                </select>
                <input className="hf-input" placeholder={tr.admImage} value={form.imagenUrl} onChange={campo("imagenUrl")} />
              </div>
              <textarea className="hf-input" rows="2" placeholder={tr.admDesc}
                        value={form.descripcion} onChange={campo("descripcion")} />
              <div className="acciones">
                <button className="hf-btn hf-btn-main" type="submit">{tr.admSave}</button>
                <button className="hf-btn" type="button" onClick={() => setForm(null)}>{tr.admCancel}</button>
              </div>
            </form>
          )}

          {/* Tabla del catálogo */}
          <div className="hf-adm-table">
            <div className="row head">
              <span>{tr.admName}</span><span>{tr.admCat}</span><span>{tr.admBrand}</span>
              <span>{tr.admPrice}</span><span>{tr.admStock}</span><span />
            </div>
            {filtrados.map((p) => (
              <div key={p.id} className={`row ${p.activo === false ? "inactive" : ""}`}>
                <span className="nom">
                  {p.nombre}
                  {p.activo === false && <em className="hf-badge-off">{tr.admInactive}</em>}
                </span>
                <span>{trCat(p.categoriaNombre)}</span>
                <span>{p.marca ?? "—"}</span>
                <span>{p.precio} €</span>
                <span className={p.stock <= STOCK_BAJO ? "low" : ""}>
                  {p.stock}{p.stock <= STOCK_BAJO && <small> · {tr.admLow}</small>}
                </span>
                <span className="acts">
                  <button onClick={() => abrirEditar(p)} aria-label="Editar"><i className="ti ti-pencil" /></button>
                  {p.activo === false ? (
                    <button className="res" onClick={() => reactivar(p)} title={tr.admRestore} aria-label="Reactivar"><i className="ti ti-restore" /></button>
                  ) : (
                    <button className="del" onClick={() => retirar(p)} aria-label="Retirar"><i className="ti ti-trash" /></button>
                  )}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {pestana === "pedidos" && (
        <div className="hf-support">
          {pedidos.length === 0 && <p className="hf-sub">{tr.ordersEmpty}</p>}
          {pedidos.map((p) => (
            <section key={p.id} className="hf-sup-card">
              <div className="hf-order-head">
                <h3><i className="ti ti-package" />{tr.orderNum} #{p.id.slice(0, 8)}</h3>
                <span className="hf-order-date">{new Date(p.fecha).toLocaleString()}</span>
              </div>
              <p className="hf-sub" style={{ margin: "4px 0 12px" }}>
                {tr.admClient}: <b>{p.clienteEmail}</b> · {tr.orderTotal}: <b>{Number(p.total).toFixed(2)} €</b>
              </p>
              <div className="hf-adm-estado">
                <span className={`hf-estado e-${p.estado}`}>{tr.orderSteps[ESTADOS.indexOf(p.estado)]}</span>
                {p.estado !== "ENTREGADO" && (
                  <button className="hf-btn" onClick={() => avanzar(p)}>
                    {tr.admAdvance} <i className="ti ti-arrow-right" />
                  </button>
                )}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
