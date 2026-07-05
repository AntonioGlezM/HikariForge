package com.hikariforge.store.dto;

import jakarta.validation.constraints.*;

// Petición de recuperación: solo el email de la cuenta.
public record RecuperarPasswordRequest(@NotBlank @Email String email) {}
