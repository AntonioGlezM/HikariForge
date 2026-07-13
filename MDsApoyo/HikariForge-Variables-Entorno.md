# Variables de entorno y archivos .env — guía de HikariForge

En este documento explico qué son las variables de entorno, cómo funcionan los
archivos `.env`, y hago el inventario completo de todas las variables que usa
mi API de HikariForge: qué hace cada una, de dónde saco su valor y por qué está
ahí. El objetivo es entender el mecanismo de verdad, para poder aplicarlo en
cualquier otra aplicación.

Fecha: 7 de julio de 2026.

---

## 1. ¿Qué es una variable de entorno?

Una variable de entorno es un **par nombre = valor que el sistema operativo le
entrega a un programa cuando arranca**. No vive en el código ni en un archivo
del proyecto: vive en el *entorno* del proceso.

La analogía que me sirve: mi aplicación es una receta de cocina, y las
variables de entorno son los ingredientes que hay en la despensa de cada casa.
La receta (el código) es siempre la misma; lo que cambia según dónde se cocine
(mi portátil, el ordenador de clase, un servidor en producción) son los
ingredientes concretos: qué base de datos usar, qué clave de Stripe, qué correo.

Todo proceso las tiene. Si abro Git Bash y escribo `env`, veo decenas que ya
existen (`PATH`, `HOME`, `USERNAME`...). Cuando arranco mi backend, Java recibe
todas las del sistema **más las que yo añada** para esa ejecución.

## 2. ¿Para qué sirven? Las tres razones

**1. Separar la configuración del código.** El código dice *"conéctate a la
base de datos que te digan"*; la variable dice *cuál*. Así el MISMO código
(el mismo `.jar`, la misma imagen Docker) funciona en desarrollo, en el
ordenador de un compañero y en producción, sin tocar una línea. Este principio
es tan importante que tiene nombre en la industria: es el factor III de la
metodología "The Twelve-Factor App".

**2. Mantener los secretos fuera de Git.** Una clave de Stripe o una contraseña
de Gmail escritas en el código acabarían en GitHub a la vista de cualquiera
(hay bots escaneando repositorios públicos buscando exactamente eso, 24/7).
Las variables de entorno viven fuera del repositorio: el código solo conoce el
*nombre* de la variable, nunca el valor.

**3. Cambiar el comportamiento sin recompilar.** Mi `MAIL_ENABLED` es el
ejemplo perfecto: la misma aplicación imprime los correos en consola o los
envía de verdad según una variable. Un interruptor externo.

## 3. Cómo las lee mi stack

### Spring Boot (backend)

En mi `application.yml` uso la sintaxis `${NOMBRE:valor_por_defecto}`:

```yaml
datasource:
  url: ${DB_URL:jdbc:postgresql://localhost:5432/hikariforge}
```

Se lee así: *"usa la variable de entorno `DB_URL`; si no existe, usa lo que hay
después de los dos puntos"*. Este patrón de **valores por defecto pensados para
desarrollo local** es lo que hace que mi proyecto arranque en cualquier máquina
sin configurar nada, y a la vez esté listo para producción: allí defino las
variables y los defaults dejan de usarse.

Detalle útil: Spring no solo mira variables de entorno; tiene un orden de
prioridad (propiedades de línea de comandos > variables de entorno > el
application.yml...). Para mi día a día basta con saber que **la variable de
entorno gana al valor por defecto del yml**.

### Vite/React (frontend)

El frontend también tiene variables, pero con dos reglas propias:

- Solo ve las que empiezan por **`VITE_`**, y se leen con
  `import.meta.env.VITE_LO_QUE_SEA`. En mi proyecto:
  `VITE_API_URL` (en `api/client.js`) y `VITE_GOOGLE_CLIENT_ID`
  (en `GoogleButton.jsx`).
- **Se incrustan en el JavaScript en el momento del build.** Esto tiene una
  consecuencia de seguridad enorme: cualquier variable del frontend acaba
  visible en el navegador de cualquiera (basta abrir las DevTools). Por eso
  **JAMÁS se pone un secreto en una variable del frontend**. La clave SECRETA
  de Stripe va en el backend; el client ID de Google puede ir en el frontend
  porque es un identificador público por diseño.

Esta distinción backend/frontend es la lección más importante del documento:
**backend = puede guardar secretos · frontend = todo es público**.

## 4. Cómo se definen (todas las formas que uso)

**Para una sesión de terminal (Git Bash):**
```bash
export STRIPE_SECRET_KEY=sk_test_xxx
./mvnw spring-boot:run
```
Vale solo para esa ventana de terminal; al cerrarla, desaparece. En PowerShell
sería `$env:STRIPE_SECRET_KEY="sk_test_xxx"`.

**Solo para un comando (Git Bash/Linux):**
```bash
STRIPE_SECRET_KEY=sk_test_xxx ./mvnw spring-boot:run
```

**En el IDE:** en IntelliJ, Run → Edit Configurations → Environment variables
(formato `VAR1=valor1;VAR2=valor2`). En VS Code, en el `launch.json` con el
bloque `"env": { "VAR": "valor" }`. Es la forma más cómoda en desarrollo:
quedan guardadas en la configuración de arranque.

