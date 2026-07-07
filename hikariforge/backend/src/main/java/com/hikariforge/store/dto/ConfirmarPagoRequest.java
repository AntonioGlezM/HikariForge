package com.hikariforge.store.dto;

import jakarta.validation.constraints.NotBlank;

// Confirmación del pago al volver de Stripe: la sesión que viene en la URL.
public record ConfirmarPagoRequest(@NotBlank String sessionId) {}
