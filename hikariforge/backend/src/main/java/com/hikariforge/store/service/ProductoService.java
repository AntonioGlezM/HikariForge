package com.hikariforge.store.service;

import com.hikariforge.store.domain.*;
import com.hikariforge.store.dto.*;
import com.hikariforge.store.exception.RecursoNoEncontradoException;
import com.hikariforge.store.repository.*;
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

    @Transactional(readOnly = true)
    public Page<ProductoResponse> listar(Pageable pageable) {
        return productoRepository.findAll(pageable).map(this::aResponse);
    }

    @Transactional(readOnly = true)
    public ProductoResponse obtener(UUID id) {
        return aResponse(buscar(id));
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

    @Transactional
    public void eliminar(UUID id) {
        productoRepository.delete(buscar(id));
    }

    private Producto buscar(UUID id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado: " + id));
    }

    // Mapea la entidad a su DTO de salida.
    private ProductoResponse aResponse(Producto p) {
        return new ProductoResponse(
                p.getId(), p.getNombre(), p.getDescripcion(), p.getMarca(),
                p.getPrecio(), p.getStock(), p.getImagenUrl(),
                p.getCategoria().getId(), p.getCategoria().getNombre());
    }
}
