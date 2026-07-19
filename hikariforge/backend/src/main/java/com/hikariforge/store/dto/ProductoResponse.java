package com.hikariforge.store.dto;

import java.util.UUID;
import java.util.Map;

import java.math.BigDecimal;

// DTO de salida: lo que la API devuelve al frontend. Evita exponer la entidad
// directamente y desacopla el modelo interno del contrato público de la API.
public record ProductoResponse(
        UUID id,
        String nombre,
        String descripcion,
        String marca,
        BigDecimal precio,
        BigDecimal precioOferta,
        java.time.LocalDateTime ofertaDesde,
        java.time.LocalDateTime ofertaHasta,
        Boolean ofertaHastaAgotar,
        Boolean ofertaVigente,
        Boolean ofertaProgramada,
        Integer stock,               // solo endpoints de admin; en los públicos viaja null
        String disponibilidad,       // AGOTADO | POCAS | DISPONIBLE (lo que ve el cliente)
        Boolean activo,
        String imagenUrl,
        UUID categoriaId,
        String categoriaNombre,
        // ----- Especificaciones -----
        String conexion,
        Integer pesoG,
        Boolean rgb,
        String color,
        Map<String, Object> specs,
        // Precio más bajo de los últimos 30 días (Omnibus). Solo se rellena en la
        // ficha individual; en el listado va null para no consultar por cada producto.
        java.math.BigDecimal precioMinimo30d
) {}
