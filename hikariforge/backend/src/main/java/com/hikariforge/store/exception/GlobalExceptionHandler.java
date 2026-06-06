package com.hikariforge.store.exception;

import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

// Centraliza la conversión de excepciones en respuestas HTTP coherentes.
// Así los controladores no repiten try/catch por todas partes.
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<Map<String, Object>> noEncontrado(RecursoNoEncontradoException ex) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    // Reglas de negocio violadas, p. ej. email ya registrado -> 400.
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> peticionInvalida(IllegalArgumentException ex) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    // Email o contraseña incorrectos en el login -> 401.
    @ExceptionHandler(org.springframework.security.authentication.BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> credenciales(Exception ex) {
        return build(HttpStatus.UNAUTHORIZED, "Email o contraseña incorrectos");
    }

    // Errores de validación de DTOs (@NotBlank, @Positive...) -> 400 con detalle por campo.
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> validacion(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(e -> errores.put(e.getField(), e.getDefaultMessage()));
        Map<String, Object> body = baseBody(HttpStatus.BAD_REQUEST, "Datos inválidos");
        body.put("errores", errores);
        return ResponseEntity.badRequest().body(body);
    }

    private ResponseEntity<Map<String, Object>> build(HttpStatus status, String mensaje) {
        return ResponseEntity.status(status).body(baseBody(status, mensaje));
    }

    private Map<String, Object> baseBody(HttpStatus status, String mensaje) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("mensaje", mensaje);
        return body;
    }
}
