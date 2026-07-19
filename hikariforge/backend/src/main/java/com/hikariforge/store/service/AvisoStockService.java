package com.hikariforge.store.service;

import com.hikariforge.store.domain.AvisoStock;
import com.hikariforge.store.domain.Producto;
import com.hikariforge.store.exception.RecursoNoEncontradoException;
import com.hikariforge.store.repository.AvisoStockRepository;
import com.hikariforge.store.repository.ProductoRepository;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Aviso "disponible de nuevo": apuntarse cuando un producto está agotado y
// notificación automática cuando el stock vuelve (lo dispara ProductoService).
@Service
public class AvisoStockService {

    private final AvisoStockRepository avisoRepository;
    private final ProductoRepository productoRepository;
    private final EmailService emailService;
    private final String frontendUrl;

    public AvisoStockService(AvisoStockRepository avisoRepository, ProductoRepository productoRepository,
                             EmailService emailService,
                             @Value("${app.frontend-url}") String frontendUrl) {
        this.avisoRepository = avisoRepository;
        this.productoRepository = productoRepository;
        this.emailService = emailService;
        this.frontendUrl = frontendUrl;
    }

    // Apunta un email al aviso de un producto agotado (invitados incluidos).
    @Transactional
    public void registrar(UUID productoId, String email) {
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado"));
        if (producto.getStock() != null && producto.getStock() > 0) {
            throw new IllegalArgumentException("El producto ya tiene stock disponible");
        }
        if (avisoRepository.existsByProductoIdAndEmailIgnoreCase(productoId, email.trim())) {
            throw new IllegalArgumentException("Ya estás apuntado al aviso de este producto");
        }
        avisoRepository.save(AvisoStock.builder()
                .producto(producto).email(email.trim().toLowerCase()).build());
    }

    // Notifica a todos los emails pendientes de un producto (stock repuesto)
    // y los marca como avisados. El fallo de un correo no interrumpe el resto.
    @Transactional
    public void notificarDisponible(Producto producto) {
        var pendientes = avisoRepository.findByProductoIdAndAvisadoFalse(producto.getId());
        String enlace = frontendUrl + "/producto/" + producto.getId();
        String html = """
                <div style="font-family:Arial,sans-serif;max-width:460px">
                  <h2 style="letter-spacing:1px">HIKARIFORGE</h2>
                  <p><b>¡%s vuelve a estar disponible!</b></p>
                  <p>Nos pediste que te avisáramos: ya hay unidades de nuevo.
                     Date prisa, que vuelan.</p>
                  <p style="text-align:center;margin:24px 0">
                    <a href="%s" style="background:#141414;color:#fff;padding:12px 26px;
                       border-radius:999px;text-decoration:none;font-weight:bold">Ver el producto</a>
                  </p>
                </div>
                """.formatted(producto.getNombre(), enlace);
        for (AvisoStock aviso : pendientes) {
            emailService.enviar(aviso.getEmail(),
                    producto.getNombre() + " vuelve a estar disponible — HikariForge", html);
            aviso.setAvisado(true);
        }
    }
}
