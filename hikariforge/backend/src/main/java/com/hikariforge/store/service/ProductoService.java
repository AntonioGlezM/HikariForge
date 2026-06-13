package com.hikariforge.store.service;

import com.hikariforge.store.domain.*;
import com.hikariforge.store.dto.*;
import com.hikariforge.store.exception.RecursoNoEncontradoException;
import com.hikariforge.store.repository.*;
import org.springframework.data.jpa.domain.Specification;
import java.util.List;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

// Lógica de negocio del catálogo. Convierte entre entidades y DTOs y orquesta
// los repositorios. Los controladores solo llaman a estos métodos.
@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;

    public ProductoService(ProductoRepository productoRepository, CategoriaRepository categoriaRepository) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
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
                ProductoSpecs.soloConStock(filtro.enStock()));
        return productoRepository.findAll(spec, pageable).map(this::aResponse);
    }

    // Marcas distintas de los productos activos, para poblar el filtro de marca.
    @Transactional(readOnly = true)
    public List<String> marcas() {
        return productoRepository.findAll(ProductoSpecs.soloActivos()).stream()
                .map(Producto::getMarca).filter(m -> m != null && !m.isBlank())
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
        return aResponse(p);
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
                .stock(req.stock())
                .imagenUrl(req.imagenUrl())
                .categoria(categoria)
                .build();

        return aResponse(productoRepository.save(producto));
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
        producto.setStock(req.stock());
        producto.setImagenUrl(req.imagenUrl());
        producto.setCategoria(categoria);
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
    private ProductoResponse aResponse(Producto p) {
        return new ProductoResponse(
                p.getId(), p.getNombre(), p.getDescripcion(), p.getMarca(),
                p.getPrecio(), p.getStock(), p.getActivo(), p.getImagenUrl(),
                p.getCategoria().getId(), p.getCategoria().getNombre());
    }
}
