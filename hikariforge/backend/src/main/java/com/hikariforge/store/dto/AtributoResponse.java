package com.hikariforge.store.dto;

import com.hikariforge.store.domain.TipoAtributo;
import java.util.List;
import java.util.UUID;

/**
 * Un atributo del catálogo tal como lo consumen el formulario de admin y la
 * ficha. Las opciones del tipo LISTA llegan ya troceadas en una lista.
 */
public record AtributoResponse(
        UUID id,
        UUID categoriaId,
        String clave,
        String etiqueta,
        TipoAtributo tipo,
        List<String> opciones,
        String seccion,
        String unidad,
        Integer orden) {}
