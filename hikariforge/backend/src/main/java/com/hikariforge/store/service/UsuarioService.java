package com.hikariforge.store.service;

import com.hikariforge.store.domain.Usuario;
import com.hikariforge.store.dto.*;
import com.hikariforge.store.exception.RecursoNoEncontradoException;
import com.hikariforge.store.repository.UsuarioRepository;
import com.hikariforge.store.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder,
                          JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public PerfilResponse perfil(String email) {
        Usuario u = buscar(email);
        return new PerfilResponse(u.getNombre(), u.getEmail(), u.getRol().name());
    }

    // Actualiza nombre y email. Como el email es el "sujeto" del JWT, si cambia
    // se devuelve un token nuevo para que la sesión siga siendo válida.
    @Transactional
    public AuthResponse actualizarPerfil(String emailActual, ActualizarPerfilRequest req) {
        Usuario u = buscar(emailActual);

        if (!u.getEmail().equals(req.email()) && usuarioRepository.findByEmail(req.email()).isPresent()) {
            throw new IllegalArgumentException("Ese email ya está registrado");
        }
        u.setNombre(req.nombre());
        u.setEmail(req.email());

        String token = jwtService.generarToken(u.getEmail(), u.getRol().name());
        return new AuthResponse(token, u.getEmail(), u.getRol().name());
    }

    @Transactional
    public void cambiarPassword(String email, CambiarPasswordRequest req) {
        Usuario u = buscar(email);
        if (!passwordEncoder.matches(req.actual(), u.getPassword())) {
            throw new IllegalArgumentException("La contraseña actual no es correcta");
        }
        u.setPassword(passwordEncoder.encode(req.nueva()));
    }

    private Usuario buscar(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
    }
}
