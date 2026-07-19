package com.hikariforge.store.domain;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;
import lombok.*;

// Cupón de descuento porcentual sobre el total del pedido.
@Entity
@Table(name = "cupon")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Cupon {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 30)
    private String codigo;

    @Column(nullable = false)
    private Integer porcentaje;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;

    // NULL = usos ilimitados.
    @Column(name = "usos_max")
    private Integer usosMax;

    @Column(nullable = false)
    @Builder.Default
    private Integer usos = 0;

    // NULL = no caduca.
    private LocalDate caduca;
}
