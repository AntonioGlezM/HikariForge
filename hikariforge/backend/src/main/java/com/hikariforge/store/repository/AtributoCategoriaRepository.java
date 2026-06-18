package com.hikariforge.store.repository;

import com.hikariforge.store.domain.AtributoCategoria;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Acceso al catálogo de atributos. Las consultas devuelven los atributos ya
 * ordenados por sección y orden, que es como se muestran en formulario y ficha.
 */
public interface AtributoCategoriaRepository extends JpaRepository<AtributoCategoria, UUID> {

    List<AtributoCategoria> findByCategoriaIdOrderBySeccionAscOrdenAsc(UUID categoriaId);
}
