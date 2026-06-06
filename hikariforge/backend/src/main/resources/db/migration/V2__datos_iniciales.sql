-- V2: datos de ejemplo para el catálogo (categorías y productos).
-- Los usuarios se crean a través de POST /api/auth/register.

INSERT INTO categoria (nombre) VALUES
    ('Ratones'),
    ('Teclados'),
    ('Auriculares'),
    ('Alfombrillas');

INSERT INTO producto (nombre, descripcion, marca, precio, stock, imagen_url, categoria_id) VALUES
    ('Ratón gaming Pro X', 'Sensor óptico 25K DPI, inalámbrico', 'Logitech', 89.99, 40,
        NULL, (SELECT id FROM categoria WHERE nombre = 'Ratones')),
    ('Teclado mecánico TKL', 'Switches rojos, retroiluminación RGB', 'Keychron', 109.50, 25,
        NULL, (SELECT id FROM categoria WHERE nombre = 'Teclados')),
    ('Auriculares 7.1', 'Sonido envolvente, micrófono retráctil', 'HyperX', 74.90, 30,
        NULL, (SELECT id FROM categoria WHERE nombre = 'Auriculares')),
    ('Alfombrilla XXL', 'Superficie de tela, base antideslizante', 'Razer', 24.99, 100,
        NULL, (SELECT id FROM categoria WHERE nombre = 'Alfombrillas'));
