-- Especificaciones de producto (modelo híbrido):
--  1) Columnas filtrables directas en producto (lo que se usa para buscar).
--  2) Campo JSON 'specs' con la ficha técnica que solo se muestra.
--  3) Catálogo de atributos por categoría, gestionable: define qué campos
--     tiene cada categoría, de qué tipo y con qué opciones, para que el
--     formulario de administración y la ficha se construyan solos.

-- 1) Columnas filtrables en producto -----------------------------------------
ALTER TABLE producto
    ADD COLUMN conexion VARCHAR(20),          -- cable / inalambrico / ambos
    ADD COLUMN peso_g   INTEGER,              -- peso en gramos (para filtrar por ligereza)
    ADD COLUMN rgb      BOOLEAN,              -- tiene iluminación RGB
    ADD COLUMN color    VARCHAR(40);          -- color principal

-- 2) Ficha técnica flexible en JSON (jsonb: indexable y eficiente en Postgres)
ALTER TABLE producto
    ADD COLUMN specs JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 3) Catálogo de atributos por categoría -------------------------------------
-- Cada fila define un atributo que los productos de esa categoría pueden tener.
CREATE TABLE atributo_categoria (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria_id UUID NOT NULL REFERENCES categoria(id) ON DELETE CASCADE,
    -- clave técnica usada en el JSON specs (p. ej. "dpi_max")
    clave        VARCHAR(50) NOT NULL,
    -- etiqueta visible en el formulario y la ficha (p. ej. "DPI máximo")
    etiqueta     VARCHAR(80) NOT NULL,
    -- tipo de dato/control: TEXTO, NUMERO, BOOLEANO, LISTA
    tipo         VARCHAR(20) NOT NULL,
    -- opciones para el tipo LISTA, separadas por '|' (p. ej. "palm|claw|fingertip")
    opciones     VARCHAR(500),
    -- sección de la ficha donde se agrupa (p. ej. "Sensor", "Tamaño y peso")
    seccion      VARCHAR(60),
    -- unidad opcional para mostrar junto al valor (p. ej. "g", "Hz", "mm")
    unidad       VARCHAR(20),
    -- orden de aparición dentro de su sección
    orden        INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT uq_atributo_categoria_clave UNIQUE (categoria_id, clave)
);

CREATE INDEX idx_atributo_categoria ON atributo_categoria(categoria_id);
