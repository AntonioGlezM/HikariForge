package com.hikariforge.store.dto;

import java.math.BigDecimal;
import java.util.UUID;

// Parámetros de búsqueda del catálogo (todos opcionales). Llegan como query params:
// ?texto=...&categoriaId=...&marca=...&precioMax=...&enStock=true&conexion=inalambrico&pesoMax=70&color=Negro&rgb=true
public record ProductoFiltro(
        String texto,
        UUID categoriaId,
        String marca,
        BigDecimal precioMax,
        Boolean enStock,
        // Filtros de especificaciones (columnas), todos opcionales:
        String conexion,      // cable / inalambrico / ambos
        Integer pesoMax,      // peso máximo en gramos (para "ligeros")
        String color,
        Boolean rgb) {}
