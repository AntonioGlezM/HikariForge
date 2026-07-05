-- Fase 1 del roadmap: el pedido guarda la dirección de envío y datos de entrega.
-- Los pedidos ya existentes quedan con los campos a NULL (histórico sin dirección).
ALTER TABLE pedido
    ADD COLUMN destinatario   VARCHAR(120),
    ADD COLUMN direccion      VARCHAR(200),
    ADD COLUMN ciudad         VARCHAR(80),
    ADD COLUMN provincia      VARCHAR(80),
    ADD COLUMN codigo_postal  VARCHAR(10),
    ADD COLUMN telefono       VARCHAR(20),
    ADD COLUMN notas          VARCHAR(300);
