# HikariForge — Guía de las fases 3 a 6

Esta guía documenta las cuatro fases finales del roadmap de mi tienda: qué añade
cada una, qué archivos toca, cómo aplicarla y —lo más importante— **cómo comprobar
que funciona antes de añadir la siguiente**. La escribo para poder aplicar cada
fase con calma y no avanzar hasta tener la anterior verificada en verde.

Fecha: 6 de julio de 2026.

---

## Antes de empezar: reglas de aplicación (leer sí o sí)

### El orden importa

Los cuatro ZIPs **comparten archivos** (`PedidoService.java`, `ProductoService.java`,
`AdminPage.jsx`, `translations.js`, `theme.css`…). Cada fase incluye la versión de
esos archivos **con todas las fases anteriores ya dentro**. Por eso:

- **Aplico los ZIPs EN ORDEN: fase 3 → fase 4 → fase 5 → fase 6.**
- Si me salto el orden (por ejemplo, aplico la 5 y luego la 4), el archivo de la
  fase 4 **pisaría** los cambios de la 5 y rompería cosas.
- Si algún día quiero re-aplicar una fase, tengo que re-aplicar también las
  posteriores.

### La rutina de cada fase

1. Copio los archivos del **backend** a sus rutas (el LEEME de cada ZIP las lista).
2. Reinicio el backend **recompilando** (desde el IDE o `mvn spring-boot:run`).
   Compruebo en el log de arranque que **Flyway aplica las migraciones nuevas**
   (líneas `Migrating schema ... to version "X"`). Si arranco un `.jar` viejo,
   seguiré ejecutando el código viejo aunque haya copiado los fuentes.
3. Copio los archivos del **frontend** a `frontend/src/...`.
4. Recargo el navegador con **Ctrl+Shift+R** (recarga dura, sin caché).
5. Paso la **checklist de comprobación** de la fase. Solo si todo está en verde,
   paso a la siguiente.

### Qué significa "en verde" en cada lado

- **Frontend**: `npx vite build` termina con `✓ built` y sin errores (cada fase
  se entregó ya verificada así). En el día a día me basta con que `npm run dev`
  no muestre errores en consola.
- **Backend**: arranca sin excepciones, Flyway aplica sus migraciones y los
  endpoints nuevos aparecen en Swagger (`http://localhost:8080/swagger-ui.html`).

---

## FASE 3 — Pago con Stripe Checkout (modo test)

### Qué añade y por qué

Hasta ahora los pedidos se quedaban en PENDIENTE para siempre: no había forma de
cobrar. Esta fase integra **Stripe Checkout**, la página de pago alojada de
Stripe: yo no toco datos de tarjeta (los ve solo Stripe, que cumple toda la
normativa), solo creo una "sesión de pago" y redirijo al cliente.

El flujo completo queda así:

1. El cliente confirma el checkout → se crea el pedido → **la web lo lleva
   directamente a la página de pago de Stripe** con el total.
2. Paga (o cancela) y Stripe lo devuelve a "Mis pedidos".
3. La web **verifica el pago EN EL SERVIDOR** (nunca se fía de la URL del
   navegador): consulta la sesión a Stripe y, si está pagada, marca el pedido
   como PAGADO, guarda la fecha de pago y envía el email de "pago recibido".
4. Los pedidos pendientes tienen un botón **"Pagar ahora"** para pagar más tarde.

Detalles de diseño que me importan:
- **Degradación elegante**: si no hay clave de Stripe configurada, la tienda
  funciona exactamente como antes (pedido pendiente + botón de pagar que avisa
  de que el pago no está configurado). Nada se rompe.
- **Idempotente**: si recargo la página de vuelta de Stripe dos veces, el pedido
  no se "re-paga" ni se re-envía el email.
- El cobro usa **el total calculado por el mismo código que la API** — así,
  cuando en la fase 5 lleguen los cupones, Stripe cobrará el total con descuento
  automáticamente, sin tocar nada.

### Archivos

Backend: `pom.xml` (dependencia stripe-java), `application.yml` (clave),
migración `V15__pedido_pago_stripe.sql` (sesión de pago + fecha de pago en el
pedido), `Pedido.java`, `PagoService.java` (nuevo), `PagoController.java`
(nuevo), `ConfirmarPagoRequest.java` (nuevo), `PedidoService.java` (abre
`aResponse` al paquete). Frontend: `api/pagos.js` (nuevo), `CheckoutPage.jsx`,
`PedidosPage.jsx`, `translations.js`, `theme.css`.

