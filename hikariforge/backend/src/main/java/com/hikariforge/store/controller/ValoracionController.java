package com.hikariforge.store.controller;

import com.hikariforge.store.dto.*;
import com.hikariforge.store.service.ValoracionService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Valoraciones de productos. La lectura del resumen es pública; crear, editar
 * o borrar requiere sesión (el usuario sale del token JWT).
 */
@RestController
@RequestMapping("/api")
public class ValoracionController {

    private final ValoracionService valoracionService;

    public ValoracionController(ValoracionService valoracionService) {
        this.valoracionService = valoracionService;
    }

    // Público: media, total y lista de reseñas de un producto.
    // Si la petición viene autenticada, marca cuál es la del propio usuario.
    @GetMapping("/productos/{productoId}/valoraciones")
    public ResumenValoraciones resumen(@PathVariable UUID productoId, Authentication auth) {
        String email = (auth != null) ? auth.getName() : null;
        return valoracionService.resumen(productoId, email);
    }

    // Crea o actualiza la valoración del usuario para ese producto.
    @PostMapping("/productos/{productoId}/valoraciones")
    public ValoracionResponse valorar(@PathVariable UUID productoId,
                                      @Valid @RequestBody CrearValoracionRequest req,
                                      Authentication auth) {
        return valoracionService.valorar(productoId, auth.getName(), req);
    }

    // Borra una valoración: su autor, o un administrador (moderación).
    @DeleteMapping("/valoraciones/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void borrar(@PathVariable UUID id, Authentication auth) {
        boolean esAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        valoracionService.borrar(id, auth.getName(), esAdmin);
    }

    // Panel de moderación: todas las reseñas de la tienda (solo admin).
    @GetMapping("/valoraciones")
    @PreAuthorize("hasRole('ADMIN')")
    public List<com.hikariforge.store.dto.ValoracionAdminResponse> todas() {
        return valoracionService.listarTodas();
    }
}
