package com.hikariforge.store.dto;

import java.math.BigDecimal;
import java.util.UUID;

// Parámetros de búsqueda del catálogo (todos opcionales). Llegan como query params:
// ?texto=...&categoriaId=...&marca=...&precioMax=...&enStock=true
public record ProductoFiltro(
        String texto,
        UUID categoriaId,
        String marca,
        BigDecimal precioMax,
        Boolean enStock) {}
