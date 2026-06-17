-- Vigencia opcional de la oferta:
--   oferta_hasta            -> fecha/hora límite (NULL = sin fecha límite)
--   oferta_hasta_agotar     -> TRUE si la oferta dura mientras quede stock
-- Si ambos quedan sin definir, la oferta no caduca (comportamiento anterior).
ALTER TABLE producto
    ADD COLUMN oferta_hasta TIMESTAMP,
    ADD COLUMN oferta_hasta_agotar BOOLEAN NOT NULL DEFAULT FALSE;
