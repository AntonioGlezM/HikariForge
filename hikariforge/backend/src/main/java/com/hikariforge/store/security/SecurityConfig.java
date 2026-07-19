package com.hikariforge.store.security;

import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;
import java.util.List;

// Configuración central de seguridad: qué rutas son públicas, sesión sin estado
// (porque usamos JWT), CORS para el SPA y registro del filtro JWT.
@Configuration
@EnableMethodSecurity // habilita @PreAuthorize en los controladores
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable) // innecesario en una API stateless con JWT
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // Sin sesiones de servidor: cada petición se autentica con su token.
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Rutas públicas: login/registro, documentación y lectura del catálogo.
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/productos/**", "/api/categorias/**").permitAll()
                // Aviso "disponible de nuevo": los invitados también pueden apuntarse.
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/productos/*/avisar-stock").permitAll()
                // El resumen de valoraciones es público (la ficha lo muestra a cualquiera).
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/productos/*/valoraciones").permitAll()
                // Consultar el catálogo de atributos de una categoría es público
                // (lo usan el formulario de producto y la ficha). Crear/editar/borrar
                // queda protegido por @PreAuthorize en el controlador.
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/atributos").permitAll()
                // El resto requiere estar autenticado.
                .anyRequest().authenticated())
            // Sin sesión válida (token ausente o caducado) -> 401 con un mensaje
            // claro, en vez del 403 mudo por defecto. Así el frontend detecta la
            // sesión caducada y redirige al login. El 403 queda para su significado
            // real: autenticado pero sin permisos (p. ej. no-admin en /api/admin).
            .exceptionHandling(ex -> ex.authenticationEntryPoint((request, response, authEx) -> {
                response.setStatus(401);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"mensaje\":\"Sesión caducada o no iniciada. Vuelve a entrar.\"}");
            }))
            // Ejecuta nuestro filtro JWT antes del filtro estándar de usuario/contraseña.
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // Permite que el frontend (Vite en localhost:5173) llame a la API desde el navegador.
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // BCrypt para cifrar contraseñas (nunca se guardan en texto plano).
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Necesario para autenticar manualmente en el login.
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
