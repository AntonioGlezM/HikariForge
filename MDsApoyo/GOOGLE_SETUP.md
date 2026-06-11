# Configurar "Entrar con Google" (una sola vez)

Para que funcione el botón de Google necesito un **Client ID** propio. Lo creo
así (es gratis y se hace con el ratón):

1. Entro en https://console.cloud.google.com y accedo con mi cuenta de Google.
2. Arriba a la izquierda: selector de proyectos → **Nuevo proyecto** →
   nombre `HikariForge` → Crear (y lo selecciono).
3. Menú ☰ → **APIs y servicios → Pantalla de consentimiento de OAuth**:
   - Tipo de usuario: **Externo** → Crear.
   - Nombre de la app: `HikariForge`, mi email en los dos campos de correo →
     Guardar y continuar hasta el final (no hace falta añadir nada más).
4. Menú ☰ → **APIs y servicios → Credenciales → + Crear credenciales →
   ID de cliente de OAuth**:
   - Tipo de aplicación: **Aplicación web**.
   - Nombre: `HikariForge Web`.
   - Orígenes de JavaScript autorizados: añado `http://localhost:5173`
     (y `http://localhost` por si acaso).
   - Crear. Me copio el **ID de cliente** (acaba en `.apps.googleusercontent.com`).
5. Pego ese ID en dos sitios:
   - `frontend/.env` → `VITE_GOOGLE_CLIENT_ID=...`
   - Backend: variable de entorno `GOOGLE_CLIENT_ID` o directamente el valor
     por defecto en `application.yml` (clave `google.client-id`).

## Cómo funciona por dentro

1. El botón oficial de Google (script `accounts.google.com/gsi/client`) abre la
   ventana de Google y devuelve un **idToken** firmado por Google.
2. El frontend lo envía a `POST /api/auth/google`.
3. El backend verifica el token contra Google (endpoint `tokeninfo`), comprueba
   que se emitió para nuestra app (mismo client id), y crea el usuario si no
   existe (rol CLIENTE, contraseña aleatoria).
4. Devuelve **nuestro JWT de siempre**: a partir de ahí la sesión funciona
   exactamente igual que con el login normal.
