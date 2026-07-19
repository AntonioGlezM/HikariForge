package com.hikariforge.store.dto;

import jakarta.validation.constraints.*;

// Petición de aviso "disponible de nuevo": el email a notificar.
public record AvisoStockRequest(@NotBlank @Email @Size(max = 160) String email) {}
