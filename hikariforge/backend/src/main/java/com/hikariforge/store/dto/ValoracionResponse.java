package com.hikariforge.store.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Una reseña tal y como se muestra en la ficha del producto. Incluye el nombre
 * del autor (no su email) y si pertenece al usuario que consulta, para poder
 * ofrecerle editarla.
 */
public record ValoracionResponse(
        UUID id,
        String autor,
        Integer estrellas,
        String comentario,
        LocalDateTime fecha,
        boolean mia) {}
