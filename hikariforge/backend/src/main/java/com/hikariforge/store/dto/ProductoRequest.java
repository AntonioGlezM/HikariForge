package com.hikariforge.store.dto;

import jakarta.validation.constraints.*;
import java.util.UUID;
import java.math.BigDecimal;

// DTO de entrada para crear/actualizar un producto. Las anotaciones de validación
// rechazan datos inválidos antes de llegar a la lógica de negocio.
public record ProductoRequest(
        @NotBlank String nombre,
        String descripcion,
        String marca,
        @NotNull @Positive BigDecimal precio,
        @NotNull @PositiveOrZero Integer stock,
        String imagenUrl,
        @NotNull UUID categoriaId
) {}
