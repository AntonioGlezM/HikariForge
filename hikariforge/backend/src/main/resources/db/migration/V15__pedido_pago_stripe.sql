-- Fase 3: pago con Stripe Checkout. Guardamos la sesión de pago asociada al
-- pedido y el momento en que se confirmó el pago.
ALTER TABLE pedido
    ADD COLUMN stripe_session_id VARCHAR(120),
    ADD COLUMN pagado_en         TIMESTAMP;
