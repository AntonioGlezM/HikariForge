package com.hikariforge.store.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Valoración vista desde el panel de administración. A diferencia de la vista
 * pública, identifica al autor por email y muestra a qué producto pertenece,
 * para que el administrador pueda moderar (borrar reseñas abusivas).
 */
public record ValoracionAdminResponse(
        UUID id,
        String productoNombre,
        UUID productoId,
        String autorEmail,
        Integer estrellas,
        String comentario,
        LocalDateTime fecha) {}
