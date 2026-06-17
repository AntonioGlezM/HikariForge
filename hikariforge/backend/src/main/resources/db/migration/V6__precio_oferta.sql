-- Precio de oferta opcional. Si es NULL, el producto se vende al precio normal;
-- si tiene valor, ese es el precio rebajado vigente.
ALTER TABLE producto
    ADD COLUMN precio_oferta NUMERIC(10, 2);
