-- Fase 5: cupones de descuento porcentual.
CREATE TABLE cupon (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo     VARCHAR(30) NOT NULL UNIQUE,
    porcentaje INT NOT NULL CHECK (porcentaje BETWEEN 1 AND 90),
    activo     BOOLEAN NOT NULL DEFAULT true,
    usos_max   INT,                -- NULL = ilimitado
    usos       INT NOT NULL DEFAULT 0,
    caduca     DATE                -- NULL = no caduca
);

-- El pedido recuerda qué cupón se aplicó y su descuento (congelado).
ALTER TABLE pedido
    ADD COLUMN cupon_codigo  VARCHAR(30),
    ADD COLUMN descuento_pct INT;

-- El 5% de bienvenida que promete la marquesina de la web.
INSERT INTO cupon (codigo, porcentaje) VALUES ('BIENVENIDO5', 5);
