package com.hikariforge.store.service;

import com.hikariforge.store.domain.*;
import com.hikariforge.store.dto.*;
import com.hikariforge.store.exception.RecursoNoEncontradoException;
import com.hikariforge.store.repository.*;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Gestión del catálogo de atributos por categoría. Permite al administrador
 * definir qué campos técnicos tiene cada categoría; con eso, el formulario de
 * producto y la ficha se construyen de forma dinámica.
 */
@Service
public class AtributoService {

    private final AtributoCategoriaRepository atributoRepository;
    private final CategoriaRepository categoriaRepository;

    public AtributoService(AtributoCategoriaRepository atributoRepository,
                           CategoriaRepository categoriaRepository) {
        this.atributoRepository = atributoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    /** Atributos de una categoría, ordenados por sección y orden. */
    @Transactional(readOnly = true)
    public List<AtributoResponse> listarPorCategoria(UUID categoriaId) {
        return atributoRepository.findByCategoriaIdOrderBySeccionAscOrdenAsc(categoriaId)
                .stream().map(this::aResponse).toList();
    }

    @Transactional
    public AtributoResponse crear(AtributoRequest req) {
        Categoria categoria = categoriaRepository.findById(req.categoriaId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoría no encontrada"));
        AtributoCategoria a = AtributoCategoria.builder()
                .categoria(categoria)
                .clave(req.clave().trim())
                .etiqueta(req.etiqueta().trim())
                .tipo(req.tipo())
                .opciones(normalizarOpciones(req))
                .seccion(req.seccion())
                .unidad(req.unidad())
                .orden(req.orden() != null ? req.orden() : 0)
                .build();
        return aResponse(atributoRepository.save(a));
    }

    @Transactional
    public AtributoResponse actualizar(UUID id, AtributoRequest req) {
        AtributoCategoria a = atributoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Atributo no encontrado"));
        a.setClave(req.clave().trim());
        a.setEtiqueta(req.etiqueta().trim());
        a.setTipo(req.tipo());
        a.setOpciones(normalizarOpciones(req));
        a.setSeccion(req.seccion());
        a.setUnidad(req.unidad());
        a.setOrden(req.orden() != null ? req.orden() : 0);
        return aResponse(atributoRepository.save(a));
    }

    @Transactional
    public void borrar(UUID id) {
        if (!atributoRepository.existsById(id)) {
            throw new RecursoNoEncontradoException("Atributo no encontrado");
        }
        atributoRepository.deleteById(id);
    }

    // Las opciones solo tienen sentido para el tipo LISTA; en el resto se ignoran.
    private String normalizarOpciones(AtributoRequest req) {
        if (req.tipo() != TipoAtributo.LISTA) return null;
        return (req.opciones() == null || req.opciones().isBlank()) ? null : req.opciones().trim();
    }

    private AtributoResponse aResponse(AtributoCategoria a) {
        // Las opciones se guardan como "a|b|c"; se exponen ya troceadas.
        List<String> opciones = (a.getOpciones() == null || a.getOpciones().isBlank())
                ? List.of()
                : List.of(a.getOpciones().split("\\|"));
        return new AtributoResponse(a.getId(), a.getCategoria().getId(), a.getClave(),
                a.getEtiqueta(), a.getTipo(), opciones, a.getSeccion(), a.getUnidad(), a.getOrden());
    }
}
