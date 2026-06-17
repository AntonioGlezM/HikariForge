package com.hikariforge.store.repository;

import com.hikariforge.store.domain.LineaPedido;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Consultas sobre las líneas de pedido usadas para reglas de negocio, como
 * comprobar si un usuario ha comprado un producto (necesario para valorarlo).
 */
public interface CompraRepository extends JpaRepository<LineaPedido, UUID> {

    // Cuenta las veces que un usuario ha comprado un producto (cualquier pedido suyo).
    @Query("""
           SELECT COUNT(l) FROM LineaPedido l
           WHERE l.producto.id = :productoId AND l.pedido.usuario.id = :usuarioId
           """)
    long contarCompras(@Param("productoId") UUID productoId, @Param("usuarioId") UUID usuarioId);
}
