package com.hikariforge.store.domain;

// Fases del seguimiento de un pedido, en orden. CANCELADO es un estado final
// al que solo se llega desde PENDIENTE (cliente) o por decisión del admin.
public enum EstadoPedido {
    PENDIENTE, PAGADO, ENVIADO, ENTREGADO, CANCELADO
}
