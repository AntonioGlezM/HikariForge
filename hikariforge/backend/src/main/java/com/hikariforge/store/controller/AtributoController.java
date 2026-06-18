package com.hikariforge.store.controller;

import com.hikariforge.store.dto.*;
import com.hikariforge.store.service.AtributoService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Catálogo de atributos por categoría. Consultar los atributos de una categoría
 * es público (lo usan el formulario de producto y la ficha); crearlos, editarlos
 * o borrarlos es exclusivo del administrador.
 */
@RestController
@RequestMapping("/api/atributos")
public class AtributoController {

    private final AtributoService atributoService;

    public AtributoController(AtributoService atributoService) {
        this.atributoService = atributoService;
    }

    // Público: atributos definidos para una categoría.
    @GetMapping
    public List<AtributoResponse> porCategoria(@RequestParam UUID categoriaId) {
        return atributoService.listarPorCategoria(categoriaId);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public AtributoResponse crear(@Valid @RequestBody AtributoRequest req) {
        return atributoService.crear(req);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public AtributoResponse actualizar(@PathVariable UUID id, @Valid @RequestBody AtributoRequest req) {
        return atributoService.actualizar(id, req);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void borrar(@PathVariable UUID id) {
        atributoService.borrar(id);
    }
}
