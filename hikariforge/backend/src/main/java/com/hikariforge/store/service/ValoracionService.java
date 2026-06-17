package com.hikariforge.store.service;

import com.hikariforge.store.domain.*;
import com.hikariforge.store.dto.*;
import com.hikariforge.store.exception.RecursoNoEncontradoException;
import com.hikariforge.store.repository.*;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Lógica de las valoraciones de productos. Reglas de negocio principales:
 * solo puede valorar quien ha comprado el producto, y cada usuario tiene como
 * mucho una valoración por producto (si vuelve a enviar, se actualiza).
 */
@Service
public class ValoracionService {

    private final ValoracionRepository valoracionRepository;
    private final CompraRepository compraRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    public ValoracionService(ValoracionRepository valoracionRepository, CompraRepository compraRepository,
                             ProductoRepository productoRepository, UsuarioRepository usuarioRepository) {
        this.valoracionRepository = valoracionRepository;
        this.compraRepository = compraRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    /** Resumen (media, total y lista) de un producto. Marca como "mía" la del usuario actual. */
    @Transactional(readOnly = true)
    public ResumenValoraciones resumen(java.util.UUID productoId, String emailActual) {
        List<Valoracion> lista = valoracionRepository.findByProductoIdOrderByFechaDesc(productoId);

        double media = lista.stream().mapToInt(Valoracion::getEstrellas).average().orElse(0);
        List<ValoracionResponse> dtos = lista.stream()
                .map(v -> aResponse(v, emailActual))
                .toList();

        // Media redondeada a un decimal para mostrarla limpia (p. ej. 4.3).
        return new ResumenValoraciones(Math.round(media * 10) / 10.0, lista.size(), dtos);
    }

    /**
     * Crea la valoración del usuario o, si ya tenía una, la actualiza.
     * Exige que el usuario haya comprado el producto.
     */
    @Transactional
    public ValoracionResponse valorar(java.util.UUID productoId, String email, CrearValoracionRequest req) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado"));

        if (compraRepository.contarCompras(productoId, usuario.getId()) == 0) {
            throw new IllegalArgumentException("Solo puedes valorar productos que has comprado");
        }

        // Si ya existe su valoración, se edita; si no, se crea una nueva.
        Valoracion valoracion = valoracionRepository
                .findByProductoIdAndUsuarioId(productoId, usuario.getId())
                .orElseGet(() -> Valoracion.builder().producto(producto).usuario(usuario).build());

        valoracion.setEstrellas(req.estrellas());
        valoracion.setComentario(req.comentario());
        valoracion.setFecha(LocalDateTime.now());

        return aResponse(valoracionRepository.save(valoracion), email);
    }

    /**
     * Borra una valoración. La puede borrar su autor o un administrador (para
     * moderar reseñas abusivas); cualquier otro usuario recibe un error.
     */
    @Transactional
    public void borrar(java.util.UUID valoracionId, String email, boolean esAdmin) {
        Valoracion v = valoracionRepository.findById(valoracionId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Valoración no encontrada"));
        if (!esAdmin && !v.getUsuario().getEmail().equals(email)) {
            throw new IllegalArgumentException("No puedes borrar una valoración que no es tuya");
        }
        valoracionRepository.delete(v);
    }

    /** Todas las reseñas de la tienda para el panel de moderación (solo admin). */
    @Transactional(readOnly = true)
    public java.util.List<ValoracionAdminResponse> listarTodas() {
        return valoracionRepository.findAllByOrderByFechaDesc().stream()
                .map(v -> new ValoracionAdminResponse(
                        v.getId(), v.getProducto().getNombre(), v.getProducto().getId(),
                        v.getUsuario().getEmail(), v.getEstrellas(), v.getComentario(), v.getFecha()))
                .toList();
    }

    // El autor se muestra por nombre (o la parte local del email si no tiene nombre).
    private ValoracionResponse aResponse(Valoracion v, String emailActual) {
        String nombre = v.getUsuario().getNombre();
        if (nombre == null || nombre.isBlank()) {
            nombre = v.getUsuario().getEmail().split("@")[0];
        }
        boolean mia = v.getUsuario().getEmail().equals(emailActual);
        return new ValoracionResponse(v.getId(), nombre, v.getEstrellas(), v.getComentario(), v.getFecha(), mia);
    }
}
