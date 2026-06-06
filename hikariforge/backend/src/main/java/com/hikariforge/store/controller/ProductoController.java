package com.hikariforge.store.controller;

import com.hikariforge.store.dto.*;
import com.hikariforge.store.service.ProductoService;
import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

// Endpoints REST del catálogo. GET es público; crear/borrar requiere rol ADMIN.
@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    // GET /api/productos?page=0&size=10 -> catálogo paginado.
    // @ParameterObject hace que Swagger muestre page/size/sort como campos sueltos (query),
    // en vez de un único objeto JSON.
    @GetMapping
    public Page<ProductoResponse> listar(@ParameterObject @PageableDefault(size = 10) Pageable pageable) {
        return productoService.listar(pageable);
    }

    @GetMapping("/{id}")
    public ProductoResponse obtener(@PathVariable UUID id) {
        return productoService.obtener(id);
    }

    // Solo ADMIN puede crear productos (requiere token con ese rol).
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductoResponse> crear(@Valid @RequestBody ProductoRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productoService.crear(req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        productoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}