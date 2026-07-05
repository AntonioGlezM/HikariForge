package com.hikariforge.store.controller;

import com.hikariforge.store.dto.CambiarEstadoRequest;
import com.hikariforge.store.dto.CrearPedidoRequest;
import com.hikariforge.store.dto.PedidoResponse;
import com.hikariforge.store.service.PedidoService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
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

    // El cliente cancela su propio pedido (solo si sigue pendiente).
    @PutMapping("/{id}/cancelar")
    public PedidoResponse cancelar(@PathVariable java.util.UUID id, Authentication auth) {
        return pedidoService.cancelar(auth.getName(), id);
    }

    // Zona admin: todos los pedidos de la tienda.
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<PedidoResponse> todos() {
        return pedidoService.listarTodos();
    }

    // Zona admin: cambiar el estado del seguimiento de un pedido.
    @PutMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMIN')")
    public PedidoResponse cambiarEstado(@PathVariable java.util.UUID id,
                                        @Valid @RequestBody CambiarEstadoRequest req) {
        return pedidoService.cambiarEstado(id, req.estado());
    }
}
