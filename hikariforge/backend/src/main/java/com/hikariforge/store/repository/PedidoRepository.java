package com.hikariforge.store.repository;

import com.hikariforge.store.domain.Pedido;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoRepository extends JpaRepository<Pedido, UUID> {

    List<Pedido> findByUsuarioId(UUID usuarioId);

    // Pedidos del usuario autenticado (por email del token), el más reciente primero.
    List<Pedido> findByUsuario_EmailOrderByFechaDesc(String email);
}
