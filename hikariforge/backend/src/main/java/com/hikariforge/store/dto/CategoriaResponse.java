package com.hikariforge.store.dto;

import java.util.UUID;

// Categoría tal y como la consume el frontend (p. ej. el selector del admin).
public record CategoriaResponse(UUID id, String nombre) {}
