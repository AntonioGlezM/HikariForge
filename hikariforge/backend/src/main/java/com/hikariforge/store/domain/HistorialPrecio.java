package com.hikariforge.store.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.*;

/**
 * Registro de un precio efectivo de un producto en un momento dado. Se crea una
 * fila cada vez que cambia el precio (normal u oferta), para poder calcular el
 * precio más bajo de los últimos 30 días que exige la directiva Omnibus.
 */
@Entity
@Table(name = "historial_precio")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class HistorialPrecio {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @Column(nullable = false)
    private LocalDateTime fecha;
}
