package com.hikariforge.store.dto;

import com.hikariforge.store.domain.EstadoPedido;
import jakarta.validation.constraints.NotNull;

// Cambio de estado de un pedido desde la zona admin.
public record CambiarEstadoRequest(@NotNull EstadoPedido estado) {}
