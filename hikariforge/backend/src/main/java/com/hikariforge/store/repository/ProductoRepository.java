package com.hikariforge.store.repository;

import com.hikariforge.store.domain.Producto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.UUID;

public interface ProductoRepository extends JpaRepository<Producto, UUID>, JpaSpecificationExecutor<Producto> {

    // Catálogo público: solo productos activos.
    Page<Producto> findByActivoTrue(Pageable pageable);
}
