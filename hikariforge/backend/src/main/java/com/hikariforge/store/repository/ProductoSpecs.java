package com.hikariforge.store.repository;

import com.hikariforge.store.domain.Producto;
import java.math.BigDecimal;
import java.util.UUID;
import org.springframework.data.jpa.domain.Specification;

// Construye la consulta del catálogo de forma dinámica: cada filtro solo se
// aplica si llega informado, y todos se combinan con AND. Así un mismo endpoint
// sirve para buscar por texto, categoría, marca y rango de precio a la vez.
public final class ProductoSpecs {

    private ProductoSpecs() {}

    public static Specification<Producto> soloActivos() {
        return (root, q, cb) -> cb.isTrue(root.get("activo"));
    }

    // Coincidencia por nombre O marca (búsqueda libre del usuario).
    public static Specification<Producto> texto(String texto) {
        if (texto == null || texto.isBlank()) return null;
        String patron = "%" + texto.toLowerCase().trim() + "%";
        return (root, q, cb) -> cb.or(
                cb.like(cb.lower(root.get("nombre")), patron),
                cb.like(cb.lower(root.get("marca")), patron));
    }

    public static Specification<Producto> categoria(UUID categoriaId) {
        if (categoriaId == null) return null;
        return (root, q, cb) -> cb.equal(root.get("categoria").get("id"), categoriaId);
    }

    public static Specification<Producto> marca(String marca) {
        if (marca == null || marca.isBlank()) return null;
        return (root, q, cb) -> cb.equal(root.get("marca"), marca);
    }

    public static Specification<Producto> precioMaximo(BigDecimal max) {
        if (max == null) return null;
        return (root, q, cb) -> cb.lessThanOrEqualTo(root.get("precio"), max);
    }

    public static Specification<Producto> soloConStock(Boolean enStock) {
        if (enStock == null || !enStock) return null;
        return (root, q, cb) -> cb.greaterThan(root.get("stock"), 0);
    }
}
