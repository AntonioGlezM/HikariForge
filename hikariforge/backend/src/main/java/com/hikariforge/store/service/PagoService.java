package com.hikariforge.store.service;

import com.hikariforge.store.domain.EstadoPedido;
import com.hikariforge.store.domain.Pedido;
import com.hikariforge.store.dto.PedidoResponse;
import com.hikariforge.store.exception.RecursoNoEncontradoException;
import com.hikariforge.store.repository.PedidoRepository;
import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Pago con Stripe Checkout (modo test): se crea una sesión de pago alojada en
// Stripe con el total del pedido, el cliente paga allí, y al volver a la web
// confirmamos el pago consultando la sesión (verificación en servidor).
@Service
public class PagoService {

    private final PedidoRepository pedidoRepository;
    private final PedidoService pedidoService;
    private final EmailService emailService;
    private final String frontendUrl;
    private final boolean configurado;

    public PagoService(PedidoRepository pedidoRepository, PedidoService pedidoService,
                       EmailService emailService,
                       @Value("${app.stripe.secret-key}") String secretKey,
                       @Value("${app.frontend-url}") String frontendUrl) {
        this.pedidoRepository = pedidoRepository;
        this.pedidoService = pedidoService;
        this.emailService = emailService;
        this.frontendUrl = frontendUrl;
        this.configurado = secretKey != null && !secretKey.isBlank();
        if (configurado) Stripe.apiKey = secretKey; // clave global del SDK de Stripe
    }

    // Crea la sesión de Stripe Checkout para un pedido PENDIENTE del usuario.
    // Devuelve la URL de la página de pago alojada en Stripe.
    @Transactional
    public String crearSesion(String emailUsuario, UUID pedidoId) {
        if (!configurado) {
            throw new IllegalArgumentException("El pago no está configurado (falta STRIPE_SECRET_KEY)");
        }
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido no encontrado"));
        if (!pedido.getUsuario().getEmail().equals(emailUsuario)) {
            throw new IllegalArgumentException("El pedido no pertenece a este usuario");
        }
        if (pedido.getEstado() != EstadoPedido.PENDIENTE) {
            throw new IllegalArgumentException("Solo se pueden pagar pedidos pendientes");
        }

        // Total del pedido calculado con la misma lógica que la respuesta de la API
        // (así incluye automáticamente descuentos si los hubiera en el futuro).
        BigDecimal total = pedidoService.aResponse(pedido).total();
        int articulos = pedido.getLineas().stream().mapToInt(l -> l.getCantidad()).sum();
        String referencia = pedido.getId().toString().substring(0, 8);

        try {
            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setCustomerEmail(emailUsuario)
                    .putMetadata("pedidoId", pedido.getId().toString())
                    // Al pagar, Stripe vuelve a Mis pedidos con la sesión para confirmarla.
                    .setSuccessUrl(frontendUrl + "/pedidos?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(frontendUrl + "/pedidos?pago=cancelado")
                    .addLineItem(SessionCreateParams.LineItem.builder()
                            .setQuantity(1L)
                            .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                    .setCurrency("eur")
                                    // Stripe trabaja en céntimos: 89.99 € -> 8999
                                    .setUnitAmount(total.movePointRight(2).longValueExact())
                                    .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                            .setName("Pedido #" + referencia + " — HikariForge (" + articulos + " art.)")
                                            .build())
                                    .build())
                            .build())
                    .build();

            Session session = Session.create(params);
            pedido.setStripeSessionId(session.getId());
            return session.getUrl();
        } catch (com.stripe.exception.StripeException e) {
            throw new IllegalArgumentException("No se pudo iniciar el pago: " + e.getMessage());
        }
    }

    // Al volver de Stripe: consulta la sesión EN EL SERVIDOR (nunca nos fiamos
    // solo de la URL del navegador) y, si está pagada, marca el pedido PAGADO.
    @Transactional
    public PedidoResponse confirmar(String emailUsuario, String sessionId) {
        if (!configurado) {
            throw new IllegalArgumentException("El pago no está configurado (falta STRIPE_SECRET_KEY)");
        }
        try {
            Session session = Session.retrieve(sessionId);
            if (!"paid".equals(session.getPaymentStatus())) {
                throw new IllegalArgumentException("El pago no está completado");
            }
            UUID pedidoId = UUID.fromString(session.getMetadata().get("pedidoId"));
            Pedido pedido = pedidoRepository.findById(pedidoId)
                    .orElseThrow(() -> new RecursoNoEncontradoException("Pedido no encontrado"));
            if (!pedido.getUsuario().getEmail().equals(emailUsuario)) {
                throw new IllegalArgumentException("El pedido no pertenece a este usuario");
            }
            // Idempotente: si ya estaba pagado (doble recarga de la página), no repetimos nada.
            if (pedido.getEstado() == EstadoPedido.PENDIENTE) {
                pedido.setEstado(EstadoPedido.PAGADO);
                pedido.setPagadoEn(LocalDateTime.now());
                enviarReciboPago(pedido);
            }
            return pedidoService.aResponse(pedido);
        } catch (com.stripe.exception.StripeException e) {
            throw new IllegalArgumentException("No se pudo verificar el pago: " + e.getMessage());
        }
    }

    // Correo breve de "pago recibido" (el fallo del correo nunca rompe el pago).
    private void enviarReciboPago(Pedido pedido) {
        String referencia = pedido.getId().toString().substring(0, 8);
        String html = """
                <div style="font-family:Arial,sans-serif;max-width:460px">
                  <h2 style="letter-spacing:1px">HIKARIFORGE</h2>
                  <p><b>Pago recibido ✔</b></p>
                  <p>Hemos recibido el pago de tu pedido <b>#%s</b>. En cuanto salga
                     de camino te avisaremos.</p>
                </div>
                """.formatted(referencia);
        emailService.enviar(pedido.getUsuario().getEmail(),
                "Pago recibido — pedido #" + referencia + " — HikariForge", html);
    }
}
