package com.hikariforge.store.repository;

import com.hikariforge.store.domain.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, UUID> {

    List<Pedido> findByUsuarioId(UUID usuarioId);
}
