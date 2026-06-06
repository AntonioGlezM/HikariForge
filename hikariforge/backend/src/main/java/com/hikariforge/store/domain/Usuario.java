package com.hikariforge.store.domain;

import jakarta.persistence.*;
import java.util.UUID;
import lombok.*;

// Usuario registrado. La contraseña se guarda siempre cifrada (BCrypt), nunca en claro.
@Entity
@Table(name = "usuario")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password; // hash BCrypt

    private String nombre;

    @Enumerated(EnumType.STRING) // guarda "CLIENTE"/"ADMIN" como texto, no como número
    @Column(nullable = false)
    private Rol rol;
}
