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
    private final EmailService emailService;

    private final CuponService cuponService;

    public PedidoService(PedidoRepository pedidoRepository, ProductoRepository productoRepository,
                         UsuarioRepository usuarioRepository, EmailService emailService,
                         CuponService cuponService) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
        this.emailService = emailService;
        this.cuponService = cuponService;
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
                // Dirección de envío del formulario de checkout (Fase 1)
                .destinatario(req.destinatario().trim())
                .direccion(req.direccion().trim())
                .ciudad(req.ciudad().trim())
                .provincia(req.provincia().trim())
                .codigoPostal(req.codigoPostal().trim())
                .telefono(req.telefono().trim())
                .notas(req.notas() != null && !req.notas().isBlank() ? req.notas().trim() : null)
                .build();

        // Cupón (Fase 5): se valida y consume en esta misma transacción; el código
        // y el porcentaje quedan congelados en el pedido (si el cupón cambia después,
        // este pedido no se ve afectado).
        if (req.cupon() != null && !req.cupon().isBlank()) {
            var cupon = cuponService.consumir(req.cupon());
            pedido.setCuponCodigo(cupon.getCodigo());
            pedido.setDescuentoPct(cupon.getPorcentaje());
        }

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

        PedidoResponse respuesta = aResponse(pedidoRepository.save(pedido));
        enviarConfirmacion(usuario, respuesta); // si el correo falla, el pedido se crea igual
        return respuesta;
    }

    // Correo de confirmación con el resumen del pedido y la dirección en vertical.
    private void enviarConfirmacion(Usuario usuario, PedidoResponse p) {
        StringBuilder filas = new StringBuilder();
        for (PedidoResponse.Linea l : p.lineas()) {
            filas.append("<tr><td style='padding:6px 0;border-bottom:1px solid #eee'>")
                 .append(l.productoNombre()).append(" ×").append(l.cantidad())
                 .append("</td><td style='padding:6px 0;border-bottom:1px solid #eee;text-align:right'><b>")
                 .append(l.precioUnitario().multiply(java.math.BigDecimal.valueOf(l.cantidad())))
                 .append(" €</b></td></tr>");
        }
        String html = """
                <div style="font-family:Arial,sans-serif;max-width:460px">
                  <h2 style="letter-spacing:1px">HIKARIFORGE</h2>
                  <p><b>¡Gracias por tu pedido%s!</b></p>
                  <p style="color:#777;font-size:13px">Pedido #%s</p>
                  <table style="width:100%%;border-collapse:collapse;font-size:14px">%s
                    <tr><td style="padding:10px 0;font-weight:bold">Total</td>
                        <td style="padding:10px 0;text-align:right;font-weight:bold">%s €</td></tr>
                  </table>
                  <p style="font-size:13px;line-height:1.7;margin-top:14px">
                    <b>Envío a:</b><br>%s<br>%s<br>%s %s, %s<br>%s
                  </p>
                  <p style="color:#999;font-size:12px">Te avisaremos cuando tu pedido salga de camino.</p>
                </div>
                """.formatted(
                usuario.getNombre() != null ? ", " + usuario.getNombre() : "",
                p.id().toString().substring(0, 8),
                filas, p.total(),
                p.destinatario(), p.direccion(), p.codigoPostal(), p.ciudad(), p.provincia(), p.telefono());
        emailService.enviar(usuario.getEmail(),
                "Confirmación de tu pedido #" + p.id().toString().substring(0, 8) + " — HikariForge", html);
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

    // El cliente cancela SU pedido, solo si sigue PENDIENTE. Se repone el stock
    // de cada línea en la misma transacción (si no, se perdería inventario).
    @Transactional
    public PedidoResponse cancelar(String emailUsuario, java.util.UUID id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido no encontrado"));

        if (!pedido.getUsuario().getEmail().equals(emailUsuario)) {
            throw new IllegalArgumentException("El pedido no pertenece a este usuario");
        }
        if (pedido.getEstado() != EstadoPedido.PENDIENTE) {
            throw new IllegalArgumentException("Solo se pueden cancelar pedidos pendientes");
        }

        pedido.getLineas().forEach(l ->
                l.getProducto().setStock(l.getProducto().getStock() + l.getCantidad()));
        pedido.setEstado(EstadoPedido.CANCELADO);
        return aResponse(pedido);
    }

    // Cambia el estado del pedido (zona admin).
    @Transactional
    public PedidoResponse cambiarEstado(java.util.UUID id, EstadoPedido estado) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido no encontrado"));
        pedido.setEstado(estado);
        return aResponse(pedido);
    }

    PedidoResponse aResponse(Pedido p) { // visible en el paquete: lo usa también PagoService
        List<PedidoResponse.Linea> lineas = p.getLineas().stream()
                .map(l -> new PedidoResponse.Linea(
                        l.getProducto().getNombre(), l.getCantidad(), l.getPrecioUnitario()))
                .toList();
        BigDecimal total = p.getLineas().stream()
                .map(l -> l.getPrecioUnitario().multiply(BigDecimal.valueOf(l.getCantidad())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        // Descuento del cupón (Fase 5): se resta del subtotal, redondeado a céntimos.
        if (p.getDescuentoPct() != null && p.getDescuentoPct() > 0) {
            BigDecimal descuento = total.multiply(BigDecimal.valueOf(p.getDescuentoPct()))
                    .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
            total = total.subtract(descuento);
        }
        return new PedidoResponse(p.getId(), p.getFecha(), p.getEstado().name(),
                p.getUsuario().getEmail(), total,
                p.getDestinatario(), p.getDireccion(), p.getCiudad(), p.getProvincia(),
                p.getCodigoPostal(), p.getTelefono(), p.getNotas(),
                p.getCuponCodigo(), p.getDescuentoPct(), lineas);
    }
}
