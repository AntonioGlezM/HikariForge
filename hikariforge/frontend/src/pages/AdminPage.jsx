import { useEffect, useMemo, useState } from "react";
import { listarCupones, crearCupon, alternarCupon, eliminarCupon } from "../api/cupones";
import { listarProductosAdmin, crearProducto, actualizarProducto, eliminarProducto, reactivarProducto , obtenerGaleria, guardarGaleria } from "../api/productos";
import { listarAtributos, crearAtributo, actualizarAtributo, eliminarAtributo } from "../api/atributos";
import SpecFields from "../components/SpecFields";
import { listarCategorias } from "../api/categorias";
import { todosPedidos, cambiarEstadoPedido } from "../api/pedidos";
import { todasValoraciones, borrarValoracion } from "../api/valoraciones";
import Stars from "../components/Stars";
import { useSettings } from "../context/SettingsContext";

const ESTADOS = ["PENDIENTE", "PAGADO", "ENVIADO", "ENTREGADO"];
const STOCK_BAJO = 5;
const FORM_VACIO = { nombre: "", descripcion: "", marca: "", precio: "", precioOferta: "", ofertaLimite: "none", ofertaDesde: "", ofertaHasta: "", stock: "", imagenUrl: "", categoriaId: "",
  conexion: "", pesoG: "", rgb: "", color: "", specs: {} };

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

  const abrirNuevo = () => { setGaleriaTxt(""); setForm(FORM_VACIO); setEditandoId(null); setMsg(null); };
  const [galeriaTxt, setGaleriaTxt] = useState(""); // URLs de la galería, una por línea

  const abrirEditar = (p) => {
    // Cargamos la galería existente del producto para editarla.
    obtenerGaleria(p.id).then(({ data }) => setGaleriaTxt(data.join("\n"))).catch(() => setGaleriaTxt(""));
    setForm({ nombre: p.nombre, descripcion: p.descripcion ?? "", marca: p.marca ?? "",
              precio: p.precio, precioOferta: p.precioOferta ?? "",
              ofertaLimite: p.ofertaHastaAgotar ? "stock" : (p.ofertaHasta ? "date" : "none"),
              ofertaDesde: p.ofertaDesde ? p.ofertaDesde.slice(0, 16) : "",
              ofertaHasta: p.ofertaHasta ? p.ofertaHasta.slice(0, 16) : "",
              stock: p.stock, imagenUrl: p.imagenUrl ?? "", categoriaId: p.categoriaId,
              conexion: p.conexion ?? "", pesoG: p.pesoG ?? "", rgb: p.rgb == null ? "" : String(p.rgb),
              color: p.color ?? "", specs: p.specs ?? {} });
    setEditandoId(p.id);
    setMsg(null);
  };

  const guardar = async (e) => {
    e.preventDefault();
    setMsg(null);
const tieneOferta = !!form.precioOferta;
    const cuerpo = {
      ...form,
      precio: Number(form.precio),
      precioOferta: tieneOferta ? Number(form.precioOferta) : null,
      // La vigencia solo se manda si hay precio de oferta y se eligió un tipo de límite.
      ofertaDesde: tieneOferta && form.ofertaLimite === "date" && form.ofertaDesde ? form.ofertaDesde : null,
      ofertaHasta: tieneOferta && form.ofertaLimite === "date" && form.ofertaHasta ? form.ofertaHasta : null,
      ofertaHastaAgotar: tieneOferta && form.ofertaLimite === "stock",
      stock: Number(form.stock),
      imagenUrl: form.imagenUrl || null, descripcion: form.descripcion || null, marca: form.marca || null,
      // Especificaciones: columnas filtrables (vacío -> null) y ficha técnica JSON.
      conexion: form.conexion || null,
      pesoG: form.pesoG ? Number(form.pesoG) : null,
      rgb: form.rgb === "" ? null : form.rgb === "true",
      color: form.color || null,
      specs: form.specs || {},
    };
    // Quitamos el campo auxiliar de UI que el backend no conoce.
    delete cuerpo.ofertaLimite;
    try {
      let productoId = editandoId;
      if (editandoId) await actualizarProducto(editandoId, cuerpo);
      else { const { data } = await crearProducto(cuerpo); productoId = data.id; }
      // Galería: el textarea manda (una URL por línea; vacío = sin galería).
      const urls = galeriaTxt.split("\n").map((u) => u.trim()).filter(Boolean);
      await guardarGaleria(productoId, urls);
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

  /* ===== Reseñas (moderación) ===== */
  const [resenas, setResenas] = useState([]);
  const cargarResenas = () => todasValoraciones().then(({ data }) => setResenas(data));
  useEffect(() => { if (pestana === "resenas") cargarResenas(); }, [pestana]);

  // ----- Cupones (Fase 5) -----
  const [cupones, setCupones] = useState([]);
  const [cuponForm, setCuponForm] = useState({ codigo: "", porcentaje: "", usosMax: "", caduca: "" });
  const cargarCupones = () => listarCupones().then(({ data }) => setCupones(data)).catch(() => {});
  useEffect(() => { if (pestana === "cupones") cargarCupones(); }, [pestana]);

  const guardarCupon = async (e) => {
    e.preventDefault();
    try {
      await crearCupon({ codigo: cuponForm.codigo, porcentaje: Number(cuponForm.porcentaje),
                         usosMax: cuponForm.usosMax ? Number(cuponForm.usosMax) : null,
                         caduca: cuponForm.caduca || null });
      setCuponForm({ codigo: "", porcentaje: "", usosMax: "", caduca: "" });
      cargarCupones();
      setMsg({ ok: true, texto: tr.admSaved });
    } catch (err) {
      setMsg({ ok: false, texto: err.response?.data?.mensaje ?? tr.loadError });
    }
  };

  // El admin puede borrar cualquier reseña (p. ej. spam o reseñas abusivas).
  const borrarResena = async (r) => {
    if (!window.confirm(`${tr.admReviewDelete}`)) return;
    await borrarValoracion(r.id);
    cargarResenas();
  };

  /* ===== Catálogo de atributos ===== */
  const ATTR_VACIO = { categoriaId: "", clave: "", etiqueta: "", tipo: "TEXTO", opciones: "", seccion: "", unidad: "", orden: 0, icono: "", destacado: false };
  const [catAttr, setCatAttr] = useState("");      // categoría seleccionada para ver/editar atributos
  const [atributos, setAtributos] = useState([]);
  const [attrForm, setAttrForm] = useState(null);  // null = formulario cerrado
  const [attrEditId, setAttrEditId] = useState(null);

  const cargarAtributos = (categoriaId) => {
    if (!categoriaId) { setAtributos([]); return; }
    listarAtributos(categoriaId).then(({ data }) => setAtributos(data));
  };
  useEffect(() => { if (pestana === "atributos" && catAttr) cargarAtributos(catAttr); }, [pestana, catAttr]);

  const attrCampo = (k) => (e) => setAttrForm((f) => ({ ...f, [k]: e.target.value }));
  const abrirNuevoAttr = () => { setAttrForm({ ...ATTR_VACIO, categoriaId: catAttr }); setAttrEditId(null); };
  const abrirEditarAttr = (a) => {
    setAttrForm({ categoriaId: catAttr, clave: a.clave, etiqueta: a.etiqueta, tipo: a.tipo,
                  opciones: (a.opciones || []).join("|"), seccion: a.seccion ?? "", unidad: a.unidad ?? "",
                  orden: a.orden ?? 0, icono: a.icono ?? "", destacado: !!a.destacado });
    setAttrEditId(a.id);
  };

  const guardarAttr = async (e) => {
    e.preventDefault();
    const cuerpo = { ...attrForm, orden: Number(attrForm.orden) || 0,
                     destacado: !!attrForm.destacado,
                     opciones: attrForm.tipo === "LISTA" ? (attrForm.opciones || null) : null };
    try {
      if (attrEditId) await actualizarAtributo(attrEditId, cuerpo);
      else await crearAtributo(cuerpo);
      setAttrForm(null);
      cargarAtributos(catAttr);
      setMsg({ ok: true, texto: tr.admSaved });
    } catch (err) {
      setMsg({ ok: false, texto: err.response?.data?.mensaje ?? tr.loadError });
    }
  };

  const borrarAttr = async (a) => {
    if (!window.confirm(`${tr.admAttrDeleteConfirm} (${a.etiqueta})`)) return;
    await eliminarAtributo(a.id);
    cargarAtributos(catAttr);
  };

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
        <button className={pestana === "resenas" ? "on" : ""} onClick={() => setPestana("resenas")}>
          <i className="ti ti-star" /> {tr.admReviews}
        </button>
        <button className={pestana === "cupones" ? "on" : ""} onClick={() => setPestana("cupones")}>
          <i className="ti ti-ticket" /> {tr.admTabCoupons}
        </button>
        <button className={pestana === "atributos" ? "on" : ""} onClick={() => setPestana("atributos")}>
          <i className="ti ti-list-details" /> {tr.admAttributes}
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
                <input className="hf-input" type="number" step="0.01" min="0.01" placeholder={tr.admPriceOffer}
                       value={form.precioOferta} onChange={campo("precioOferta")} />
                {form.precioOferta && (
                  <select className="hf-input" value={form.ofertaLimite} onChange={campo("ofertaLimite")}>
                    <option value="none">{tr.admOfferNone}</option>
                    <option value="date">{tr.admOfferDate}</option>
                    <option value="stock">{tr.admOfferStock}</option>
                  </select>
                )}
                {form.precioOferta && form.ofertaLimite === "date" && (
                  <>
                    <label className="hf-adm-datelbl">{tr.admOfferFrom}
                      <input className="hf-input" type="datetime-local" value={form.ofertaDesde}
                             onChange={campo("ofertaDesde")} />
                    </label>
                    <label className="hf-adm-datelbl">{tr.admOfferDateLabel}
                      <input className="hf-input" type="datetime-local" value={form.ofertaHasta}
                             onChange={campo("ofertaHasta")} />
                    </label>
                  </>
                )}
                <input className="hf-input" type="number" min="0" placeholder={tr.admStock}
                       value={form.stock} onChange={campo("stock")} required />
                <select className="hf-input" value={form.categoriaId} onChange={campo("categoriaId")} required>
                  <option value="" disabled>{tr.admCat}</option>
                  {categorias.map((c) => <option key={c.id} value={c.id}>{trCat(c.nombre)}</option>)}
                </select>
                <input className="hf-input" placeholder={tr.admImage} value={form.imagenUrl} onChange={campo("imagenUrl")} />
                <label className="hf-fld" style={{ gridColumn: "1 / -1" }}>
                  <span>{tr.admGallery}</span>
                  <textarea className="hf-input" rows={3} value={galeriaTxt}
                            onChange={(e) => setGaleriaTxt(e.target.value)}
                            placeholder={tr.admGalleryPh} />
                  <small>{tr.admGalleryHelp}</small>
                </label>
              </div>
              <textarea className="hf-input" rows="2" placeholder={tr.admDesc}
                        value={form.descripcion} onChange={campo("descripcion")} />

              {/* Especificaciones filtrables (comunes a varias categorías) */}
              <div className="hf-specfields">
                <p className="hf-specfields-title">{tr.admFilterSpecs}</p>
                <div className="hf-specgroup-grid">
                  <label className="hf-specfield">
                    <span>{tr.specConexion}</span>
                    <select className="hf-input" value={form.conexion} onChange={campo("conexion")}>
                      <option value="">—</option>
                      <option value="cable">{tr.connWired}</option>
                      <option value="inalambrico">{tr.connWireless}</option>
                      <option value="ambos">{tr.connBoth}</option>
                    </select>
                  </label>
                  <label className="hf-specfield">
                    <span>{tr.specPeso} (g)</span>
                    <input className="hf-input" type="number" min="0" value={form.pesoG} onChange={campo("pesoG")} />
                  </label>
                  <label className="hf-specfield">
                    <span>{tr.specColor}</span>
                    <input className="hf-input" value={form.color} onChange={campo("color")} />
                  </label>
                  <label className="hf-specfield">
                    <span>RGB</span>
                    <select className="hf-input" value={form.rgb} onChange={campo("rgb")}>
                      <option value="">—</option>
                      <option value="true">{tr.yes}</option>
                      <option value="false">{tr.no}</option>
                    </select>
                  </label>
                </div>
              </div>

              {/* Ficha técnica dinámica según la categoría elegida */}
              <SpecFields categoriaId={form.categoriaId} specs={form.specs}
                          onChange={(s) => setForm((f) => ({ ...f, specs: s }))} tr={tr} />

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

      {pestana === "resenas" && (
        <div className="hf-support">
          {resenas.length === 0 && <p className="hf-sub">{tr.admReviewsEmpty}</p>}
          {resenas.map((r) => (
            <section key={r.id} className="hf-sup-card">
              <div className="hf-order-head">
                <h3 style={{ fontSize: "1.1rem" }}><i className="ti ti-star-filled" />{r.productoNombre}</h3>
                <span className="hf-order-date">{new Date(r.fecha).toLocaleString()}</span>
              </div>
              <div className="hf-adm-resena">
                <Stars value={r.estrellas} />
                <span className="hf-sub">· {tr.admReviewAuthor}: <b>{r.autorEmail}</b></span>
              </div>
              {r.comentario && <p style={{ lineHeight: 1.7, margin: "8px 0" }}>{r.comentario}</p>}
              <button className="hf-btn" onClick={() => borrarResena(r)}>
                <i className="ti ti-trash" /> {tr.admReviewDeleteBtn}
              </button>
            </section>
          ))}
        </div>
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

      {/* ----- Cupones (Fase 5) ----- */}
      {pestana === "cupones" && (
        <section>
          <form className="hf-adm-cupon-form" onSubmit={guardarCupon}>
            <input className="hf-input" placeholder={tr.admCouponCode} required maxLength={30}
                   value={cuponForm.codigo}
                   onChange={(e) => setCuponForm((f) => ({ ...f, codigo: e.target.value.toUpperCase() }))} />
            <input className="hf-input" type="number" min={1} max={90} placeholder="%" required
                   value={cuponForm.porcentaje}
                   onChange={(e) => setCuponForm((f) => ({ ...f, porcentaje: e.target.value }))} />
            <input className="hf-input" type="number" min={1} placeholder={tr.admCouponUses}
                   value={cuponForm.usosMax}
                   onChange={(e) => setCuponForm((f) => ({ ...f, usosMax: e.target.value }))} />
            <input className="hf-input" type="date" value={cuponForm.caduca}
                   onChange={(e) => setCuponForm((f) => ({ ...f, caduca: e.target.value }))} />
            <button className="hf-btn hf-btn-main" type="submit">{tr.admCouponAdd}</button>
          </form>

          <div className="hf-adm-cupones">
            {cupones.map((c) => (
              <div key={c.id} className={`hf-adm-cupon ${c.activo ? "" : "off"}`}>
                <b>{c.codigo}</b>
                <span>−{c.porcentaje}%</span>
                <span>{c.usos}{c.usosMax ? ` / ${c.usosMax}` : ""} {tr.admCouponUsed}</span>
                <span>{c.caduca ? `${tr.admCouponExpires} ${c.caduca}` : tr.admCouponNoExpiry}</span>
                <div className="acts">
                  <button className="hf-icon-btn" title={c.activo ? tr.admCouponOff : tr.admCouponOn}
                          onClick={() => alternarCupon(c.id).then(cargarCupones)}>
                    <i className={`ti ${c.activo ? "ti-toggle-right" : "ti-toggle-left"}`} />
                  </button>
                  <button className="hf-icon-btn" title={tr.admDelete}
                          onClick={() => eliminarCupon(c.id).then(cargarCupones)}>
                    <i className="ti ti-trash" />
                  </button>
                </div>
              </div>
            ))}
            {cupones.length === 0 && <p className="hf-sub">{tr.admCouponEmpty}</p>}
          </div>
        </section>
      )}

      {pestana === "atributos" && (
        <div className="hf-adm-attrs">
          <p className="hf-sub">{tr.admAttrIntro}</p>
          <div className="hf-adm-bar">
            <select className="hf-input" value={catAttr} onChange={(e) => { setCatAttr(e.target.value); setAttrForm(null); }}>
              <option value="" disabled>{tr.admCat}</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{trCat(c.nombre)}</option>)}
            </select>
            {catAttr && (
              <button className="hf-btn hf-btn-main" onClick={abrirNuevoAttr}>
                <i className="ti ti-plus" /> {tr.admAttrNew}
              </button>
            )}
          </div>

          {/* Formulario de atributo */}
          {attrForm && (
            <form className="hf-adm-form hf-attr-form" onSubmit={guardarAttr}>
              {/* Lo esencial: qué atributo es y de qué tipo */}
              <fieldset className="hf-attr-group">
                <legend>{tr.admAttrGroupBasic}</legend>
                <div className="grid">
                  <label className="hf-fld">
                    <span>{tr.admAttrLabel}</span>
                    <input className="hf-input" value={attrForm.etiqueta} onChange={attrCampo("etiqueta")} required />
                    <small>{tr.admAttrLabelHelp}</small>
                  </label>
                  <label className="hf-fld">
                    <span>{tr.admAttrKey}</span>
                    <input className="hf-input" value={attrForm.clave} onChange={attrCampo("clave")} required />
                    <small>{tr.admAttrKeyHelp}</small>
                  </label>
                  <label className="hf-fld">
                    <span>{tr.admAttrType}</span>
                    <select className="hf-input" value={attrForm.tipo} onChange={attrCampo("tipo")}>
                      <option value="TEXTO">{tr.admAttrTypeText}</option>
                      <option value="NUMERO">{tr.admAttrTypeNum}</option>
                      <option value="BOOLEANO">{tr.admAttrTypeBool}</option>
                      <option value="LISTA">{tr.admAttrTypeList}</option>
                    </select>
                  </label>
                  {attrForm.tipo === "LISTA" && (
                    <label className="hf-fld">
                      <span>{tr.admAttrOptions}</span>
                      <input className="hf-input" value={attrForm.opciones} onChange={attrCampo("opciones")} placeholder="palm|claw|fingertip" />
                      <small>{tr.admAttrOptionsHelp}</small>
                    </label>
                  )}
                </div>
              </fieldset>

              {/* Presentación: cómo se muestra en la ficha (todo opcional) */}
              <fieldset className="hf-attr-group">
                <legend>{tr.admAttrGroupDisplay} <em>{tr.admAttrOptional}</em></legend>
                <div className="grid">
                  <label className="hf-fld">
                    <span>{tr.admAttrSection}</span>
                    <input className="hf-input" value={attrForm.seccion} onChange={attrCampo("seccion")} placeholder="Sensor" />
                    <small>{tr.admAttrSectionHelp}</small>
                  </label>
                  <label className="hf-fld">
                    <span>{tr.admAttrUnit}</span>
                    <input className="hf-input" value={attrForm.unidad} onChange={attrCampo("unidad")} placeholder="g, Hz, mm…" />
                    <small>{tr.admAttrUnitHelp}</small>
                  </label>
                  <label className="hf-fld">
                    <span>{tr.admAttrOrder}</span>
                    <input className="hf-input" type="number" value={attrForm.orden} onChange={attrCampo("orden")} />
                    <small>{tr.admAttrOrderHelp}</small>
                  </label>
                  <label className="hf-fld">
                    <span>{tr.admAttrIcon}</span>
                    <input className="hf-input" value={attrForm.icono} onChange={attrCampo("icono")} placeholder="crosshair, battery…" />
                    <small>{tr.admAttrIconHelp}</small>
                  </label>
                  <label className="hf-fld hf-fld-check">
                    <span>{tr.admAttrFeatured}</span>
                    <label className="hf-check-inline">
                      <input type="checkbox" checked={attrForm.destacado}
                             onChange={(e) => setAttrForm((f) => ({ ...f, destacado: e.target.checked }))} />
                      {tr.admAttrFeaturedLabel}
                    </label>
                    <small>{tr.admAttrFeaturedHelp}</small>
                  </label>
                </div>
              </fieldset>

              <div className="acciones">
                <button className="hf-btn hf-btn-main" type="submit">{tr.admSave}</button>
                <button className="hf-btn" type="button" onClick={() => setAttrForm(null)}>{tr.admCancel}</button>
              </div>
            </form>
          )}

          {/* Lista de atributos de la categoría */}
          {catAttr && atributos.length === 0 && <p className="hf-sub">{tr.admAttrEmpty}</p>}
          {catAttr && atributos.length > 0 && (
            <div className="hf-adm-table">
              <div className="row head">
                <span>{tr.admAttrLabel}</span><span>{tr.admAttrKey}</span><span>{tr.admAttrType}</span>
                <span>{tr.admAttrSection}</span><span />
              </div>
              {atributos.map((a) => (
                <div key={a.id} className="row">
                  <span className="nom">{a.etiqueta}{a.unidad ? ` (${a.unidad})` : ""}</span>
                  <span>{a.clave}</span>
                  <span>{a.tipo}{a.tipo === "LISTA" && a.opciones.length ? `: ${a.opciones.join(", ")}` : ""}</span>
                  <span>{a.seccion || "—"}</span>
                  <span className="acc">
                    <button className="hf-icon-btn" onClick={() => abrirEditarAttr(a)} aria-label={tr.admEdit}><i className="ti ti-pencil" /></button>
                    <button className="hf-icon-btn" onClick={() => borrarAttr(a)} aria-label={tr.admDelete}><i className="ti ti-trash" /></button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
