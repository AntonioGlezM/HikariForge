package com.hikariforge.store.controller;

import com.hikariforge.store.dto.ConfirmarPagoRequest;
import com.hikariforge.store.dto.PedidoResponse;
import com.hikariforge.store.service.PagoService;
import jakarta.validation.Valid;
import java.util.Map;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

// Pago con Stripe Checkout: crear la sesión de pago y confirmarla al volver.
@RestController
@RequestMapping("/api/pagos")
public class PagoController {

    private final PagoService pagoService;

    public PagoController(PagoService pagoService) {
        this.pagoService = pagoService;
    }

    // Crea la sesión de pago de un pedido pendiente. Devuelve la URL de Stripe.
    @PostMapping("/sesion/{pedidoId}")
    public Map<String, String> crearSesion(@PathVariable UUID pedidoId, Authentication auth) {
        return Map.of("url", pagoService.crearSesion(auth.getName(), pedidoId));
    }

    // Verifica la sesión en el servidor y marca el pedido como pagado.
    @PostMapping("/confirmar")
    public PedidoResponse confirmar(@Valid @RequestBody ConfirmarPagoRequest req, Authentication auth) {
        return pagoService.confirmar(auth.getName(), req.sessionId());
    }
}
