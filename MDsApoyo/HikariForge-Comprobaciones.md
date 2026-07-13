# HikariForge — Comprobaciones fase a fase

Este es mi documento de verificación: para cada fase, qué tengo que hacer y qué
tiene que pasar para dar la fase por buena. Formato: **HAZ → DEBE PASAR ✔**.
Solo paso a la fase siguiente cuando todos los puntos de la actual están en
verde. (La explicación de qué hace cada fase está en HikariForge-Guia-Fases.md;
esto es solo la parte de probar.)

Fecha: 7 de julio de 2026.

---

## Antes de cada fase (siempre igual)

1. Aplico los archivos del ZIP **en orden de fase** (3 → 4 → 5 → 6 → 7).
2. Arranco el backend recompilando y **miro el log de arranque**:
   → DEBE aparecer Flyway migrando a la versión de la fase
   (`Migrating schema "public" to version "15 - pedido pago stripe"`, etc.) y
   el `Started ... Application` sin excepciones. ✔
3. Copio el frontend y recargo el navegador con **Ctrl+Shift+R**.
4. Los emails van en **modo consola** (Gmail lo dejo para la pasada final):
   cuando una prueba diga "llega un email", lo busco en la consola del backend
   entre las marcas `===== EMAIL (modo desarrollo) =====`.

Si Flyway NO migra: estoy ejecutando un backend viejo (recompilar) o el archivo
SQL no está en `src/main/resources/db/migration/`.

---

## FASE 3 — Stripe (migración V15)

### Parte A · Sin clave (degradación elegante) — probar PRIMERO

1. Arranco el backend **sin** `STRIPE_SECRET_KEY`.
2. Hago una compra completa desde el checkout.
   → DEBE crearse el pedido normal (toast de pedido creado, aparece PENDIENTE
   en Mis pedidos). La tienda no se rompe por no tener Stripe. ✔
3. En Mis pedidos pulso **"Pagar ahora"** en ese pedido.
   → DEBE salir el aviso "El pago no está configurado (falta STRIPE_SECRET_KEY)". ✔

### Parte B · Con clave (el pago de verdad)

Preparación: clave `sk_test_...` de stripe.com (modo Test → Developers → API
keys) definida como variable de entorno, y backend reiniciado.

4. Repito la compra desde el checkout.
   → DEBE redirigirme a una página de **stripe.com** que muestra
   "Pedido #xxxxxxxx — HikariForge (N art.)" y el **total correcto**. ✔
5. Pago con la tarjeta de prueba: **4242 4242 4242 4242**, caducidad futura
   (12/30), CVC 123, cualquier nombre.
   → DEBE devolverme a Mis pedidos con el toast **"¡Pago completado!"** y el
   pedido en estado **PAGADO**. ✔
   → En la consola del backend DEBE aparecer el email "Pago recibido". ✔
6. Recargo la página con la URL de vuelta todavía en la barra (con `session_id=`).
   → NO debe pasar nada raro: el pedido sigue PAGADO una sola vez y no se
   repite el email (idempotencia). ✔
7. Hago otra compra pero en la página de Stripe pulso la flecha de **volver**.
   → DEBE devolverme con el toast "Pago cancelado..." y el pedido PENDIENTE
   con su botón "Pagar ahora". ✔
8. (Extra) En el panel de Stripe modo Test → **Payments**: aparece el cobro. ✔

Si falla el paso 4 con error al crear la sesión: la clave está mal copiada o es
la Publishable (`pk_test_`) en vez de la Secret (`sk_test_`).

---

## FASE 4 — Galería (migración V16)

Preparación: 2-3 URLs de imágenes de internet (clic derecho sobre cualquier
imagen → "Copiar dirección de la imagen").

1. Admin → editar un producto → pego una URL en "Imagen (URL)" y 2 más en el
   textarea "Galería de imágenes" (una por línea) → guardar.
2. Voy al catálogo.
   → La tarjeta de ese producto DEBE mostrar la foto; las tarjetas de productos
   sin foto siguen con su placeholder de letras. ✔
3. Entro en la ficha del producto.
   → DEBE verse la imagen grande con **miniaturas debajo**; al pulsar cada
   miniatura cambia la grande y la activa se marca con borde. ✔
4. Vuelvo a editar el producto en el admin.
   → El textarea DEBE recordar las URLs guardadas. ✔ Borro una línea, guardo,
   y la ficha pierde esa miniatura. ✔
5. Pulso "Nuevo producto" en el admin.
   → El textarea de galería DEBE estar vacío (no arrastra el anterior). ✔

---

## FASE 5 — Cupones + aviso de stock + comparador (migraciones V17 y V18)

### 5A · Cupones

1. Admin → pestaña **Cupones**.
   → DEBE existir la pestaña y listar ya el cupón **BIENVENIDO5 (−5%)** que
   siembra la migración. ✔
2. Checkout con productos por valor de, p. ej., 100 € → escribo `BIENVENIDO5`
   → **Aplicar**.
   → DEBE aparecer la línea "Descuento −5,00 €" y el total bajar a 95,00 €. ✔
3. Escribo un código inventado → Aplicar.
   → DEBE decir "El cupón no existe". ✔
4. Completo la compra con el cupón.
   → En Mis pedidos el total del pedido ES el rebajado ✔ y si pago con Stripe,
   **Stripe cobra el total rebajado** (verlo en su página de pago). ✔
5. Vuelvo al admin → Cupones.
   → El contador de usos de BIENVENIDO5 DEBE haber subido en 1. ✔
6. Desactivo el cupón (toggle) → pruebo a aplicarlo en el checkout.
   → DEBE decir "El cupón no está activo". ✔ (Lo reactivo después.)

### 5B · Aviso "disponible de nuevo"

