-- Fase 2: tokens de un solo uso para restablecer la contraseña por email.
-- Cada token caduca a los 45 minutos y se marca como usado al consumirse.
CREATE TABLE password_reset_token (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    token      VARCHAR(64) NOT NULL UNIQUE,
    expira     TIMESTAMP NOT NULL,
    usado      BOOLEAN NOT NULL DEFAULT false
);

-- Búsqueda por token (el enlace del correo lo trae).
CREATE INDEX idx_prt_token ON password_reset_token(token);
