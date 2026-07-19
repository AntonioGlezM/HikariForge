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

    // Estado del seguimiento; los pedidos nuevos empiezan en PENDIENTE.
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EstadoPedido estado = EstadoPedido.PENDIENTE;

    // --- Dirección de envío (Fase 1). Nullable para el histórico anterior. ---
    @Column(length = 120)
    private String destinatario;

    @Column(length = 200)
    private String direccion;

    @Column(length = 80)
    private String ciudad;

    @Column(length = 80)
    private String provincia;

    @Column(name = "codigo_postal", length = 10)
    private String codigoPostal;

    @Column(length = 20)
    private String telefono;

    // Instrucciones de entrega opcionales ("dejar en conserjería", etc.).
    @Column(length = 300)
    private String notas;

    // --- Cupón aplicado (Fase 5): código y descuento congelados al comprar ---
    @Column(name = "cupon_codigo", length = 30)
    private String cuponCodigo;

    @Column(name = "descuento_pct")
    private Integer descuentoPct;

    // --- Pago con Stripe (Fase 3) ---
    @Column(name = "stripe_session_id", length = 120)
    private String stripeSessionId;

    @Column(name = "pagado_en")
    private java.time.LocalDateTime pagadoEn;

    // cascade + orphanRemoval: las líneas viven y mueren con su pedido.
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<LineaPedido> lineas = new ArrayList<>();
}
