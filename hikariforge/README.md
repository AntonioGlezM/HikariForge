# HikariForge

**HikariForge** es una tienda online de periféricos (ratones, teclados, auriculares,
alfombrillas...). La he construido con **Spring Boot** y está pensada para que la
consuma un frontend SPA independiente (React). Incluye catálogo de productos,
registro/login de usuarios con **JWT**, control de roles (cliente/admin) y
documentación interactiva con **Swagger UI**.

Es un proyecto personal con el que estoy aprendiendo a montar una arquitectura por
capas limpia (entity → repository → service → controller) aplicando buenas prácticas:
DTOs, validación, manejo global de errores, migraciones de base de datos versionadas
y despliegue con Docker. Los identificadores son **UUID** (tokens), no números
secuenciales.

> Elegí el nombre como guiño al stack: *Hikari* (光, "luz") es también el pool de
> conexiones que Spring Boot usa por defecto (HikariCP).

## Stack

| Capa | Tecnología |
|------|------------|
| Lenguaje | Java 21 (LTS) |
| Framework | Spring Boot 3.5 |
| Build | Maven |
| Persistencia | Spring Data JPA + Hibernate |
| Base de datos | PostgreSQL 16 |
| Migraciones | Flyway |
| Seguridad | Spring Security + JWT (jjwt) |
| Documentación | springdoc-openapi (Swagger UI) |
| Contenedores | Docker + Docker Compose |
| Frontend | React + Vite (proyecto aparte en `/frontend`) |

## Estructura

```
hikariforge/
├── backend/                 # API Spring Boot (com.hikariforge.store)
│   ├── src/main/java/com/hikariforge/store/
│   │   ├── config/          # OpenAPI/Swagger
│   │   ├── controller/      # endpoints REST
│   │   ├── service/         # lógica de negocio
│   │   ├── repository/      # acceso a datos (Spring Data JPA)
│   │   ├── domain/          # entidades JPA
│   │   ├── dto/             # objetos de entrada/salida
│   │   ├── security/        # JWT + Spring Security
│   │   └── exception/       # manejo global de errores
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── db/migration/    # scripts de Flyway (V1, V2...)
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                # SPA (ver frontend/README.md)
└── docker-compose.yml
```

## Requisitos previos

- **JDK 21** y **Maven** para arrancar el backend en local, o solo **Docker** si lo levanto todo en contenedores.
- **Node.js 18+** para el frontend.
- Opcional: **pgAdmin** o **DBeaver** para inspeccionar la base de datos.

## Arranque rápido (lo que uso normalmente: Docker)

Levanto la base de datos y la API juntas:

```bash
docker compose up --build
```

- API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

Flyway crea las tablas y carga los datos de ejemplo automáticamente al arrancar.

## Arranque manual (sin Docker para la API)

1. Arranco **PostgreSQL** (por ejemplo, solo la base de datos con Docker):
   ```bash
   docker compose up -d db
   ```
2. Compilo y arranco el backend:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
3. Abro Swagger UI en `http://localhost:8080/swagger-ui.html`.

Datos de conexión a la base de datos (desarrollo):

```
Host: localhost   Puerto: 5432   Base: hikariforge
Usuario: hikariforge   Clave: hikariforge
```

## Probar la API

1. **Registro:** `POST /api/auth/register` con `{ "email": "...", "password": "...", "nombre": "..." }`.
   Devuelve un token JWT.
2. **Login:** `POST /api/auth/login` → devuelve el token.
3. En Swagger, pulso **Authorize** y pego el token para llamar a los endpoints protegidos.
4. **Catálogo (público):** `GET /api/productos`.

> El registro público crea usuarios con rol `CLIENTE`. Para tener un `ADMIN`
> (capaz de crear/borrar productos), cambio el rol de un usuario a `ADMIN`
> directamente en la base de datos.

## Frontend

Las instrucciones están en [`frontend/README.md`](frontend/README.md).

## Documentación del proyecto

En la raíz incluyo un PDF con la explicación detallada del stack, la justificación
de cada decisión técnica y un manual de uso paso a paso.
