package com.hikariforge.store.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

// Pedido tal y como lo ve el cliente: estado, total y sus líneas.
public record PedidoResponse(
        UUID id,
        LocalDateTime fecha,
        String estado,
        String clienteEmail,
        BigDecimal total,
        String destinatario,
        String direccion,
        String ciudad,
        String provincia,
        String codigoPostal,
        String telefono,
        String notas,
        List<Linea> lineas) {

    public record Linea(String productoNombre, Integer cantidad, BigDecimal precioUnitario) {}
}
