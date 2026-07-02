-- Amplía el catálogo de atributos para la presentación tipo tienda real:
--  - icono: nombre de icono (Tabler Icons) que se muestra junto al atributo
--           en la cabecera de specs destacadas de la ficha.
--  - destacado: si el atributo aparece en esa cabecera (los "importantes").
ALTER TABLE atributo_categoria
    ADD COLUMN icono     VARCHAR(40),
    ADD COLUMN destacado BOOLEAN NOT NULL DEFAULT false;

-- Iconos y destacados por defecto para los atributos ya sembrados (V10).
-- Ratones
UPDATE atributo_categoria SET icono = 'device-desktop-analytics', destacado = true  WHERE clave = 'sensor';
UPDATE atributo_categoria SET icono = 'crosshair',                destacado = true  WHERE clave = 'dpi_max';
UPDATE atributo_categoria SET icono = 'activity',                 destacado = true  WHERE clave = 'tasa_sondeo_hz';
UPDATE atributo_categoria SET icono = 'hand-finger',              destacado = true  WHERE clave = 'grip';
UPDATE atributo_categoria SET icono = 'mouse',                    destacado = false WHERE clave = 'botones';
UPDATE atributo_categoria SET icono = 'ruler-2',                  destacado = false WHERE clave IN ('ancho_mm','largo_mm','alto_mm');
UPDATE atributo_categoria SET icono = 'battery-charging',         destacado = true  WHERE clave = 'autonomia_h';
-- Teclados
UPDATE atributo_categoria SET icono = 'keyboard',     destacado = true  WHERE clave = 'switch';
UPDATE atributo_categoria SET icono = 'layout-grid',  destacado = true  WHERE clave = 'formato';
UPDATE atributo_categoria SET icono = 'switch-3',     destacado = true  WHERE clave = 'hotswap';
UPDATE atributo_categoria SET icono = 'ruler-2',      destacado = false WHERE clave = 'dimensiones';
-- Auriculares
UPDATE atributo_categoria SET icono = 'headphones',   destacado = true  WHERE clave = 'tipo';
UPDATE atributo_categoria SET icono = 'wave-sine',    destacado = true  WHERE clave = 'sonido';
UPDATE atributo_categoria SET icono = 'wave-square',  destacado = false WHERE clave = 'impedancia_ohm';
UPDATE atributo_categoria SET icono = 'microphone',   destacado = true  WHERE clave = 'microfono';
-- Alfombrillas
UPDATE atributo_categoria SET icono = 'dimensions',   destacado = true  WHERE clave = 'tamano';
UPDATE atributo_categoria SET icono = 'texture',      destacado = true  WHERE clave = 'superficie';
UPDATE atributo_categoria SET icono = 'ruler-2',      destacado = false WHERE clave = 'grosor_mm';
UPDATE atributo_categoria SET icono = 'border-all',   destacado = false WHERE clave = 'bordes_cosidos';