**Permanentes en Windows:** Configuración → "Editar las variables de entorno
del sistema". Las verán todos los programas siempre. Útil para cosas como el
PATH; para secretos de proyectos prefiero las otras formas.

**En Docker Compose:** con el bloque `environment:` de cada servicio — así lo
hace mi `docker-compose.yml`, que le pasa `DB_URL`, `DB_USER`, `DB_PASSWORD` y
`JWT_SECRET` al contenedor de la API, y las `POSTGRES_*` al de la base de
datos (esas las define la imagen oficial de Postgres, no yo).

## 5. Los archivos .env — y una verdad incómoda

Un `.env` es simplemente un archivo de texto con líneas `NOMBRE=valor`. Es una
**convención**, no un estándar del sistema: el sistema operativo NO lo lee.
**Alguien tiene que cargarlo**, y aquí está la clave que mucha gente no sabe:

- **Vite SÍ lo lee automáticamente**: si creo `frontend/.env` con
  `VITE_API_URL=...`, el frontend lo usa sin hacer nada más.
- **Docker Compose SÍ lo lee** (el `.env` junto al `docker-compose.yml`) para
  sustituir `${VARIABLES}` dentro del propio yml.
- **Spring Boot NO lo lee por sí solo.** Mi `backend/.env` no llega a la
  aplicación por arte de magia: si arranco con el Run del IDE, ese archivo se
  ignora salvo que use un plugin (como "EnvFile" en IntelliJ) o cargue las
  variables a mano.

Entonces, ¿para qué tengo un `backend/.env`? Dos usos legítimos: como **fuente
que cargo a mano en la terminal** cuando quiero arrancar con todo definido:

```bash
export $(grep -v '^#' .env | xargs)   # carga todas las líneas del .env
./mvnw spring-boot:run
```

y como **documentación viva** de qué variables existen. Para ese segundo papel
existe el `.env.example`: la plantilla **sin valores reales** que SÍ se sube a
Git, para que cualquiera que clone el proyecto sepa qué variables tiene que
rellenar (copiándola como `.env` y completándola).

La regla de oro, que mi proyecto ya cumple: **`.env` está en el `.gitignore`**
(línea 6 del mío) y **`.env.example` se sube**. El primero tiene secretos; el
segundo, solo los nombres.

## 6. Inventario completo de HikariForge

### Vista rápida

| Variable | Lado | ¿Obligatoria? | Para qué |
|---|---|---|---|
| `DB_URL` | Backend | No (default: localhost) | Dónde está PostgreSQL |
| `DB_USER` | Backend | No | Usuario de la base de datos |
| `DB_PASSWORD` | Backend | No | Contraseña de la base de datos |
| `JWT_SECRET` | Backend | En producción, SÍ | Firma de los tokens de sesión |
| `STRIPE_SECRET_KEY` | Backend | Solo para cobrar | Clave secreta de Stripe |
| `MAIL_ENABLED` | Backend | No (default: false) | Interruptor de correo real |
| `MAIL_USER` | Backend | Si MAIL_ENABLED | Cuenta que envía los correos |
| `MAIL_PASS` | Backend | Si MAIL_ENABLED | Contraseña de aplicación de Gmail |
| `MAIL_FROM` | Backend | No | Remitente que ve el cliente |
| `MAIL_HOST` / `MAIL_PORT` | Backend | No (Gmail por defecto) | Servidor SMTP |
| `FRONTEND_URL` | Backend | En producción, SÍ | Base de los enlaces de los emails |
| `GOOGLE_CLIENT_ID` | Backend | No (default en el yml) | Verificar el login con Google |
| `VITE_API_URL` | Frontend | En producción, SÍ | Dónde está mi API |
| `VITE_GOOGLE_CLIENT_ID` | Frontend | Para el botón de Google | Client ID público de Google |

### Una a una

**`DB_URL`, `DB_USER`, `DB_PASSWORD`** — la conexión a PostgreSQL. Los
defaults del yml apuntan a mi base de datos local de Docker
(`localhost:5432/hikariforge`, usuario `hikariforge`), así que en desarrollo no
defino nada. Dentro de `docker-compose.yml` la URL cambia a `db:5432` — porque
entre contenedores el "localhost" de uno no es el del otro: se hablan por el
nombre del servicio. En el despliegue, el proveedor (Railway, Render...) me
dará estos tres valores de su PostgreSQL gestionado. *Cómo conseguirlas: en
local, las inventé yo al montar el docker-compose; en producción, las da el
proveedor de la base de datos.*

**`JWT_SECRET`** — la clave con la que el backend **firma** los tokens de
sesión. Quien conozca esta clave puede fabricarse un token de administrador,
así que es el secreto más crítico de toda la aplicación. El default del yml
solo vale para desarrollo; en producción es OBLIGATORIO poner una clave propia,
larga (32+ caracteres) y aleatoria. *Cómo conseguirla: se genera, no se pide a
nadie. En Git Bash: `openssl rand -base64 48` y copio el resultado.*

