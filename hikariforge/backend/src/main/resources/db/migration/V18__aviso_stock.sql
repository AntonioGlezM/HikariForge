-- Fase 5: aviso "disponible de nuevo". Guardamos el email de quien quiere que
-- le avisemos cuando un producto agotado vuelva a tener stock.
CREATE TABLE aviso_stock (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID NOT NULL REFERENCES producto(id) ON DELETE CASCADE,
    email       VARCHAR(160) NOT NULL,
    avisado     BOOLEAN NOT NULL DEFAULT false,
    UNIQUE (producto_id, email)
);
