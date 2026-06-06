package com.hikariforge.store.domain;

import jakarta.persistence.*;
import java.util.UUID;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

// Pedido realizado por un usuario. Contiene varias líneas (un producto por línea).
@Entity
@Table(name = "pedido")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false)
    private LocalDateTime fecha;

    // cascade + orphanRemoval: las líneas viven y mueren con su pedido.
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<LineaPedido> lineas = new ArrayList<>();
}
