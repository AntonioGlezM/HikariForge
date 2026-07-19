package com.hikariforge.store.repository;

import com.hikariforge.store.domain.Cupon;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CuponRepository extends JpaRepository<Cupon, UUID> {
    Optional<Cupon> findByCodigoIgnoreCase(String codigo);
}
