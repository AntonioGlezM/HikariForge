package com.hikariforge.store.domain;

import jakarta.persistence.*;
import java.util.UUID;
import lombok.*;

// Petición de aviso: email a notificar cuando el producto vuelva a tener stock.
@Entity
@Table(name = "aviso_stock")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class AvisoStock {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "producto_id")
    private Producto producto;

    @Column(nullable = false, length = 160)
    private String email;

    @Column(nullable = false)
    @Builder.Default
    private Boolean avisado = false;
}
