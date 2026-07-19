package com.hikariforge.store.repository;

import com.hikariforge.store.domain.AvisoStock;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AvisoStockRepository extends JpaRepository<AvisoStock, UUID> {
    List<AvisoStock> findByProductoIdAndAvisadoFalse(UUID productoId);
    boolean existsByProductoIdAndEmailIgnoreCase(UUID productoId, String email);
}
