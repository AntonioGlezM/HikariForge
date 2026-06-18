package com.hikariforge.store.dto;

import jakarta.validation.constraints.*;
import java.util.UUID;
import java.util.Map;
import java.math.BigDecimal;

// DTO de entrada para crear/actualizar un producto. Las anotaciones de validación
// rechazan datos inválidos antes de llegar a la lógica de negocio.
public record ProductoRequest(
        @NotBlank String nombre,
        String descripcion,
        String marca,
        @NotNull @Positive BigDecimal precio,
        // Precio de oferta opcional; si llega, debe ser positivo (la entidad valida que sea < precio).
        @Positive BigDecimal precioOferta,
        // Vigencia opcional de la oferta: inicio, fin y/o "hasta fin de existencias".
        java.time.LocalDateTime ofertaDesde,
        java.time.LocalDateTime ofertaHasta,
        Boolean ofertaHastaAgotar,
        @NotNull @PositiveOrZero Integer stock,
        String imagenUrl,
        @NotNull UUID categoriaId,
        // ----- Especificaciones -----
        // Columnas filtrables (todas opcionales según la categoría).
        String conexion,
        @PositiveOrZero Integer pesoG,
        Boolean rgb,
        String color,
        // Ficha técnica flexible (clave -> valor) validada contra el catálogo.
        Map<String, Object> specs
) {}