1. Admin → pongo el **stock a 0** de un producto → entro en su ficha.
   → DEBE aparecer el bloque "¿Agotado? Te avisamos cuando vuelva" (con mi
   email precargado si tengo sesión). ✔
2. Me apunto → mensaje de confirmación ✔. Me apunto otra vez con el mismo email.
   → DEBE decir "Ya estás apuntado al aviso de este producto". ✔
3. Admin → subo el stock a 5.
   → En la **consola del backend** DEBE aparecer el email "...vuelve a estar
   disponible" para ese correo. ✔
4. Repito: stock a 0 y de nuevo a 5.
   → NO debe repetirse el email (ya quedé avisado). ✔

### 5C · Comparador

1. En el catálogo marco 2 productos con el icono **⇄** de las tarjetas.
   → El icono se rellena en los marcados ✔ y aparece la **barra flotante**
   abajo ("2 para comparar"). ✔
2. Pulso **Comparar**.
   → Tabla lado a lado con foto/nombre, precio (tachado el original si hay
   oferta), marca, categoría, stock y las especificaciones con sus nombres
   legibles (lo que un producto no tiene sale como "—"). ✔
3. "Quitar" uno desde la tabla ✔ y añado otro desde el catálogo ✔.
4. Intento marcar un 4º producto.
   → NO se marca (máximo 3). ✔
5. Recargo la página (F5).
   → La selección se mantiene ✔. "Vaciar comparador" la limpia. ✔

---

## FASE 6 — Dashboard + tests

### 6A · Dashboard

1. Entro al admin.
   → DEBE existir la pestaña **Dashboard** (la primera) con 4 tarjetas:
   pedidos hoy, ventas hoy, pedidos totales, ventas totales — y los números
   DEBEN cuadrar con la realidad de mis pruebas. ✔
2. Hago un pedido nuevo y recargo el dashboard.
   → "Pedidos hoy" +1 y las ventas suben con su importe (el rebajado si llevaba
   cupón). ✔ La barra del día de hoy crece en la gráfica de 14 días. ✔
3. Cancelo un pedido PENDIENTE y recargo.
   → Las métricas BAJAN (los cancelados no cuentan). ✔
4. El "Top 5 más vendidos" lista los productos de mis compras por unidades. ✔
5. (Seguridad) Cierro sesión de admin e intento abrir
   `http://localhost:8080/api/admin/estadisticas` en el navegador.
   → DEBE responder error de autenticación (401/403), nunca los datos. ✔

### 6B · Tests JUnit

1. Los 3 archivos de test están en
   `backend/src/test/java/com/hikariforge/store/service/`.
2. En Git Bash: `./mvnw test` (o el panel Testing de VS Code, icono del
   matraz → Run).
   → DEBE terminar con **`Tests run: 16, Failures: 0, Errors: 0`** y
   BUILD SUCCESS. ✔
   (La primera vez descargará las dependencias de test; es normal que tarde.)

---

## FASE 7 — Login con código por email (migración V19)

1. En el login pulso **"Entrar con código por email"** → escribo el email de
   mi cuenta → "Enviarme el código".
   → Mensaje "Si el email existe, te hemos enviado un código..." ✔ y en la
   **consola del backend** aparece el email con el código de 6 dígitos en
   grande. ✔
2. Escribo el código.
   → El botón "Entrar" solo se activa con 6 dígitos ✔ y al pulsarlo entro:
   sesión normal (veo mi carrito, mis pedidos, mi nombre). ✔
3. Cierro sesión → pido entrar con código otra vez → escribo **el código
   anterior** (el ya usado).
   → DEBE decir "Código incorrecto o caducado" (un solo uso). ✔
4. Pido un código nuevo y meto uno equivocado 6 veces seguidas.
   → Los 5 primeros: "Código incorrecto" ✔. El 6º: **"Demasiados intentos.
   Pide un código nuevo"** — y a partir de ahí ni el código bueno vale. ✔
5. Pido código, y en la pantalla de verificación pulso **"Reenviar código"**.
   → Llega uno NUEVO a la consola ✔ y el anterior deja de valer (solo entra
   el último). ✔
6. Pido código para un email que NO existe.
   → La web dice lo mismo de siempre (no delata si la cuenta existe) ✔ y
   cualquier código responde "Código incorrecto o caducado". ✔
7. El login con contraseña y el de Google siguen funcionando igual. ✔

---

## PASADA FINAL — Gmail (correo real, cuando todo lo anterior esté en verde)

Preparación: contraseña de aplicación de Google + variables `MAIL_ENABLED=true`,
`MAIL_USER`, `MAIL_PASS`, `MAIL_FROM` + reiniciar el backend.

Compruebo que los **5 tipos de email llegan a mi bandeja real** (el primero
puede caer en spam — es normal):

1. Recuperación de contraseña (login → "¿Has olvidado...?") → llega con su
   botón y el enlace funciona. ✔
2. Confirmación de pedido (hago una compra) → llega con líneas, total y la
   dirección en vertical. ✔
3. Pago recibido (pago con la 4242) → llega. ✔
4. Aviso de stock (stock 0 → apuntarme → reponer) → llega con el botón "Ver el
   producto" y el enlace abre la ficha. ✔
5. Código de login (entrar con código) → llega con los 6 dígitos y entro con
   ellos. ✔

Si sale `Username and Password not accepted` en la consola: la contraseña de
aplicación está mal copiada (¿espacios?) o la cuenta no tiene la verificación
en 2 pasos activa. Si hay timeout al puerto 587: red que lo bloquea (típico en
centros educativos — probar en casa).

---

Con todo lo de arriba en verde, la tienda está completa y verificada de punta
a punta: siguiente parada, el despliegue.
