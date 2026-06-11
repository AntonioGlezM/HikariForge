-- Estado del pedido para el seguimiento (PENDIENTE -> PAGADO -> ENVIADO -> ENTREGADO).
ALTER TABLE pedido
    ADD COLUMN estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE';