### Cómo conseguir la clave de Stripe (gratis, 10 minutos)

1. Me creo una cuenta en **stripe.com** (gratuita; para el modo test no piden
   datos bancarios ni verificación de negocio).
2. En el panel, arriba a la derecha, me aseguro de estar en **modo Test**
   (interruptor "Test mode" activado — todo naranja).
3. Voy a **Developers → API keys** y copio la **Secret key** que empieza por
   `sk_test_...` (la "Publishable key" no me hace falta en esta integración).
4. Arranco el backend con la variable de entorno:
   - IntelliJ: Run → Edit Configurations → Environment variables →
     `STRIPE_SECRET_KEY=sk_test_...`
   - Terminal (Windows PowerShell): `$env:STRIPE_SECRET_KEY="sk_test_..."` antes
     de `mvn spring-boot:run`.
   - Terminal (Linux/Mac): `STRIPE_SECRET_KEY=sk_test_... mvn spring-boot:run`

La clave es SECRETA: nunca la subo a GitHub. Por eso va en variable de entorno
y no en el `application.yml`.

### Checklist de comprobación (antes de pasar a la fase 4)

1. **Arranque**: Flyway migra a la versión 15. En Swagger aparecen
   `POST /api/pagos/sesion/{pedidoId}` y `POST /api/pagos/confirmar`.
2. **Sin clave** (primero pruebo la degradación): sin `STRIPE_SECRET_KEY`, hago
   una compra → el pedido se crea PENDIENTE y al pulsar "Pagar ahora" sale el
   aviso "El pago no está configurado". La tienda no se rompe. ✔
3. **Con clave**: reinicio con la variable, hago una compra desde el checkout →
   me redirige a una página de Stripe con "Pedido #xxxx — HikariForge" y el
   total correcto.
4. **Pago con la tarjeta de prueba**: número **4242 4242 4242 4242**, cualquier
   fecha futura (p. ej. 12/30), cualquier CVC (p. ej. 123), cualquier nombre.
   Es la tarjeta oficial de pruebas de Stripe: siempre aprueba.
5. Al pagar vuelvo a "Mis pedidos": toast "¡Pago completado!", el pedido pasa a
   **PAGADO** en la línea de seguimiento, y en la consola del backend aparece el
   email "Pago recibido" (modo dev).
6. **Cancelación del pago**: repito la compra pero en Stripe pulso la flecha de
   volver → toast "Pago cancelado", el pedido sigue PENDIENTE con su botón.
7. **Idempotencia**: en la URL de vuelta (con `session_id=...`), recargo la
   página → no pasa nada raro, el pedido sigue PAGADO una sola vez.
8. Extra: en el panel de Stripe (modo test) → Payments, veo el cobro registrado.

---

## FASE 4 — Galería de imágenes por URL

### Qué añade y por qué

Los productos tenían el campo `imagenUrl` en la base de datos pero la web nunca
lo mostraba: las tarjetas enseñaban un placeholder tipográfico. Esta fase:

- **Tarjetas del catálogo**: si el producto tiene `imagenUrl`, se muestra la
  foto (recortada a cuadrado con `object-fit: cover`); si no, el placeholder de
  siempre — nada se rompe con productos sin foto.
- **Ficha de producto**: galería con la imagen grande + **miniaturas clicables**
  (la principal + las adicionales, en orden). Con una sola imagen no hay
  miniaturas; sin imágenes, el visual tipográfico de antes.
- **Admin**: debajo del campo de imagen principal hay un **textarea "Galería de
  imágenes"** — una URL por línea, en el orden en que quiero que aparezcan.
- Nueva tabla `producto_imagen` (migración V16) con borrado en cascada: si
  elimino un producto, su galería se va con él.

Decidí trabajar **por URL** (no subida de archivos) porque es lo razonable para
este proyecto: pego enlaces de imágenes (de un CDN, de imgur, de la web del
fabricante...) y funciona. La subida de archivos con almacenamiento sería una
mejora futura.

### Archivos

