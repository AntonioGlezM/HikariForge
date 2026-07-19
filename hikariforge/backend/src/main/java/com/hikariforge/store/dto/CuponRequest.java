package com.hikariforge.store.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

// Alta de cupón (zona admin).
public record CuponRequest(
        @NotBlank @Size(max = 30) String codigo,
        @NotNull @Min(1) @Max(90) Integer porcentaje,
        @Positive Integer usosMax,   // null = ilimitado
        LocalDate caduca) {}         // null = no caduca
