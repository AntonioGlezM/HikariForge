package com.hikariforge.store.domain;

import jakarta.persistence.*;
import java.util.UUID;
import lombok.*;

/**
 * Define un atributo que los productos de una categoría pueden tener (p. ej.
 * "DPI máximo" para Ratones). Es el catálogo que hace dinámico el sistema:
 * el formulario de administración y la ficha del producto se construyen a
 * partir de estas definiciones, así que añadir un atributo —o una categoría
 * nueva como "Sillas"— no requiere tocar el código.
 */
@Entity
@Table(name = "atributo_categoria")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class AtributoCategoria {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    // Clave técnica con la que se guarda el valor en el JSON specs del producto.
    @Column(nullable = false, length = 50)
    private String clave;

    // Etiqueta visible en formulario y ficha.
    @Column(nullable = false, length = 80)
    private String etiqueta;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoAtributo tipo;

    // Opciones del tipo LISTA, separadas por '|'. Null para los demás tipos.
    @Column(length = 500)
    private String opciones;

    // Sección de la ficha donde se agrupa el atributo (p. ej. "Sensor").
    @Column(length = 60)
    private String seccion;

    // Unidad opcional a mostrar junto al valor (p. ej. "g", "Hz").
    @Column(length = 20)
    private String unidad;

    // Orden de aparición dentro de su sección.
    @Column(nullable = false)
    @Builder.Default
    private Integer orden = 0;
}
