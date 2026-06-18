package com.hikariforge.store.dto;

import com.hikariforge.store.domain.TipoAtributo;
import jakarta.validation.constraints.*;
import java.util.UUID;

/**
 * Datos para crear o editar un atributo del catálogo. Las opciones del tipo
 * LISTA se envían como una sola cadena separada por '|'.
 */
public record AtributoRequest(
        @NotNull UUID categoriaId,
        @NotBlank @Size(max = 50) String clave,
        @NotBlank @Size(max = 80) String etiqueta,
        @NotNull TipoAtributo tipo,
        @Size(max = 500) String opciones,
        @Size(max = 60) String seccion,
        @Size(max = 20) String unidad,
        Integer orden) {}
