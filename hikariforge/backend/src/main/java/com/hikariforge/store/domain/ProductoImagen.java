package com.hikariforge.store.domain;

import jakarta.persistence.*;
import java.util.UUID;
import lombok.*;

// Imagen adicional de la galería de un producto (por URL), con su orden.
@Entity
@Table(name = "producto_imagen")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class ProductoImagen {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "producto_id")
    private Producto producto;

    @Column(nullable = false, length = 500)
    private String url;

    @Column(nullable = false)
    @Builder.Default
    private Integer orden = 0;
}
