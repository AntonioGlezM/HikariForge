package com.hikariforge.store.dto;

import jakarta.validation.constraints.*;

// Restablecer la contraseña con el token recibido por email.
public record RestablecerPasswordRequest(
        @NotBlank String token,
        @NotBlank @Size(min = 6, max = 100) String nuevaPassword) {}