**`STRIPE_SECRET_KEY`** — la clave SECRETA de Stripe (empieza por `sk_test_`
en modo test, `sk_live_` en real). Con ella mi backend crea las sesiones de
pago y verifica los cobros. Si está vacía, el pago queda desactivado con
elegancia (los pedidos se quedan pendientes). Nunca debe verse en el frontend
ni en Git. *Cómo conseguirla: cuenta gratuita en stripe.com → modo Test →
Developers → API keys → Secret key.*

**`MAIL_ENABLED`** — el interruptor del correo: `false` (default) imprime los
emails en la consola del backend (perfecto para desarrollar); `true` los envía
de verdad por SMTP. *Cómo conseguirla: la decido yo — true o false.*

**`MAIL_USER` y `MAIL_PASS`** — las credenciales SMTP. Con Gmail, `MAIL_USER`
es mi dirección y `MAIL_PASS` NO es mi contraseña normal (Google la rechaza
por seguridad), sino una **contraseña de aplicación** de 16 letras. *Cómo
conseguirla: myaccount.google.com → Seguridad → activar Verificación en 2
pasos → "Contraseñas de aplicaciones" → crear una para HikariForge → copiar
las 16 letras sin espacios. Es revocable en cualquier momento.*

**`MAIL_FROM`** — el remitente que ve el cliente, en formato
`Nombre <correo>`. Con Gmail, el correo real siempre será mi cuenta (Gmail lo
reescribe), pero el nombre visible sí se respeta. *La decido yo.*

**`MAIL_HOST` y `MAIL_PORT`** — el servidor SMTP. Los defaults ya son Gmail
(`smtp.gmail.com:587`), así que solo las tocaría si usara otro proveedor
(Outlook, Brevo, Resend...).

**`FRONTEND_URL`** — la base con la que el backend construye los **enlaces que
van dentro de los correos** (restablecer contraseña, ver producto disponible) y
las URLs de retorno de Stripe. En desarrollo el default `http://localhost:5173`
es correcto; en producción, si no la cambio por mi dominio real, ¡los correos
llevarían enlaces a localhost! *La decido yo: la URL pública del frontend.*

**`GOOGLE_CLIENT_ID`** — el identificador de mi aplicación en Google, con el
que el backend verifica que los tokens del botón "Entrar con Google" son
auténticos y para MI app. Es un dato público por diseño (viaja al navegador),
por eso no es grave que tenga default en el yml — pero como buena práctica lo
sobreescribiría por variable si creara otra app de Google para producción.
*Cómo conseguirla: console.cloud.google.com → crear proyecto → APIs y
servicios → Credenciales → ID de cliente de OAuth.*

**`VITE_API_URL`** (frontend) — dónde está mi API. En desarrollo el default
`http://localhost:8080/api` funciona; en el despliegue crearé un
`frontend/.env.production` con la URL real del backend. Recordatorio: se
incrusta en el build, así que cambiarla exige recompilar el frontend.

**`VITE_GOOGLE_CLIENT_ID`** (frontend) — el mismo client ID de Google, para
que el botón de Google sepa a qué app pertenece. Público, como todo lo del
frontend.

## 7. Buenas prácticas y errores típicos (mi chuleta)

- **Secreto = backend + variable de entorno + gitignore.** Sin excepciones.
- **`.env.example` siempre al día**: cada variable nueva que invento, la añado
  ahí (sin valor) para que el proyecto sea clonable por otros. Debería añadirle
  las que faltan: MAIL_*, STRIPE_SECRET_KEY, FRONTEND_URL.
- **Defaults de desarrollo en el yml, valores reales por variable**: el patrón
  `${VAR:default}` es lo que hace que `git clone` + arrancar funcione.
- Si subo un secreto a Git por error, **cambiarlo/revocarlo inmediatamente**
  (no basta con borrar el commit: el historial de Git recuerda).
- Error típico 1: definir la variable en una terminal y arrancar desde OTRA
  (o desde el IDE) — cada proceso tiene su entorno; la variable debe definirse
  donde arranco la app.
- Error típico 2: cambiar una variable y no reiniciar el backend — se leen AL
  ARRANCAR, no en caliente.
- Error típico 3: esperar que Spring lea el `.env` solo. No lo hace: o plugin
  del IDE, o `export $(grep -v '^#' .env | xargs)`, o variables en la
  configuración de Run.
- Error típico 4 (el peor): poner un secreto en una variable `VITE_` del
  frontend. Todo lo del frontend es público.

## 8. Para llevarme a otras aplicaciones

El patrón es universal y lo veré en todos los lenguajes: **el código lee
nombres, el entorno pone los valores**. En Node es `process.env.MI_VAR` (con la
librería dotenv para cargar `.env`), en Python `os.environ` (con python-dotenv),
en PHP `getenv()`... Y en cualquier plataforma de despliegue (Railway, Render,
Vercel, AWS) hay un panel de "Environment variables" donde se definen — ese
panel es, precisamente, el `.env` de producción: mismo concepto, gestionado por
el proveedor.
