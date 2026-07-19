package com.hikariforge.store.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;
import java.util.UUID;

// Petición de creación de pedido: las líneas del carrito + la dirección de envío.
public record CrearPedidoRequest(
        @NotEmpty @Valid List<Linea> lineas,
        @NotBlank @Size(max = 120) String destinatario,
        @NotBlank @Size(max = 200) String direccion,
        @NotBlank @Size(max = 80) String ciudad,
        @NotBlank @Size(max = 80) String provincia,
        @NotBlank @Size(max = 10) String codigoPostal,
        @NotBlank @Size(max = 20) String telefono,
        @Size(max = 300) String notas,
        @Size(max = 30) String cupon) {   // opcional: código de descuento
    public record Linea(@NotNull UUID productoId, @NotNull @Min(1) Integer cantidad) {}
}
