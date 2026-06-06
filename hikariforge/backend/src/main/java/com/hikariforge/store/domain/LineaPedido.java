package com.hikariforge.store.domain;

import jakarta.persistence.*;
import java.util.UUID;
import lombok.*;
import java.math.BigDecimal;

// Una línea de un pedido: un producto, su cantidad y el precio en el momento de la compra.
@Entity
@Table(name = "linea_pedido")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class LineaPedido {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @Column(nullable = false)
    private Integer cantidad;

    // Guardamos el precio aquí porque el del producto puede cambiar en el futuro.
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario;
}
