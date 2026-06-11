package com.hikariforge.store.controller;

import com.hikariforge.store.dto.CrearPedidoRequest;
import com.hikariforge.store.dto.PedidoResponse;
import com.hikariforge.store.service.PedidoService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

// Pedidos del usuario autenticado (el email sale del token JWT).
@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PedidoResponse crear(@Valid @RequestBody CrearPedidoRequest req, Authentication auth) {
        return pedidoService.crear(auth.getName(), req);
    }

    @GetMapping("/mios")
    public List<PedidoResponse> mios(Authentication auth) {
        return pedidoService.listarMios(auth.getName());
    }
}