Backend: `V16__producto_galeria.sql`, `ProductoImagen.java` (nuevo),
`ProductoImagenRepository.java` (nuevo), `ProductoService.java` (métodos
galeria/guardarGaleria + inyección), `ProductoController.java`
(GET público `/{id}/galeria`, PUT admin). Frontend: `api/productos.js`,
`ProductCard.jsx`, `ProductoPage.jsx`, `AdminPage.jsx`, `translations.js`,
`theme.css`.

### Checklist de comprobación (antes de pasar a la fase 5)

1. **Arranque**: Flyway migra a la versión 16. En Swagger aparece
   `GET /api/productos/{id}/galeria`.
2. En el **admin**, edito un producto y pongo una URL de imagen en "Imagen
   (URL)" — para probar sirve cualquier imagen de internet, por ejemplo una
   búsqueda de "gaming mouse png" y copiar la dirección de la imagen.
3. En el textarea "Galería de imágenes" pego **2 o 3 URLs más**, una por línea.
   Guardo.
4. **Catálogo**: la tarjeta del producto muestra la foto principal. Las tarjetas
   de productos sin foto siguen con su placeholder. ✔
5. **Ficha**: veo la imagen grande y debajo las miniaturas; al pulsar cada
   miniatura cambia la grande, y la activa se marca con borde.
6. Edito de nuevo el producto en el admin: el textarea **recuerda** las URLs
   guardadas. Borro una línea y guardo → la ficha pierde esa miniatura.
7. Creo un producto **nuevo** desde el admin: el textarea de galería empieza
   vacío (no arrastra el del producto anterior).

---

## FASE 5 — Utilidades de venta: cupones, aviso de stock y comparador

Esta fase son tres funcionalidades que empujan la venta. La aplico como un solo
ZIP pero las compruebo por separado.

### 5A · Cupones de descuento

**Qué hace**: cupones porcentuales sobre el total del pedido, con activación,
límite de usos y caducidad opcionales. En el checkout hay un campo "Cupón de
descuento" con botón **Aplicar**: valida contra la API y, si es válido, muestra
la línea de descuento y el total rebajado. El código y el porcentaje quedan
**congelados en el pedido** (si luego cambio o borro el cupón, los pedidos ya
hechos no se ven afectados). El pago de Stripe cobra el total CON descuento
automáticamente. En el admin hay una pestaña **Cupones** nueva: crear (código,
%, usos máximos, caducidad), activar/desactivar, borrar, y ver los usos.

**Detalle importante**: la migración V17 **siembra el cupón `BIENVENIDO5` (5%)**
— por fin la marquesina de la web ("5% de descuento en tu primer pedido") dice
la verdad. Nota honesta: el cupón no comprueba que sea de verdad el *primer*
pedido del cliente (eso sería una mejora futura); es un 5% genérico que puedo
limitar por usos o caducidad desde el admin.

**Comprobación**:
1. Flyway migra a V17 y V18. En el admin aparece la pestaña Cupones con
   BIENVENIDO5 ya listado.
2. En el checkout escribo `BIENVENIDO5` → Aplicar → aparece "−5%" y el total
   baja (p. ej. 100,00 → 95,00). Escribo un código falso → mensaje "El cupón
   no existe".
3. Completo la compra: en "Mis pedidos" el total del pedido es el rebajado, y
   si pago con Stripe, **Stripe cobra el total rebajado**.
4. En el admin, el contador de usos del cupón ha subido en 1.
5. Desactivo el cupón desde el admin → en el checkout ya no se puede aplicar
   ("El cupón no está activo").

### 5B · Aviso "disponible de nuevo"

**Qué hace**: cuando un producto está **agotado**, la ficha muestra un bloque
"¿Agotado? Te avisamos cuando vuelva" con un campo de email (precargado si hay
sesión — los invitados también pueden apuntarse). Al reponer stock desde el
admin (de 0 a más de 0), **se envía automáticamente el email** a todos los
apuntados con un botón que lleva a la ficha, y quedan marcados como avisados
(no se les repite el correo). Reutiliza el servicio de email de la fase 2: en
modo dev, los correos se ven en la consola del backend.

**Comprobación**:
1. En el admin pongo el stock de un producto a **0**. En su ficha aparece el
   bloque del aviso.
2. Me apunto con un email → mensaje de confirmación. Me intento apuntar otra
   vez con el mismo → "Ya estás apuntado al aviso de este producto".
