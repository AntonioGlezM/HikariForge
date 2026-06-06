-- V1: esquema inicial de HikariForge.
-- Los identificadores son UUID (tokens) en lugar de números secuenciales:
-- evita exponer cuántos registros hay y dificulta adivinar/enumerar IDs.
-- gen_random_uuid() es nativo en PostgreSQL 13+ (no requiere extensiones).

CREATE TABLE categoria (
    id     UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE usuario (
    id       UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email    VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,         -- hash BCrypt
    nombre   VARCHAR(255),
    rol      VARCHAR(20)  NOT NULL
);

CREATE TABLE producto (
    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre       VARCHAR(255)   NOT NULL,
    descripcion  VARCHAR(1000),
    marca        VARCHAR(255),
    precio       NUMERIC(10, 2) NOT NULL,
    stock        INTEGER        NOT NULL,
    imagen_url   VARCHAR(512),
    categoria_id UUID           NOT NULL REFERENCES categoria (id)
);

CREATE TABLE pedido (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id  UUID      NOT NULL REFERENCES usuario (id),
    fecha       TIMESTAMP NOT NULL
);

CREATE TABLE linea_pedido (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pedido_id       UUID           NOT NULL REFERENCES pedido (id),
    producto_id     UUID           NOT NULL REFERENCES producto (id),
    cantidad        INTEGER        NOT NULL,
    precio_unitario NUMERIC(10, 2) NOT NULL
);

-- Índices para acelerar las búsquedas más habituales del catálogo.
CREATE INDEX idx_producto_categoria ON producto (categoria_id);
CREATE INDEX idx_producto_nombre    ON producto (LOWER(nombre));
