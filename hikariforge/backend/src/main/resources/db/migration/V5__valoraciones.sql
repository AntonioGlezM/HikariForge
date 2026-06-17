-- Valoraciones de productos: una reseña (1-5 estrellas + comentario opcional)
-- por usuario y producto. La restricción UNIQUE evita que alguien valore dos
-- veces el mismo producto (en su lugar, edita la suya).
CREATE TABLE valoracion (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id  UUID NOT NULL REFERENCES producto(id),
    usuario_id   UUID NOT NULL REFERENCES usuario(id),
    estrellas    SMALLINT NOT NULL CHECK (estrellas BETWEEN 1 AND 5),
    comentario   VARCHAR(1000),
    fecha        TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_valoracion_usuario_producto UNIQUE (usuario_id, producto_id)
);
