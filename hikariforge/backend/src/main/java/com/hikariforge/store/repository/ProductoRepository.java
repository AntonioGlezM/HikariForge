package com.hikariforge.store.repository;

import com.hikariforge.store.domain.Producto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ProductoRepository extends JpaRepository<Producto, UUID> {

    // Catálogo público: solo productos activos.
    Page<Producto> findByActivoTrue(Pageable pageable);

    // Spring Data genera la consulta a partir del nombre del método.
    // Búsqueda paginada por nombre (ignorando mayúsculas) para el filtro del catálogo.
    Page<Producto> findByNombreContainingIgnoreCase(String nombre, Pageable pageable);

    Page<Producto> findByCategoriaId(UUID categoriaId, Pageable pageable);
}
