package com.hikariforge.store.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.*;

/**
 * Reseña de un producto hecha por un usuario: nota de 1 a 5 estrellas y un
 * comentario opcional. Un usuario solo puede tener una valoración por producto
 * (garantizado por una restricción UNIQUE en la base de datos); si vuelve a
 * valorar, se actualiza la existente.
 */
@Entity
@Table(name = "valoracion")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Valoracion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false)
    private Integer estrellas;

    @Column(length = 1000)
    private String comentario;

    @Column(nullable = false)
    private LocalDateTime fecha;
}
