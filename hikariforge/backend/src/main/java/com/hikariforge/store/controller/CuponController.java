package com.hikariforge.store.controller;

import com.hikariforge.store.domain.Cupon;
import com.hikariforge.store.dto.CuponRequest;
import com.hikariforge.store.service.CuponService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cupones")
public class CuponController {

    private final CuponService cuponService;

    public CuponController(CuponService cuponService) {
        this.cuponService = cuponService;
    }

    // Validación desde el checkout: devuelve código y porcentaje si es aplicable.
    @GetMapping("/validar/{codigo}")
    public Map<String, Object> validar(@PathVariable String codigo) {
        Cupon c = cuponService.validar(codigo);
        return Map.of("codigo", c.getCodigo(), "porcentaje", c.getPorcentaje());
    }

    // ----- Zona admin -----
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Cupon> listar() { return cuponService.listar(); }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Cupon crear(@Valid @RequestBody CuponRequest req) { return cuponService.crear(req); }

    @PutMapping("/{id}/activo")
    @PreAuthorize("hasRole('ADMIN')")
    public Cupon alternar(@PathVariable UUID id) { return cuponService.alternarActivo(id); }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void eliminar(@PathVariable UUID id) { cuponService.eliminar(id); }
}
