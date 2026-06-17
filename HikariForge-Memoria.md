# 光 HikariForge — Memoria del proyecto

**Tienda online de periféricos gaming**

| | |
|---|---|
| **Autor** | Antonio González |
| **Proyecto** | Aplicación web full-stack (e-commerce) |
| **Stack** | Spring Boot · React · PostgreSQL |
| **Última actualización** | 17 de junio de 2026 |

> Documento vivo: se actualiza con cada módulo o funcionalidad nueva que se implementa. Cuando la aplicación llegue a su versión final, se exportará a PDF.

---

## Índice

1. [Descripción de la aplicación](#1-descripción-de-la-aplicación)
2. [Stack tecnológico](#2-stack-tecnológico)
3. [Arquitectura general](#3-arquitectura-general)
4. [Desarrollo por módulos](#4-desarrollo-por-módulos)
5. [Modelo de datos](#5-modelo-de-datos)
6. [Seguridad y autenticación](#6-seguridad-y-autenticación)
7. [Cómo arrancar la aplicación](#7-cómo-arrancar-la-aplicación)

---

## 1. Descripción de la aplicación

HikariForge es una tienda online completa especializada en periféricos gaming (ratones, teclados, auriculares y alfombrillas), construida como aplicación web full-stack.

El proyecto cubre el ciclo completo de una tienda real: un cliente puede navegar por el catálogo, buscar y filtrar productos, consultar fichas detalladas con valoraciones de otros compradores, añadir artículos al carrito, registrarse o iniciar sesión (incluido el acceso con Google), realizar pedidos y seguir su estado de envío. Por su parte, un administrador dispone de un panel propio para gestionar el catálogo, los pedidos y las reseñas.

La identidad visual sigue una estética japonesa moderna —el nombre *Hikari* (光, "luz") y un diseño inspirado en marcas del sector como WLmouse— con soporte para tema claro y oscuro e interfaz bilingüe español/inglés.

### Funcionalidades principales

| Para el cliente | Para el administrador |
|---|---|
| Catálogo con búsqueda y filtros (categoría, marca, precio, stock) | Crear, editar y retirar productos |
| Ficha de producto con valoraciones y productos relacionados | Control de stock con aviso de stock bajo |
| Carrito con cantidades y proceso de compra | Ver todos los pedidos y avanzar su estado |
| Registro/login propio y con Google | Moderar reseñas (borrar contenido abusivo) |
| Perfil, historial de pedidos con seguimiento y favoritos | Reactivar productos retirados |

---

## 2. Stack tecnológico

Esta sección describe brevemente cada tecnología empleada y su papel en el proyecto.

### 2.1. Backend

- **Java 21** — *lenguaje del servidor.* Versión LTS sobre la que se construye toda la API. Se aprovechan características modernas como los *records* (para los DTOs) y los bloques de texto.
- **Spring Boot 3.5** — *framework principal del backend.* Orquesta toda la aplicación de servidor: inyección de dependencias, servidor web embebido, configuración automática y exposición de la API REST.
- **Spring Web (MVC)** — *API REST.* Define los controladores y endpoints HTTP que consume el frontend.
- **Spring Data JPA + Hibernate** — *acceso a datos (ORM).* Mapea las clases Java a tablas y genera las consultas. Se usan repositorios derivados y *Specifications* para los filtros dinámicos.
- **Spring Security + JWT** — *autenticación y autorización.* Protege los endpoints según el rol. Sesión *stateless*: tras el login se emite un token JWT (librería *jjwt*) que el cliente envía en cada petición.
- **Spring Validation** — *validación de datos de entrada* mediante anotaciones en los DTOs.
- **Flyway** — *control de versiones de la base de datos* mediante migraciones numeradas (V1, V2, …) que se aplican automáticamente al arrancar.
- **springdoc-openapi (Swagger UI)** — *documentación interactiva de la API* en `/swagger-ui.html`.
- **Lombok** — *reducción de código repetitivo* (getters, setters, constructores, builders).

### 2.2. Frontend

- **React 18** — *librería de interfaz.* Componentes reutilizables con Hooks (`useState`, `useEffect`, `useContext`).
- **Vite** — *construcción y servidor de desarrollo* con recarga instantánea y empaquetado optimizado.
- **React Router** — *navegación entre páginas* sin recargar, con rutas protegidas por sesión y rol.
- **Axios** — *cliente HTTP.* Centraliza las llamadas; con interceptores adjunta el JWT y gestiona el cierre de sesión al caducar.
- **Context API** — *estado global* (ajustes, sesión, catálogo, carrito y favoritos), sin librerías externas.
- **CSS con variables + Tabler Icons** — *diseño* centralizado en variables (paleta y tema claro/oscuro desde un único bloque).
- **Google Identity Services** — *login con Google* mediante el script oficial.

### 2.3. Base de datos e infraestructura

- **PostgreSQL 16** — *base de datos relacional.* Almacena usuarios, categorías, productos, pedidos y valoraciones. Soporte de UUID e integridad referencial.
- **Docker y Docker Compose** — *contenedores.* Levantan base de datos y API con un solo comando, con entorno idéntico en cualquier máquina.

### 2.4. Herramientas de desarrollo

| Herramienta | Uso |
|---|---|
| Maven | Gestión de dependencias y construcción del backend |
| pnpm | Gestor de paquetes del frontend (más rápido y eficiente que npm) |
| Git / GitHub | Control de versiones del código |
| VS Code | Editor de código |
| pgAdmin | Administración visual de la base de datos PostgreSQL |

---

## 3. Arquitectura general

HikariForge sigue una arquitectura cliente-servidor desacoplada: un frontend en React que se comunica con un backend en Spring Boot mediante una API REST sobre HTTP, intercambiando datos en formato JSON.

```
┌─────────────┐      HTTP/JSON      ┌──────────────┐      JDBC      ┌────────────┐
│   React     │  ───────────────▶  │ Spring Boot  │  ──────────▶  │ PostgreSQL │
│  (Vite)     │  ◀───────────────  │   API REST   │  ◀──────────  │    16      │
└─────────────┘   token JWT        └──────────────┘                └────────────┘
   navegador                          servidor                       base datos
```

El backend se organiza en capas siguiendo buenas prácticas de Spring:

| Capa | Responsabilidad |
|---|---|
| **Controller** | Recibe las peticiones HTTP y devuelve las respuestas. No contiene lógica de negocio. |
| **Service** | Contiene la lógica de negocio y las reglas (validaciones, transacciones). |
| **Repository** | Acceso a la base de datos mediante Spring Data JPA. |
| **Domain** | Las entidades (Producto, Pedido, Usuario, Valoracion…). |
| **DTO** | Objetos de transferencia: definen exactamente qué entra y sale de la API. |

---

## 4. Desarrollo por módulos

Esta sección recorre el proyecto en el orden en que se construyó, desde las primeras clases del backend hasta la última funcionalidad. Cada módulo es una entrega completa y funcional sobre la que se apoya la siguiente.

### Módulo 1 — Cimientos del backend `Backend · Base de datos`

- Creación del proyecto Spring Boot con sus dependencias (Web, JPA, Security, Validation, PostgreSQL, Flyway).
- Primera migración Flyway (V1) con el esquema inicial: tablas de usuario, categoría, producto, pedido y línea de pedido.
- Migración V2 con datos de ejemplo: las cuatro categorías (Ratones, Teclados, Auriculares, Alfombrillas) y productos de muestra.
- Entidades de dominio con identificadores UUID y relaciones JPA entre ellas.

### Módulo 2 — API del catálogo `Backend`

- Repositorio, servicio y controlador de productos siguiendo la arquitectura por capas.
- Endpoints públicos: listado paginado de productos y consulta de un producto por su id.
- DTOs de petición y respuesta para no exponer las entidades directamente.
- Documentación automática de la API con Swagger UI.

### Módulo 3 — Autenticación y seguridad `Backend · Seguridad`

- Registro y login de usuarios con contraseña cifrada mediante BCrypt.
- Generación y validación de tokens JWT; sesión sin estado (stateless).
- Filtro de seguridad que valida el token en cada petición e identifica al usuario.
- Roles CLIENTE y ADMIN; los endpoints de gestión quedan protegidos para administradores.

### Módulo 4 — Diseño de la interfaz (preview) `Frontend · Diseño`

- Maquetación de la página completa en un archivo HTML independiente para iterar el diseño visual.
- Definición de la identidad: estética japonesa (kanji 光), tipografías y paleta de color centralizada en variables CSS.
- Cabecera con mega-menús animados, marquesina de anuncios, buscador y carrito como paneles laterales, y chatbot.
- Tema claro/oscuro y bloques promocionales del home.

### Módulo 5 — Porte del frontend a React `Frontend`

- Traslado de todo el diseño aprobado a componentes React reales conectados a la API.
- Sistema de internacionalización español/inglés con traducción también de las categorías.
- Contextos globales: ajustes (idioma y tema), sesión, catálogo y carrito.
- Cliente Axios centralizado con inyección automática del token JWT.
- Páginas: home, catálogo paginado, ficha de producto, login y registro.

### Módulo 6 — Login con Google `Backend · Frontend`

- Integración del botón oficial de Google Identity Services en login y registro.
- Endpoint que verifica el token de Google contra sus servidores y comprueba que se emitió para la aplicación.
- Creación automática del usuario (rol CLIENTE) la primera vez que entra con Google.
- Emisión del JWT propio de la aplicación, unificando ambos métodos de acceso.

### Módulo 7 — Pedidos y seguimiento `Backend · Frontend`

- Migración V3: estado del pedido (PENDIENTE → PAGADO → ENVIADO → ENTREGADO).
- Proceso de compra: el carrito se convierte en un pedido validando y descontando stock.
- Página "Mis pedidos" con la línea de seguimiento visual del estado.
- El carrito guarda líneas con cantidad (selector −/+) en lugar de productos sueltos.

### Módulo 8 — Perfil y favoritos `Frontend · Backend`

- Página de perfil: edición de nombre y email (con reemisión del token) y cambio de contraseña.
- Menú de cuenta desplegable con acceso a perfil, pedidos, favoritos y administración.
- Lista de favoritos (deseos) persistente, con corazón en cada tarjeta de producto.

### Módulo 9 — Zona de administración `Frontend · Backend`

- Panel de administración con pestañas, accesible solo para usuarios ADMIN.
- Gestión de productos: tabla con buscador, crear/editar mediante formulario, y aviso de stock bajo.
- Gestión de pedidos: listado de todos los pedidos con su cliente y botón para avanzar el estado.
- Endpoint de categorías y de actualización de productos que faltaban en el backend.

### Módulo 10 — Borrado lógico de productos `Backend · Frontend`

- Migración V4: columna `activo` en los productos.
- "Eliminar" ahora retira el producto de la venta sin borrarlo, preservando el historial de pedidos.
- El catálogo público solo muestra productos activos; el admin ve todos y puede reactivarlos.
- Manejo del error de integridad con un mensaje claro en lugar de un error genérico.

### Módulo 11 — Mejoras de experiencia (quick wins) `Frontend`

- Aviso de stock bajo en la ficha del producto ("¡Solo quedan N!").
- Sección de productos relacionados de la misma categoría al final de cada ficha.
- Página de error 404 con la identidad visual de la marca.
- Página de soporte funcional con contacto, FAQ desplegable y garantía.

### Módulo 12 — Filtros y búsqueda en el servidor `Backend · Frontend`

- Filtrado del catálogo trasladado al backend mediante JPA Specifications (consulta dinámica).
- Un único endpoint combina texto, categoría, marca, precio máximo y disponibilidad.
- Buscador lateral que consulta al servidor con retardo (debounce) para no saturarlo.
- Barra de filtros en el catálogo y selector de marcas poblado desde la API.

### Módulo 13 — Valoraciones con estrellas `Backend · Frontend`

- Migración V5: tabla de valoraciones (1-5 estrellas + comentario), con una reseña por usuario y producto.
- Regla de negocio: solo puede valorar quien ha comprado el producto.
- Cálculo de la nota media y listado de reseñas en la ficha; componente de estrellas reutilizable.
- Moderación: el administrador puede ver y borrar cualquier reseña abusiva desde su panel.

### Módulo 14 — Ofertas y descuentos `Backend · Frontend`

- Migración V6: columna `precioOferta` opcional en el producto (NULL = sin oferta).
- Migración V7: vigencia de la oferta — `ofertaHasta` (fecha límite) y `ofertaHastaAgotar` (mientras quede stock).
- Migración V8: `ofertaDesde` (fecha de inicio), que permite programar ofertas a futuro.
- Método de "precio efectivo" en la entidad: aplica el precio de oferta solo si es válido (positivo y menor que el normal) **y está vigente** (ha llegado su fecha de inicio, no ha pasado la de fin y, si es "hasta fin de existencias", queda stock). Es la única fuente de verdad del importe.
- El administrador, desde el formulario de su panel, fija el precio de oferta y elige su duración: sin límite, entre dos fechas (inicio opcional y fin), o hasta fin de existencias.
- En la tienda, los productos de oferta muestran el precio rebajado, el precio anterior tachado y un badge con el porcentaje de descuento (en tarjetas y ficha), además de un aviso de vigencia ("Oferta hasta [fecha]", "¡Hasta fin de existencias!" o "Próximamente" si aún no ha empezado).
- El carrito y los pedidos usan automáticamente el precio efectivo; una oferta programada no se aplica antes de tiempo y una caducada deja de aplicarse sola.

---

## 5. Modelo de datos

La base de datos se compone de seis tablas principales. Todas las claves primarias son de tipo UUID. El esquema se gestiona con migraciones de Flyway (V1 a V8).

| Tabla | Contenido | Relaciones |
|---|---|---|
| **usuario** | Email, contraseña (BCrypt), nombre y rol (CLIENTE/ADMIN) | Tiene pedidos y valoraciones |
| **categoria** | Nombre de la categoría | Agrupa productos |
| **producto** | Nombre, descripción, marca, precio, precio de oferta y su vigencia (inicio/fin/hasta agotar, opcionales), stock, imagen y si está activo | Pertenece a una categoría |
| **pedido** | Fecha y estado del seguimiento | De un usuario; tiene líneas |
| **linea_pedido** | Producto, cantidad y precio en el momento de la compra | Une pedido y producto |
| **valoracion** | Estrellas (1-5), comentario y fecha | De un usuario sobre un producto (única) |

> **Decisión de diseño:** la línea de pedido guarda el precio del producto en el momento de la compra. Así, aunque el precio del producto cambie después, los pedidos antiguos conservan el importe correcto.

---

## 6. Seguridad y autenticación

La autenticación se basa en tokens JWT, lo que permite que el servidor no necesite guardar sesiones (arquitectura *stateless*):

1. El usuario se registra o inicia sesión (con email/contraseña o con Google).
2. El servidor valida las credenciales y emite un token JWT firmado que incluye el email y el rol.
3. El frontend guarda el token y lo adjunta en la cabecera `Authorization` de cada petición.
4. Un filtro de seguridad valida el token en cada llamada y autoriza según el rol.

| Tipo de endpoint | Acceso |
|---|---|
| Ver catálogo, fichas, valoraciones, login/registro | Público |
| Carrito, pedidos, perfil, favoritos, dejar reseña | Usuario autenticado |
| Gestión de productos, pedidos y moderación de reseñas | Solo ADMIN |

> **Buenas prácticas aplicadas:** las contraseñas se almacenan cifradas con BCrypt (nunca en texto plano). Las credenciales sensibles (clave JWT, contraseña de la base de datos, client id de Google) se leen de variables de entorno y no se incluyen en el código del repositorio.

---

## 7. Cómo arrancar la aplicación

Hay dos formas de poner en marcha el proyecto. **Con Docker** es la más sencilla y recomendada; **sin Docker** ofrece más control y es útil durante el desarrollo.

### 7.1. Con Docker (recomendado)

Requisito: tener instalado **Docker Desktop**. Este método levanta la base de datos y la API juntas con un solo comando; no hace falta instalar Java ni PostgreSQL.

**Paso 1 — Levantar base de datos y API.** Desde la carpeta raíz del proyecto (donde está `docker-compose.yml`):

```bash
docker compose up --build
```

Esto arranca PostgreSQL, espera a que esté listo, construye la API y aplica automáticamente las migraciones de Flyway (crea las tablas y los datos de ejemplo). La API queda disponible en `http://localhost:8080`.

**Paso 2 — Arrancar el frontend.** El frontend se ejecuta aparte. En otra terminal:

```bash
# dentro de la carpeta frontend/
pnpm install
pnpm dev
```

La tienda se abre en `http://localhost:5173`.

> **Para detenerlo:** `Ctrl + C` en la terminal de Docker, y `docker compose down` para eliminar los contenedores. Los datos se conservan gracias al volumen `pgdata`.

### 7.2. Sin Docker

Requisitos: **Java 21**, **Maven**, **PostgreSQL 16** y **Node.js con pnpm** instalados.

**Paso 1 — Crear la base de datos.** En PostgreSQL (por ejemplo desde pgAdmin):

```sql
CREATE DATABASE hikariforge;
CREATE USER hikariforge WITH PASSWORD 'hikariforge';
GRANT ALL PRIVILEGES ON DATABASE hikariforge TO hikariforge;
```

**Paso 2 — Configurar y arrancar el backend.** El backend lee la configuración de variables de entorno (con valores por defecto para desarrollo local). Si se usan los datos de arriba, no hace falta cambiar nada. Desde la carpeta `backend/`:

```bash
# Linux / Mac
./mvnw spring-boot:run

# Windows
mvnw spring-boot:run
```

Flyway crea las tablas y los datos de ejemplo en el primer arranque. La API queda en `http://localhost:8080` (documentación en `/swagger-ui.html`).

> **Variables de entorno disponibles:** `DB_URL`, `DB_USER`, `DB_PASSWORD` (conexión a la base de datos), `JWT_SECRET` (clave de firma de los tokens) y `GOOGLE_CLIENT_ID` (para el login con Google). Si no se definen, se usan los valores por defecto de desarrollo.

**Paso 3 — Arrancar el frontend.** Desde la carpeta `frontend/`, crear un archivo `.env` a partir de `.env.example` y luego:

```bash
pnpm install
pnpm dev
```

Disponible en `http://localhost:5173`.

### 7.3. Cuentas y credenciales

**Credenciales de la base de datos (desarrollo):**

| Dato | Valor por defecto |
|---|---|
| Base de datos | hikariforge |
| Usuario | hikariforge |
| Contraseña | hikariforge |
| Puerto | 5432 |

**Cuentas de la aplicación.** La aplicación **no incluye usuarios predefinidos**: las cuentas se crean mediante el registro. Para disponer de acceso de cliente y de administrador:

1. **Crear una cuenta de cliente** — desde la propia web, en "Crear cuenta", con cualquier email y contraseña (o con el botón de Google). Esta cuenta tiene rol CLIENTE por defecto y sirve para probar la compra, los pedidos y las valoraciones.

2. **Convertir una cuenta en administrador** — como no hay un admin por defecto, se promociona una cuenta ya registrada cambiando su rol directamente en la base de datos:

```sql
UPDATE usuario SET rol = 'ADMIN' WHERE email = 'tu-email@ejemplo.com';
```

Después es necesario **cerrar sesión y volver a entrar** en la web, ya que el rol viaja dentro del token JWT y el token anterior seguiría teniendo el rol antiguo. A partir de ahí, el menú de la cuenta mostrará el acceso a la zona de administración.

> **Seguridad:** todas las credenciales de esta sección son valores de **desarrollo local**. En un despliegue real deben sustituirse por credenciales robustas y definirse mediante variables de entorno, nunca escribirse en el código ni subirse a un repositorio público. Esto aplica especialmente a la clave `JWT_SECRET` y a la contraseña de la base de datos.

**Resumen de URLs:**

| Servicio | URL |
|---|---|
| Tienda (frontend) | http://localhost:5173 |
| API (backend) | http://localhost:8080 |
| Documentación de la API (Swagger) | http://localhost:8080/swagger-ui.html |
