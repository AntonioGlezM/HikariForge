-- Fase 4: galería de imágenes por URL. La imagen principal sigue siendo
-- producto.imagen_url; esta tabla guarda las adicionales, ordenadas.
CREATE TABLE producto_imagen (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID NOT NULL REFERENCES producto(id) ON DELETE CASCADE,
    url         VARCHAR(500) NOT NULL,
    orden       INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_producto_imagen_producto ON producto_imagen(producto_id, orden);
