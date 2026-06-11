package com.hikariforge.store.dto;

import jakarta.validation.constraints.NotBlank;

// Petición del login con Google: el idToken que emite Google en el navegador.
public record GoogleLoginRequest(@NotBlank String idToken) {}
