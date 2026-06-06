package com.hikariforge.store.domain;

import jakarta.persistence.*;
import java.util.UUID;
import lombok.*;

// Categoría de producto (Ratones, Teclados, Auriculares...).
@Entity
@Table(name = "categoria")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String nombre;
}
