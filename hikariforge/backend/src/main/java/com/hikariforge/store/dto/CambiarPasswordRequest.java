package com.hikariforge.store.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// Cambio de contraseña: hay que demostrar la actual antes de poner la nueva.
public record CambiarPasswordRequest(
        @NotBlank String actual,
        @NotBlank @Size(min = 6) String nueva) {}
