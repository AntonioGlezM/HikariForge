-- Fecha/hora de inicio opcional de la oferta. Si es NULL, la oferta está activa
-- desde el momento en que se define (no está programada a futuro).
ALTER TABLE producto
    ADD COLUMN oferta_desde TIMESTAMP;
