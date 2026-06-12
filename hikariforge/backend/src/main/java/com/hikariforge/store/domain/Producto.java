package com.hikariforge.store.domain;

import jakarta.persistence.*;
import java.util.UUID;
import lombok.*;
import java.math.BigDecimal;

// Producto del catálogo. Usamos BigDecimal para el precio (nunca double con dinero).
@Entity
@Table(name = "producto")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String nombre;

    @Column(length = 1000)
    private String descripcion;

    private String marca;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @Column(nullable = false)
    private Integer stock;

    // Borrado lógico: false = retirado de la venta (no aparece en el catálogo público).
    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;

    private String imagenUrl;

    // Muchos productos pertenecen a una categoría. LAZY evita cargar la
    // categoría hasta que se accede a ella (mejor rendimiento).
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;
}