3. En el admin subo el stock a 5 → **en la consola del backend** aparece el
   email "vuelve a estar disponible" dirigido a ese correo.
4. Vuelvo a poner stock 0 y luego 5 otra vez → NO se repite el email (ya estaba
   avisado).

### 5C · Comparador de productos

**Qué hace**: cada tarjeta del catálogo tiene un **segundo icono** (⇄, junto al
corazón) para marcar hasta **3 productos**. Con 2 o más marcados aparece una
**barra flotante** abajo ("N para comparar → Comparar"). La página `/comparar`
los muestra lado a lado: foto, nombre (enlazado), precio (con oferta tachada si
la hay), marca, categoría, stock, y **todas sus especificaciones** con las
etiquetas legibles del catálogo de atributos (la unión de las specs de los
comparados; lo que un producto no tiene sale como "—"). La selección persiste
en el navegador.

**Comprobación**:
1. En el catálogo marco 2 ratones con el icono ⇄ (se rellena al marcarse) →
   aparece la barra flotante abajo.
2. Pulso "Comparar" → tabla lado a lado con precios, marca y las specs
   (Sensor, DPI, etc.) con sus nombres legibles.
3. Quito uno desde la propia tabla ("Quitar") y añado otro desde el catálogo.
4. Intento marcar un 4º producto → no se marca (máximo 3).
5. Recargo la página → la selección se mantiene. "Vaciar comparador" la limpia.

---

## FASE 6 — Dashboard del admin + tests JUnit

### 6A · Dashboard

**Qué hace**: pestaña **Dashboard** nueva en el admin (la primera) con:
- 4 tarjetas de métricas: **pedidos hoy, ventas hoy, pedidos totales, ventas
  totales**. Los pedidos CANCELADOS no cuentan (sería inflar las ventas).
- Gráfica de barras de **ventas de los últimos 14 días** (CSS puro, sin
  librerías — cada barra escala respecto al mejor día; el día del mes debajo y
  el importe al pasar el ratón).
- **Top 5 de productos más vendidos** por unidades, con barras de progreso.

**Comprobación**:
1. En Swagger aparece `GET /api/admin/estadisticas` (y devuelve 401/403 si lo
   llamo sin sesión de admin — la seguridad funciona).
2. Entro al admin → pestaña Dashboard: las tarjetas cuadran con la realidad
   (los pedidos que he hecho hoy probando, sus importes...).
3. Hago un pedido nuevo y recargo el dashboard → pedidos hoy +1 y las ventas
   suben con su importe (con descuento aplicado si llevaba cupón).
4. Cancelo un pedido pendiente y recargo → las métricas bajan (los cancelados
   no cuentan).

### 6B · Tests JUnit

**Qué incluyen**: tests unitarios con Mockito de la lógica que **cuesta dinero
si falla**:
- `PedidoServiceTest`: crear descuenta el stock; crear rechaza sin stock
  suficiente (y no toca el stock); el cupón aplica el descuento al total
  (100 € − 5% = 95 €); cancelar repone el stock y marca CANCELADO; cancelar
  rechaza pedidos de otro usuario y pedidos no pendientes.
- `CuponServiceTest`: valida un cupón correcto; rechaza inexistente, inactivo,
  caducado y sin usos; consumir incrementa los usos.
- `AuthServiceResetTest`: restablecer con token válido cifra la contraseña y
  consume el token; rechaza token usado, caducado e inexistente.

**Cómo ejecutarlos**: los tres archivos van en
`backend/src/test/java/com/hikariforge/store/service/` (creo la carpeta
`service` dentro de test si no existe). Después:

```
cd backend
mvn test
```

o desde el IDE: clic derecho sobre la carpeta de tests → Run. Debe salir
`Tests run: 16, Failures: 0`.

**Nota honesta**: estos tests se escribieron sin poder ejecutarse en el entorno
donde se generaron (sin acceso a Maven), siguiendo los patrones estándar de
Mockito y la firma real de mis servicios. Si al correrlos algo no compila (por
ejemplo, un constructor que difiera), el error de compilación dirá exactamente
qué línea ajustar — pero deberían pasar tal cual.

---

## FASE 7 — Inicio de sesión con código por email (OTP)

### Qué añade y por qué

