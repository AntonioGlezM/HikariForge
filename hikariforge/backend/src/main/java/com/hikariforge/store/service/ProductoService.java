package com.hikariforge.store.service;

import com.hikariforge.store.domain.*;
import com.hikariforge.store.dto.*;
import com.hikariforge.store.exception.RecursoNoEncontradoException;
import com.hikariforge.store.repository.*;
import org.springframework.data.jpa.domain.Specification;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.UUID;

// Lógica de negocio del catálogo. Convierte entre entidades y DTOs y orquesta
// los repositorios. Los controladores solo llaman a estos métodos.
@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final AtributoCategoriaRepository atributoRepository;
    private final HistorialPrecioRepository historialRepository;
    private final ProductoImagenRepository imagenRepository;
    private final AvisoStockService avisoStockService;

    public ProductoService(ProductoRepository productoRepository, CategoriaRepository categoriaRepository,
                           AtributoCategoriaRepository atributoRepository,
                           HistorialPrecioRepository historialRepository,
                           ProductoImagenRepository imagenRepository,
                           AvisoStockService avisoStockService) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
        this.atributoRepository = atributoRepository;
        this.historialRepository = historialRepository;
        this.imagenRepository = imagenRepository;
        this.avisoStockService = avisoStockService;
    }

    // Catálogo público con filtros combinables (todos opcionales). Siempre
    // restringe a productos activos; el resto de condiciones se añaden si llegan.
    @Transactional(readOnly = true)
    public Page<ProductoResponse> listar(ProductoFiltro filtro, Pageable pageable) {
        Specification<Producto> spec = Specification.allOf(
                ProductoSpecs.soloActivos(),
                ProductoSpecs.texto(filtro.texto()),
                ProductoSpecs.categoria(filtro.categoriaId()),
                ProductoSpecs.marca(filtro.marca()),
                ProductoSpecs.precioMaximo(filtro.precioMax()),
                ProductoSpecs.soloConStock(filtro.enStock()),
                ProductoSpecs.conexion(filtro.conexion()),
                ProductoSpecs.pesoMaximo(filtro.pesoMax()),
                ProductoSpecs.color(filtro.color()),
                ProductoSpecs.conRgb(filtro.rgb()));
        return productoRepository.findAll(spec, pageable).map(this::aResponse);
    }

    // Marcas distintas de los productos activos, para poblar el filtro de marca.
    @Transactional(readOnly = true)
    public List<String> marcas() {
        return productoRepository.findAll(ProductoSpecs.soloActivos()).stream()
                .map(Producto::getMarca).filter(m -> m != null && !m.isBlank())
                .distinct().sorted().toList();
    }

    // Colores distintos de los productos activos, para poblar el filtro de color.
    @Transactional(readOnly = true)
    public List<String> colores() {
        return productoRepository.findAll(ProductoSpecs.soloActivos()).stream()
                .map(Producto::getColor).filter(c -> c != null && !c.isBlank())
                .distinct().sorted().toList();
    }

    // Zona admin: todo el catálogo, incluidos los retirados.
    @Transactional(readOnly = true)
    public Page<ProductoResponse> listarTodos(Pageable pageable) {
        return productoRepository.findAll(pageable).map(this::aResponse);
    }

    @Transactional(readOnly = true)
    public ProductoResponse obtener(UUID id) {
        Producto p = buscar(id);
        if (!p.getActivo()) {
            throw new RecursoNoEncontradoException("Producto no encontrado: " + id);
        }
        // En la ficha sí calculamos el mínimo de 30 días (dato Omnibus).
        return aResponse(p, precioMinimo30dias(id));
    }

    @Transactional
    public ProductoResponse crear(ProductoRequest req) {
        Categoria categoria = categoriaRepository.findById(req.categoriaId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoría no encontrada: " + req.categoriaId()));

        Producto producto = Producto.builder()
                .nombre(req.nombre())
                .descripcion(req.descripcion())
                .marca(req.marca())
                .precio(req.precio())
                .precioOferta(req.precioOferta())
                .ofertaDesde(req.ofertaDesde())
                .ofertaHasta(req.ofertaHasta())
                .ofertaHastaAgotar(Boolean.TRUE.equals(req.ofertaHastaAgotar()))
                .stock(req.stock())
                .imagenUrl(req.imagenUrl())
                .categoria(categoria)
                .conexion(req.conexion())
                .pesoG(req.pesoG())
                .rgb(req.rgb())
                .color(req.color())
                .specs(specsValidadas(req, categoria))
                .build();

        Producto guardado = productoRepository.save(producto);
        registrarPrecio(guardado);   // primer punto del historial de precios
        return aResponse(guardado);
    }

    // Actualiza todos los campos del producto (incluida la categoría).
    @Transactional
    public ProductoResponse actualizar(UUID id, ProductoRequest req) {
        Producto producto = buscar(id);
        Categoria categoria = categoriaRepository.findById(req.categoriaId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoría no encontrada: " + req.categoriaId()));

        producto.setNombre(req.nombre());
        producto.setDescripcion(req.descripcion());
        producto.setMarca(req.marca());
        producto.setPrecio(req.precio());
        producto.setPrecioOferta(req.precioOferta());
        producto.setOfertaDesde(req.ofertaDesde());
        producto.setOfertaHasta(req.ofertaHasta());
        producto.setOfertaHastaAgotar(Boolean.TRUE.equals(req.ofertaHastaAgotar()));
        // Aviso "disponible de nuevo" (Fase 5): si el stock pasa de 0 a >0,
        // se notifica a quienes se apuntaron al aviso.
        boolean estabaAgotado = producto.getStock() != null && producto.getStock() == 0;
        producto.setStock(req.stock());
        if (estabaAgotado && req.stock() != null && req.stock() > 0) {
            avisoStockService.notificarDisponible(producto);
        }
        producto.setImagenUrl(req.imagenUrl());
        BigDecimal precioAntes = producto.getPrecioEfectivo();
        producto.setCategoria(categoria);
        producto.setConexion(req.conexion());
        producto.setPesoG(req.pesoG());
        producto.setRgb(req.rgb());
        producto.setColor(req.color());
        producto.setSpecs(specsValidadas(req, categoria));
        // Registramos en el historial solo si el precio efectivo ha cambiado,
        // para no acumular entradas iguales al editar otros campos (stock, etc.).
        if (precioAntes == null || precioAntes.compareTo(producto.getPrecioEfectivo()) != 0) {
            registrarPrecio(producto);
        }
        return aResponse(producto);
    }

    // Borrado lógico: el producto se retira de la venta pero el historial
    // de pedidos que lo referencia queda intacto.
    @Transactional
    public void eliminar(UUID id) {
        buscar(id).setActivo(false);
    }

    // Vuelve a poner a la venta un producto retirado.
    @Transactional
    public ProductoResponse reactivar(UUID id) {
        Producto p = buscar(id);
        p.setActivo(true);
        return aResponse(p);
    }

    private Producto buscar(UUID id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado: " + id));
    }

    // Mapea la entidad a su DTO de salida.
    /**
     * Valida la ficha técnica (specs) contra el catálogo de atributos de la
     * categoría y devuelve un mapa limpio listo para guardar. Reglas:
     *  - se ignoran claves que no estén definidas para la categoría;
     *  - cada valor debe encajar con el tipo del atributo (número, booleano,
     *    o un valor de la lista de opciones), o se rechaza con un error claro.
     * Esto es lo que impide que se cuele un dato con el tipo equivocado aunque
     * la petición no venga del formulario (p. ej. una llamada directa a la API).
     */
    // Guarda el precio efectivo actual del producto como nueva entrada del historial.
    private void registrarPrecio(Producto p) {
        historialRepository.save(HistorialPrecio.builder()
                .producto(p)
                .precio(p.getPrecioEfectivo())
                .fecha(LocalDateTime.now())
                .build());
    }

    /**
     * Precio más bajo registrado en los últimos 30 días (dato exigido por
     * Omnibus al mostrar un descuento). Null si no hay historial en ese rango.
     */
    @Transactional(readOnly = true)
    public BigDecimal precioMinimo30dias(UUID productoId) {
        return historialRepository.precioMinimoDesde(productoId, LocalDateTime.now().minusDays(30));
    }

    private Map<String, Object> specsValidadas(ProductoRequest req, Categoria categoria) {
        Map<String, Object> entrada = req.specs();
        if (entrada == null || entrada.isEmpty()) return new HashMap<>();

        // Atributos definidos para la categoría, indexados por su clave.
        List<AtributoCategoria> atributos =
                atributoRepository.findByCategoriaIdOrderBySeccionAscOrdenAsc(categoria.getId());
        Map<String, AtributoCategoria> porClave = new HashMap<>();
        for (AtributoCategoria a : atributos) porClave.put(a.getClave(), a);

        Map<String, Object> limpio = new HashMap<>();
        for (Map.Entry<String, Object> e : entrada.entrySet()) {
            AtributoCategoria attr = porClave.get(e.getKey());
            if (attr == null) continue;            // clave no reconocida: se descarta
            Object valor = e.getValue();
            if (valor == null || (valor instanceof String s && s.isBlank())) continue;
            limpio.put(e.getKey(), validarValor(attr, valor));
        }
        return limpio;
    }

    // Comprueba (y normaliza) un valor según el tipo del atributo.
    private Object validarValor(AtributoCategoria attr, Object valor) {
        switch (attr.getTipo()) {
            case NUMERO -> {
                if (valor instanceof Number n) return n;
                try {
                    String s = valor.toString().trim().replace(",", ".");
                    return s.contains(".") ? Double.parseDouble(s) : Long.parseLong(s);
                } catch (NumberFormatException ex) {
                    throw new IllegalArgumentException(
                            "El atributo '" + attr.getEtiqueta() + "' debe ser un número");
                }
            }
            case BOOLEANO -> {
                if (valor instanceof Boolean b) return b;
                String s = valor.toString().trim().toLowerCase();
                if (s.equals("true") || s.equals("false")) return Boolean.parseBoolean(s);
                throw new IllegalArgumentException(
                        "El atributo '" + attr.getEtiqueta() + "' debe ser sí o no");
            }
            case LISTA -> {
                String s = valor.toString().trim();
                List<String> opciones = (attr.getOpciones() == null) ? List.of()
                        : List.of(attr.getOpciones().split("\\|"));
                if (!opciones.isEmpty() && !opciones.contains(s)) {
                    throw new IllegalArgumentException(
                            "Valor no válido para '" + attr.getEtiqueta() + "': " + s);
                }
                return s;
            }
            default -> { return valor.toString().trim(); }   // TEXTO
        }
    }

    // Versión usada en el listado: sin el mínimo de 30 días (evita una consulta por producto).
    private ProductoResponse aResponse(Producto p) {
        return aResponse(p, null);
    }

    // Versión con el precio mínimo de 30 días, para la ficha individual.
    private ProductoResponse aResponse(Producto p, BigDecimal precioMinimo30d) {
        return new ProductoResponse(
                p.getId(), p.getNombre(), p.getDescripcion(), p.getMarca(),
                p.getPrecio(), p.getPrecioOferta(), p.getOfertaDesde(), p.getOfertaHasta(), p.getOfertaHastaAgotar(),
                p.isOfertaVigente(), p.isOfertaProgramada(), p.getStock(), p.getActivo(), p.getImagenUrl(),
                p.getCategoria().getId(), p.getCategoria().getNombre(),
                p.getConexion(), p.getPesoG(), p.getRgb(), p.getColor(), p.getSpecs(),
                precioMinimo30d);
    }

    // ----- Galería de imágenes (Fase 4) -----

    // URLs de la galería de un producto, en su orden.
    public java.util.List<String> galeria(java.util.UUID productoId) {
        return imagenRepository.findByProductoIdOrderByOrden(productoId)
                .stream().map(ProductoImagen::getUrl).toList();
    }

    // Reemplaza la galería completa (zona admin): borra la anterior y guarda
    // las URLs recibidas en orden. Lista vacía = quitar la galería.
    @Transactional
    public java.util.List<String> guardarGaleria(java.util.UUID productoId, java.util.List<String> urls) {
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado"));
        imagenRepository.deleteByProductoId(productoId);
        int orden = 0;
        for (String url : urls) {
            if (url == null || url.isBlank()) continue;
            imagenRepository.save(ProductoImagen.builder()
                    .producto(producto).url(url.trim()).orden(orden++).build());
        }
        return galeria(productoId);
    }
}
