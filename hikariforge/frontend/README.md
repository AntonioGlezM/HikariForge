# Frontend de HikariForge (SPA)

Esta es la Single Page Application que consume mi API REST de HikariForge.
Stack: **React + Vite**.

> Importante: en este proyecto uso **pnpm** siempre, nunca npm.
> Si no lo tengo instalado, lo activo con Corepack (viene con Node, sin usar npm): `corepack enable pnpm`.

## Crear el proyecto

```bash
cd frontend
pnpm create vite . --template react
pnpm install
pnpm add axios react-router-dom
```

## Configuración

Creo un fichero `.env` con la URL de la API:

```
VITE_API_URL=http://localhost:8080/api
```

## Arrancar en desarrollo

```bash
pnpm dev
```

Por defecto Vite sirve en `http://localhost:5173`, que es el origen que tengo
permitido en la configuración CORS del backend (`SecurityConfig`).

## Cómo voy a organizarlo

```
src/
├── api/          # cliente axios y llamadas a la API (productos, auth...)
├── components/   # componentes reutilizables (Card, Navbar...)
├── pages/        # vistas (Catálogo, Login, Carrito, Pedido...)
├── context/      # estado global (sesión/token, carrito)
└── App.jsx
```

El token JWT que devuelve `/api/auth/login` lo guardo en el cliente y lo envío
en cada petición protegida con la cabecera `Authorization: Bearer <token>`.
Como los IDs de la API son UUID (tokens), las rutas del frontend serán del tipo
`/producto/:id` con ese UUID, no con números.
