package com.hikariforge.store.repository;

import com.hikariforge.store.domain.HistorialPrecio;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Acceso al historial de precios. La consulta clave devuelve el precio mínimo
 * registrado para un producto desde una fecha (los últimos 30 días), que es el
 * dato exigido por Omnibus al mostrar un descuento.
 */
public interface HistorialPrecioRepository extends JpaRepository<HistorialPrecio, UUID> {

    @Query("""
           SELECT MIN(h.precio) FROM HistorialPrecio h
           WHERE h.producto.id = :productoId AND h.fecha >= :desde
           """)
    BigDecimal precioMinimoDesde(@Param("productoId") UUID productoId,
                                 @Param("desde") LocalDateTime desde);
}
