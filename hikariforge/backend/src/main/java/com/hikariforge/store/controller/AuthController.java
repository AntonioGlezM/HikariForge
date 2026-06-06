package com.hikariforge.store.controller;

import com.hikariforge.store.dto.*;
import com.hikariforge.store.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

// Endpoints públicos de autenticación: registro y login devuelven un token JWT.
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponse registrar(@Valid @RequestBody RegisterRequest req) {
        return authService.registrar(req);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }
}
