package com.hikariforge.store.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;
import java.util.UUID;

// Petición de creación de pedido: las líneas del carrito (producto + cantidad).
public record CrearPedidoRequest(@NotEmpty @Valid List<Linea> lineas) {
    public record Linea(@NotNull UUID productoId, @NotNull @Min(1) Integer cantidad) {}
}
