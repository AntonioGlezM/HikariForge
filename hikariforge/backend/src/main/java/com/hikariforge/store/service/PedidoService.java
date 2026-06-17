package com.hikariforge.store.service;

import com.hikariforge.store.domain.*;
import com.hikariforge.store.dto.CrearPedidoRequest;
import com.hikariforge.store.dto.PedidoResponse;
import com.hikariforge.store.exception.RecursoNoEncontradoException;
import com.hikariforge.store.repository.PedidoRepository;
import com.hikariforge.store.repository.ProductoRepository;
import com.hikariforge.store.repository.UsuarioRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    public PedidoService(PedidoRepository pedidoRepository, ProductoRepository productoRepository,
                         UsuarioRepository usuarioRepository) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    // Crea un pedido del usuario autenticado a partir de las líneas del carrito.
    // Valida el stock de cada producto y lo descuenta en la misma transacción.
    @Transactional
    public PedidoResponse crear(String emailUsuario, CrearPedidoRequest req) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        Pedido pedido = Pedido.builder()
                .usuario(usuario)
                .fecha(LocalDateTime.now())
                .estado(EstadoPedido.PENDIENTE)
                .build();

        for (CrearPedidoRequest.Linea linea : req.lineas()) {
            Producto producto = productoRepository.findById(linea.productoId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado"));

            if (!producto.getActivo()) {
                throw new IllegalArgumentException("El producto ya no está disponible: " + producto.getNombre());
            }
            if (producto.getStock() < linea.cantidad()) {
                throw new IllegalArgumentException("Stock insuficiente para " + producto.getNombre());
            }
            producto.setStock(producto.getStock() - linea.cantidad());

            pedido.getLineas().add(LineaPedido.builder()
                    .pedido(pedido)
                    .producto(producto)
                    .cantidad(linea.cantidad())
                    .precioUnitario(producto.getPrecioEfectivo()) // precio vigente (oferta si la hay) en el momento de la compra
                    .build());
        }

        return aResponse(pedidoRepository.save(pedido));
    }

    // Pedidos del usuario autenticado, el más reciente primero.
    @Transactional(readOnly = true)
    public List<PedidoResponse> listarMios(String emailUsuario) {
        return pedidoRepository.findByUsuario_EmailOrderByFechaDesc(emailUsuario)
                .stream().map(this::aResponse).toList();
    }

    // Todos los pedidos de la tienda (zona admin), el más reciente primero.
    @Transactional(readOnly = true)
    public List<PedidoResponse> listarTodos() {
        return pedidoRepository.findAll(org.springframework.data.domain.Sort.by("fecha").descending())
                .stream().map(this::aResponse).toList();
    }

    // Cambia el estado del pedido (zona admin).
    @Transactional
    public PedidoResponse cambiarEstado(java.util.UUID id, EstadoPedido estado) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido no encontrado"));
        pedido.setEstado(estado);
        return aResponse(pedido);
    }

    private PedidoResponse aResponse(Pedido p) {
        List<PedidoResponse.Linea> lineas = p.getLineas().stream()
                .map(l -> new PedidoResponse.Linea(
                        l.getProducto().getNombre(), l.getCantidad(), l.getPrecioUnitario()))
                .toList();
        BigDecimal total = p.getLineas().stream()
                .map(l -> l.getPrecioUnitario().multiply(BigDecimal.valueOf(l.getCantidad())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new PedidoResponse(p.getId(), p.getFecha(), p.getEstado().name(),
                p.getUsuario().getEmail(), total, lineas);
    }
}
