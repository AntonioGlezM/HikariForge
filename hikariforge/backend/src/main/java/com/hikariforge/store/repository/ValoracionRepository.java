package com.hikariforge.store.repository;

import com.hikariforge.store.domain.Valoracion;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Acceso a las valoraciones. Incluye las consultas necesarias para mostrar las
 * reseñas de un producto, recuperar la del usuario actual y comprobar si compró
 * el producto (requisito para poder valorarlo).
 */
public interface ValoracionRepository extends JpaRepository<Valoracion, UUID> {

    // Reseñas de un producto, la más reciente primero.
    List<Valoracion> findByProductoIdOrderByFechaDesc(UUID productoId);

    // La valoración de un usuario sobre un producto (si existe), para editarla.
    Optional<Valoracion> findByProductoIdAndUsuarioId(UUID productoId, UUID usuarioId);
}
