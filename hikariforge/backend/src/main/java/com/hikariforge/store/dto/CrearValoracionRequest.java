package com.hikariforge.store.dto;

import jakarta.validation.constraints.*;

/**
 * Datos que envía el cliente para crear o actualizar su valoración de un
 * producto: estrellas (1-5, obligatorio) y un comentario opcional.
 */
public record CrearValoracionRequest(
        @NotNull @Min(1) @Max(5) Integer estrellas,
        @Size(max = 1000) String comentario) {}
