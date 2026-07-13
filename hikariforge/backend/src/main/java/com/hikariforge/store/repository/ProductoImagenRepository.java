package com.hikariforge.store.repository;

import com.hikariforge.store.domain.ProductoImagen;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoImagenRepository extends JpaRepository<ProductoImagen, UUID> {
    List<ProductoImagen> findByProductoIdOrderByOrden(UUID productoId);
    void deleteByProductoId(UUID productoId);
}
