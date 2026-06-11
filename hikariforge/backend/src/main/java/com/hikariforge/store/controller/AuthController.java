package com.hikariforge.store.controller;

import com.hikariforge.store.dto.*;
import com.hikariforge.store.service.AuthService;
import com.hikariforge.store.service.GoogleAuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

// Endpoints públicos de autenticación: registro, login y login con Google.
// Todos devuelven un token JWT propio de la aplicación.
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final GoogleAuthService googleAuthService;

    public AuthController(AuthService authService, GoogleAuthService googleAuthService) {
        this.authService = authService;
        this.googleAuthService = googleAuthService;
    }

    @PostMapping("/register")
    public AuthResponse registrar(@Valid @RequestBody RegisterRequest req) {
        return authService.registrar(req);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    // Login/registro con Google: si el email no existe, se crea el usuario.
    @PostMapping("/google")
    public AuthResponse google(@Valid @RequestBody GoogleLoginRequest req) {
        return googleAuthService.loginConGoogle(req.idToken());
    }
}
