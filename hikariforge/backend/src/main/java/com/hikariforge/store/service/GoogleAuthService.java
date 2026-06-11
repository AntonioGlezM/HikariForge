package com.hikariforge.store.service;

import com.hikariforge.store.domain.Rol;
import com.hikariforge.store.domain.Usuario;
import com.hikariforge.store.dto.AuthResponse;
import com.hikariforge.store.repository.UsuarioRepository;
import com.hikariforge.store.security.JwtService;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

// Login con Google: el frontend envía el idToken emitido por Google y aquí se
// verifica contra el endpoint oficial de Google antes de emitir nuestro JWT.
@Service
public class GoogleAuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RestClient restClient = RestClient.create();

    // Client ID de la app en Google Cloud Console (se configura en application.yml).
    @Value("${google.client-id}")
    private String clientId;

    public GoogleAuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder,
                             JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @SuppressWarnings("unchecked")
    public AuthResponse loginConGoogle(String idToken) {
        // 1) Google verifica el token (firma, caducidad...) y devuelve sus datos.
        Map<String, Object> info;
        try {
            info = restClient.get()
                    .uri("https://oauth2.googleapis.com/tokeninfo?id_token={t}", idToken)
                    .retrieve()
                    .body(Map.class);
        } catch (Exception e) {
            throw new IllegalArgumentException("Token de Google no válido");
        }

        // 2) El token debe haberse emitido para NUESTRA aplicación (mismo client id).
        if (info == null || !clientId.equals(info.get("aud"))) {
            throw new IllegalArgumentException("Token de Google no válido");
        }

        String email = (String) info.get("email");
        String nombre = (String) info.getOrDefault("name", email);

        // 3) Si es la primera vez, se crea el usuario como CLIENTE.
        //    La contraseña aleatoria evita que se pueda entrar por el login normal.
        Usuario usuario = usuarioRepository.findByEmail(email).orElseGet(() -> {
            Usuario nuevo = Usuario.builder()
                    .email(email)
                    .nombre(nombre)
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .rol(Rol.CLIENTE)
                    .build();
            return usuarioRepository.save(nuevo);
        });

        // 4) Emitimos nuestro JWT, exactamente igual que en el login normal.
        String token = jwtService.generarToken(usuario.getEmail(), usuario.getRol().name());
        return new AuthResponse(token, usuario.getEmail(), usuario.getRol().name());
    }
}
