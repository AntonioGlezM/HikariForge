package com.hikariforge.store.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

// Cambio de datos del perfil (nombre y/o email).
public record ActualizarPerfilRequest(
        @NotBlank String nombre,
        @NotBlank @Email String email) {}
