package com.hikariforge.store.domain;

// Roles de usuario. Spring Security espera el prefijo "ROLE_" en las autoridades,
// que añadimos al construir el UserDetails (ver CustomUserDetailsService).
public enum Rol {
    CLIENTE,
    ADMIN
}
