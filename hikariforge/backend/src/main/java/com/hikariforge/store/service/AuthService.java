package com.hikariforge.store.service;

import com.hikariforge.store.domain.*;
import com.hikariforge.store.dto.*;
import com.hikariforge.store.repository.PasswordResetTokenRepository;
import com.hikariforge.store.repository.UsuarioRepository;
import com.hikariforge.store.security.JwtService;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Registro y login. Devuelve un token JWT que el frontend usará en las siguientes peticiones.
@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final EmailService emailService;
    private final String frontendUrl;
    private final SecureRandom aleatorio = new SecureRandom();

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, JwtService jwtService,
                       PasswordResetTokenRepository resetTokenRepository, EmailService emailService,
                       @Value("${app.frontend-url}") String frontendUrl) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.resetTokenRepository = resetTokenRepository;
        this.emailService = emailService;
        this.frontendUrl = frontendUrl;
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

    // Recuperación de contraseña. SIEMPRE termina sin error, exista o no el
    // email: así no se puede usar para averiguar qué correos están registrados.
    @Transactional
    public void recuperarPassword(String email) {
        usuarioRepository.findByEmail(email).ifPresent(usuario -> {
            // Token aleatorio de 48 caracteres hex, caducidad 45 minutos, un solo uso.
            byte[] bytes = new byte[24];
            aleatorio.nextBytes(bytes);
            String token = HexFormat.of().formatHex(bytes);

            resetTokenRepository.save(PasswordResetToken.builder()
                    .usuario(usuario)
                    .token(token)
                    .expira(LocalDateTime.now().plusMinutes(45))
                    .build());

            String enlace = frontendUrl + "/restablecer?token=" + token;
            String html = """
                    <div style="font-family:Arial,sans-serif;max-width:460px">
                      <h2 style="letter-spacing:1px">HIKARIFORGE</h2>
                      <p>Hola%s,</p>
                      <p>Hemos recibido una solicitud para restablecer tu contraseña.
                         Pulsa el botón para elegir una nueva (el enlace caduca en 45 minutos):</p>
                      <p style="text-align:center;margin:24px 0">
                        <a href="%s" style="background:#141414;color:#fff;padding:12px 26px;
                           border-radius:999px;text-decoration:none;font-weight:bold">Restablecer contraseña</a>
                      </p>
                      <p style="color:#777;font-size:13px">Si no has sido tú, ignora este correo:
                         tu contraseña seguirá siendo la misma.</p>
                    </div>
                    """.formatted(usuario.getNombre() != null ? " " + usuario.getNombre() : "", enlace);
            emailService.enviar(usuario.getEmail(), "Restablece tu contraseña — HikariForge", html);
        });
    }

    // Consume el token (si es válido, no usado y no caducado) y fija la nueva contraseña.
    @Transactional
    public void restablecerPassword(String token, String nuevaPassword) {
        PasswordResetToken prt = resetTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("El enlace no es válido"));
        if (Boolean.TRUE.equals(prt.getUsado())) {
            throw new IllegalArgumentException("Este enlace ya se ha utilizado");
        }
        if (prt.getExpira().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("El enlace ha caducado. Solicita uno nuevo");
        }
        prt.getUsuario().setPassword(passwordEncoder.encode(nuevaPassword));
        prt.setUsado(true);
    }
}
