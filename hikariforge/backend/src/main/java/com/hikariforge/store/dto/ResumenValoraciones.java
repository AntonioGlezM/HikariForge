package com.hikariforge.store.dto;

import java.util.List;

/**
 * Resumen de las valoraciones de un producto: nota media, número total de
 * reseñas y la lista completa. Es lo que consume la ficha de producto.
 */
public record ResumenValoraciones(
        double media,
        int total,
        List<ValoracionResponse> valoraciones) {}
