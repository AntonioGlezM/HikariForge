package com.hikariforge.store.repository;

import com.hikariforge.store.domain.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {

    // Lo usa el login para buscar al usuario por su email.
    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);
}
