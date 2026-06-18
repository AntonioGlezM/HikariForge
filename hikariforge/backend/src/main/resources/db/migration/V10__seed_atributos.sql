-- Siembra el catálogo de atributos para las cuatro categorías iniciales.
-- Usa los nombres de categoría ya existentes (V2). Si una categoría no existe,
-- su bloque simplemente no inserta nada (el subselect no devuelve id).
-- A partir de aquí, añadir atributos o categorías nuevas se hace desde el admin.

-- Ratones --------------------------------------------------------------------
INSERT INTO atributo_categoria (categoria_id, clave, etiqueta, tipo, opciones, seccion, unidad, orden)
SELECT c.id, v.clave, v.etiqueta, v.tipo, v.opciones, v.seccion, v.unidad, v.orden
FROM categoria c
JOIN (VALUES
    ('sensor',         'Sensor',          'TEXTO',    NULL,                    'Sensor',          NULL,  1),
    ('dpi_max',        'DPI máximo',      'NUMERO',   NULL,                    'Sensor',          'dpi', 2),
    ('tasa_sondeo_hz', 'Tasa de sondeo',  'NUMERO',   NULL,                    'Sensor',          'Hz',  3),
    ('grip',           'Tipo de agarre',  'LISTA',    'palm|claw|fingertip',   'Ergonomía',       NULL,  4),
    ('botones',        'Nº de botones',   'NUMERO',   NULL,                    'Ergonomía',       NULL,  5),
    ('ancho_mm',       'Ancho',           'NUMERO',   NULL,                    'Tamaño y peso',   'mm',  6),
    ('largo_mm',       'Largo',           'NUMERO',   NULL,                    'Tamaño y peso',   'mm',  7),
    ('alto_mm',        'Alto',            'NUMERO',   NULL,                    'Tamaño y peso',   'mm',  8),
    ('autonomia_h',    'Autonomía',       'NUMERO',   NULL,                    'Batería',         'h',   9)
) AS v(clave, etiqueta, tipo, opciones, seccion, unidad, orden) ON TRUE
WHERE c.nombre = 'Ratones';

-- Teclados -------------------------------------------------------------------
INSERT INTO atributo_categoria (categoria_id, clave, etiqueta, tipo, opciones, seccion, unidad, orden)
SELECT c.id, v.clave, v.etiqueta, v.tipo, v.opciones, v.seccion, v.unidad, v.orden
FROM categoria c
JOIN (VALUES
    ('switch',       'Tipo de switch',  'TEXTO',   NULL,                'Teclas',        NULL, 1),
    ('formato',      'Formato',         'LISTA',   '60%|65%|TKL|Full',  'Teclas',        NULL, 2),
    ('hotswap',      'Hot-swap',        'BOOLEANO',NULL,                'Teclas',        NULL, 3),
    ('autonomia_h',  'Autonomía',       'NUMERO',  NULL,                'Conectividad',  'h',  4),
    ('dimensiones',  'Dimensiones',     'TEXTO',   NULL,                'Tamaño',        NULL, 5)
) AS v(clave, etiqueta, tipo, opciones, seccion, unidad, orden) ON TRUE
WHERE c.nombre = 'Teclados';

-- Auriculares ----------------------------------------------------------------
INSERT INTO atributo_categoria (categoria_id, clave, etiqueta, tipo, opciones, seccion, unidad, orden)
SELECT c.id, v.clave, v.etiqueta, v.tipo, v.opciones, v.seccion, v.unidad, v.orden
FROM categoria c
JOIN (VALUES
    ('tipo',          'Tipo',          'LISTA',    'abierto|cerrado|in-ear', 'Audio',      NULL,  1),
    ('sonido',        'Sonido',        'LISTA',    'estéreo|7.1',            'Audio',      NULL,  2),
    ('impedancia_ohm','Impedancia',    'NUMERO',   NULL,                     'Audio',      'Ω',   3),
    ('microfono',     'Micrófono',     'BOOLEANO', NULL,                     'Micrófono',  NULL,  4),
    ('autonomia_h',   'Autonomía',     'NUMERO',   NULL,                     'Batería',    'h',   5)
) AS v(clave, etiqueta, tipo, opciones, seccion, unidad, orden) ON TRUE
WHERE c.nombre = 'Auriculares';

-- Alfombrillas ---------------------------------------------------------------
INSERT INTO atributo_categoria (categoria_id, clave, etiqueta, tipo, opciones, seccion, unidad, orden)
SELECT c.id, v.clave, v.etiqueta, v.tipo, v.opciones, v.seccion, v.unidad, v.orden
FROM categoria c
JOIN (VALUES
    ('tamano',         'Tamaño',        'LISTA',    'S|M|L|XL|XXL',  'Físico', NULL, 1),
    ('superficie',     'Superficie',    'LISTA',    'tela|rígida',   'Físico', NULL, 2),
    ('grosor_mm',      'Grosor',        'NUMERO',   NULL,            'Físico', 'mm', 3),
    ('bordes_cosidos', 'Bordes cosidos','BOOLEANO', NULL,            'Físico', NULL, 4)
) AS v(clave, etiqueta, tipo, opciones, seccion, unidad, orden) ON TRUE
WHERE c.nombre = 'Alfombrillas';
