package com.hikariforge.store.repository;

import com.hikariforge.store.domain.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

// JpaRepository ya aporta findAll, findById, save, delete... sin escribir SQL.
public interface CategoriaRepository extends JpaRepository<Categoria, UUID> {
}
