-- Borrado lógico: "eliminar" un producto lo desactiva en vez de borrarlo,
-- así el historial de pedidos queda intacto y el catálogo público solo
-- muestra los activos.
ALTER TABLE producto
    ADD COLUMN activo BOOLEAN NOT NULL DEFAULT TRUE;
