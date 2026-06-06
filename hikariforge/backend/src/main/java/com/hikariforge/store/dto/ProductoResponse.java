package com.hikariforge.store.dto;

import java.util.UUID;

import java.math.BigDecimal;

// DTO de salida: lo que la API devuelve al frontend. Evita exponer la entidad
// directamente y desacopla el modelo interno del contrato público de la API.
public record ProductoResponse(
        UUID id,
        String nombre,
        String descripcion,
        String marca,
        BigDecimal precio,
        Integer stock,
        String imagenUrl,
        UUID categoriaId,
        String categoriaNombre
) {}
