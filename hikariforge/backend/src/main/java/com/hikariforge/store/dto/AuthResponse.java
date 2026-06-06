package com.hikariforge.store.dto;

// Respuesta del login/registro: el token JWT que el frontend guardará
// y enviará en la cabecera Authorization de las siguientes peticiones.
public record AuthResponse(String token, String email, String rol) {}
