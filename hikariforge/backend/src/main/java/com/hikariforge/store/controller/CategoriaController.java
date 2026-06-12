package com.hikariforge.store.controller;

import com.hikariforge.store.dto.CategoriaResponse;
import com.hikariforge.store.repository.CategoriaRepository;
import java.util.List;
import org.springframework.web.bind.annotation.*;

// Listado de categorías (público; ya estaba permitido en SecurityConfig).
@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    private final CategoriaRepository categoriaRepository;

    public CategoriaController(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @GetMapping
    public List<CategoriaResponse> listar() {
        return categoriaRepository.findAll().stream()
                .map(c -> new CategoriaResponse(c.getId(), c.getNombre()))
                .toList();
    }
}
