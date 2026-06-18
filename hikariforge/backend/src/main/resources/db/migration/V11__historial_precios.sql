-- Historial de precios para cumplir la directiva Omnibus de la UE: al anunciar
-- un descuento hay que mostrar el precio más bajo de los últimos 30 días.
-- Cada fila registra el precio EFECTIVO (con oferta si la había) en el momento
-- en que el precio del producto cambió.
CREATE TABLE historial_precio (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID NOT NULL REFERENCES producto(id) ON DELETE CASCADE,
    precio      NUMERIC(10, 2) NOT NULL,
    fecha       TIMESTAMP NOT NULL DEFAULT now()
);

-- Índice para consultar rápido el mínimo de los últimos 30 días por producto.
CREATE INDEX idx_historial_precio_producto_fecha ON historial_precio(producto_id, fecha);

-- Sembramos una primera entrada con el precio efectivo actual de cada producto,
-- para que el historial arranque con un punto de partida.
INSERT INTO historial_precio (producto_id, precio, fecha)
SELECT id,
       CASE WHEN precio_oferta IS NOT NULL AND precio_oferta > 0 AND precio_oferta < precio
            THEN precio_oferta ELSE precio END,
       now()
FROM producto;
