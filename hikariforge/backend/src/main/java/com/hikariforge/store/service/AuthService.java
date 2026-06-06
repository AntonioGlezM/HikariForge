package com.hikariforge.store.service;

import com.hikariforge.store.domain.*;
import com.hikariforge.store.dto.*;
import com.hikariforge.store.repository.UsuarioRepository;
import com.hikariforge.store.security.JwtService;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

// Registro y login. Devuelve un token JWT que el frontend usará en las siguientes peticiones.
@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthResponse registrar(RegisterRequest req) {
        if (usuarioRepository.existsByEmail(req.email())) {
            throw new IllegalArgumentException("El email ya está registrado");
        }
        Usuario usuario = Usuario.builder()
                .email(req.email())
                .password(passwordEncoder.encode(req.password())) // se cifra antes de guardar
                .nombre(req.nombre())
                .rol(Rol.CLIENTE) // los registros públicos son clientes; ADMIN se asigna a mano
                .build();
        usuarioRepository.save(usuario);
        String token = jwtService.generarToken(usuario.getEmail(), usuario.getRol().name());
        return new AuthResponse(token, usuario.getEmail(), usuario.getRol().name());
    }

    public AuthResponse login(LoginRequest req) {
        // Lanza excepción si las credenciales no son válidas.
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password()));

        Usuario usuario = usuarioRepository.findByEmail(req.email()).orElseThrow();
        String token = jwtService.generarToken(usuario.getEmail(), usuario.getRol().name());
        return new AuthResponse(token, usuario.getEmail(), usuario.getRol().name());
    }
}
