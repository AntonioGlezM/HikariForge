package com.hikariforge.store.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.*;
import java.math.BigDecimal;
import java.util.Map;
import java.util.HashMap;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

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

    // Precio de oferta opcional. NULL = sin oferta; si tiene valor, es el precio vigente.
    @Column(name = "precio_oferta", precision = 10, scale = 2)
    private BigDecimal precioOferta;

    // Vigencia de la oferta (opcional):
    //  - ofertaDesde: fecha de inicio; antes de ella la oferta aún no está activa.
    //  - ofertaHasta: fecha límite; pasada, la oferta deja de aplicarse.
    //  - ofertaHastaAgotar: la oferta dura mientras quede stock.
    // Si no se define ninguna, la oferta está activa y no caduca.
    @Column(name = "oferta_desde")
    private LocalDateTime ofertaDesde;

    @Column(name = "oferta_hasta")
    private LocalDateTime ofertaHasta;

    @Column(name = "oferta_hasta_agotar", nullable = false)
    @Builder.Default
    private Boolean ofertaHastaAgotar = false;

    @Column(nullable = false)
    private Integer stock;

    // Borrado lógico: false = retirado de la venta (no aparece en el catálogo público).
    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;

    private String imagenUrl;

    // ----- Especificaciones (modelo híbrido) -----
    // Columnas filtrables: lo que se usa para buscar en el catálogo.
    @Column(length = 20)
    private String conexion;            // cable / inalambrico / ambos

    @Column(name = "peso_g")
    private Integer pesoG;              // peso en gramos

    private Boolean rgb;                // tiene iluminación RGB

    @Column(length = 40)
    private String color;

    // Ficha técnica flexible (clave -> valor) guardada como JSON en Postgres.
    // Solo se muestra; los atributos disponibles por categoría los define
    // el catálogo (AtributoCategoria).
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    @Builder.Default
    private Map<String, Object> specs = new HashMap<>();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    /**
     * ¿Está la oferta vigente ahora mismo? Lo está si hay un precio de oferta
     * válido (positivo y menor que el normal) y, además, no ha caducado:
     *  - si tiene fecha límite, que esa fecha no haya pasado;
     *  - si es "hasta fin de existencias", que aún quede stock.
     */
    public boolean isOfertaVigente() {
        boolean precioValido = precioOferta != null
                && precioOferta.signum() > 0
                && precioOferta.compareTo(precio) < 0;
        if (!precioValido) return false;
        LocalDateTime ahora = LocalDateTime.now();
        if (ofertaDesde != null && ahora.isBefore(ofertaDesde)) return false;
        if (ofertaHasta != null && ahora.isAfter(ofertaHasta)) return false;
        if (Boolean.TRUE.equals(ofertaHastaAgotar) && stock <= 0) return false;
        return true;
    }

    /**
     * ¿La oferta está definida pero todavía no ha empezado? (precio de oferta
     * válido y fecha de inicio en el futuro). Sirve para mostrar "Próximamente"
     * sin aplicar aún el descuento.
     */
    public boolean isOfertaProgramada() {
        boolean precioValido = precioOferta != null
                && precioOferta.signum() > 0
                && precioOferta.compareTo(precio) < 0;
        return precioValido && ofertaDesde != null && LocalDateTime.now().isBefore(ofertaDesde);
    }

    /**
     * Precio al que se vende realmente el producto: el de oferta si está vigente,
     * o el precio normal. Única fuente de verdad del importe (pedidos y carrito).
     */
    public BigDecimal getPrecioEfectivo() {
        return isOfertaVigente() ? precioOferta : precio;
    }

}