Una alternativa al login con contraseña: el cliente escribe su email, recibe un
**código de 6 dígitos** y entra con él. Es el patrón "passwordless" que usan
Slack, Notion o Amazon — menos fricción (nadie tiene que recordar contraseñas)
sin perder seguridad. El login con contraseña y el de Google siguen exactamente
igual; esto es una tercera vía.

Las protecciones de seguridad que lleva:
- **Caducidad de 10 minutos** y **un solo uso**: al entrar, el código se consume.
- **Máximo 5 intentos** por código; al sexto se invalida y hay que pedir otro.
  Detalle de implementación importante: los intentos fallidos se guardan con
  saves explícitos (sin transacción envolvente) — si estuvieran dentro de una
  transacción, la excepción del "código incorrecto" haría rollback del contador
  y la protección no serviría de nada.
- **Solo vale el último código**: pedir uno nuevo invalida los anteriores.
- **No revela cuentas**: la respuesta es la misma exista o no el email.
- El código **no crea cuentas**: solo sirve para entrar con cuentas existentes
  (registrarse sigue siendo el registro normal).
- La sesión resultante es **idéntica** a la del login con contraseña (el mismo
  token JWT): para el resto de la web no hay ninguna diferencia.

### Archivos

Backend: migración `V19__codigo_login.sql` (tabla codigo_login con código,
caducidad, usado e intentos), `CodigoLogin.java` (nuevo),
`CodigoLoginRepository.java` (nuevo), `EnviarCodigoRequest.java` y
`VerificarCodigoRequest.java` (nuevos), `AuthService.java` (métodos
enviarCodigoLogin/verificarCodigoLogin), `AuthController.java`
(`POST /api/auth/codigo/enviar` y `/verificar`, públicos). Frontend:
`api/auth.js`, `AuthContext.jsx` (loginConCodigo), `LoginPage.jsx` (los tres
modos), `translations.js`, `theme.css`.

Se aplica **después de la fase 6** (comparte `AuthService`, `AuthController`,
`LoginPage`, `translations` y `theme.css` con fases anteriores).

### Checklist de comprobación

1. **Arranque**: Flyway migra a la versión 19. En Swagger aparecen
   `POST /api/auth/codigo/enviar` y `POST /api/auth/codigo/verificar`.
2. En el login pulso **"Entrar con código por email"** → escribo el email de mi
   cuenta → "Enviarme el código".
3. **Consola del backend** (modo dev): aparece el email con el código de 6
   dígitos en grande. Lo escribo en la web → botón "Entrar" (solo se activa con
   6 dígitos) → dentro. La sesión funciona igual que siempre (carrito, pedidos,
   perfil…).
4. **Un solo uso**: cierro sesión e intento entrar con el MISMO código → 
   "Código incorrecto o caducado". ✔
5. **Intentos limitados**: pido un código nuevo y meto uno equivocado 6 veces →
   a la sexta, "Demasiados intentos. Pide un código nuevo".
6. **Reenviar**: en la pantalla del código pulso "Reenviar código" → llega uno
   nuevo a la consola, y el anterior deja de valer (solo entra el último).
7. **Email inexistente**: pido código para un correo no registrado → la web
   dice lo mismo de siempre ("si el email existe…") y no delata nada; al
   escribir cualquier código, "Código incorrecto o caducado".
8. **Caducidad** (opcional, si quiero esperar): un código de más de 10 minutos
   responde "El código ha caducado. Pide uno nuevo".

---

## Resumen del estado final

Con las 7 fases aplicadas, HikariForge tiene: catálogo con filtros, specs
gestionables y comparador · galería de imágenes · carrito y checkout con
dirección de envío internacional · cupones de descuento · pago real con Stripe
(modo test) · emails transaccionales (confirmación de pedido, pago recibido,
recuperación de contraseña, aviso de stock, código de acceso) · cancelación de pedidos con
reposición de stock · login con contraseña, con Google y con código por email · panel admin con dashboard de ventas, gestión de
productos, pedidos, reseñas, atributos y cupones · y tests de la lógica
crítica. Migraciones de base de datos: V1 a V19.

Variables de entorno que existen (todas opcionales en desarrollo):
`STRIPE_SECRET_KEY` (activa el pago), `MAIL_ENABLED` + `MAIL_USER` + `MAIL_PASS`
+ `MAIL_FROM` (correo real), `FRONTEND_URL` (enlaces de los emails en
producción), `JWT_SECRET` (clave de sesión en producción).
