package com.hikariforge.store.controller;

import com.hikariforge.store.dto.*;
import com.hikariforge.store.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

// Perfil del usuario autenticado: consultar datos, editarlos y cambiar la contraseña.
@RestController
@RequestMapping("/api/usuarios/me")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public PerfilResponse perfil(Authentication auth) {
        return usuarioService.perfil(auth.getName());
    }

    // Devuelve un AuthResponse con token nuevo (el email forma parte del JWT).
    @PutMapping
    public AuthResponse actualizar(@Valid @RequestBody ActualizarPerfilRequest req, Authentication auth) {
        return usuarioService.actualizarPerfil(auth.getName(), req);
    }

    @PutMapping("/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cambiarPassword(@Valid @RequestBody CambiarPasswordRequest req, Authentication auth) {
        usuarioService.cambiarPassword(auth.getName(), req);
    }
}
