package com.hikariforge.store.service;

import com.hikariforge.store.domain.Cupon;
import com.hikariforge.store.dto.CuponRequest;
import com.hikariforge.store.exception.RecursoNoEncontradoException;
import com.hikariforge.store.repository.CuponRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Cupones: validación en el checkout y gestión en la zona admin.
@Service
public class CuponService {

    private final CuponRepository cuponRepository;

    public CuponService(CuponRepository cuponRepository) {
        this.cuponRepository = cuponRepository;
    }

    // Valida el código y devuelve el cupón. Lanza IllegalArgumentException con
    // el motivo exacto si no es aplicable (mensaje que verá el cliente).
    public Cupon validar(String codigo) {
        Cupon c = cuponRepository.findByCodigoIgnoreCase(codigo.trim())
                .orElseThrow(() -> new IllegalArgumentException("El cupón no existe"));
        if (!Boolean.TRUE.equals(c.getActivo())) throw new IllegalArgumentException("El cupón no está activo");
        if (c.getCaduca() != null && c.getCaduca().isBefore(LocalDate.now()))
            throw new IllegalArgumentException("El cupón ha caducado");
        if (c.getUsosMax() != null && c.getUsos() >= c.getUsosMax())
            throw new IllegalArgumentException("El cupón ha agotado sus usos");
        return c;
    }

    // Consume un uso del cupón (se llama al crear el pedido, en su transacción).
    @Transactional
    public Cupon consumir(String codigo) {
        Cupon c = validar(codigo);
        c.setUsos(c.getUsos() + 1);
        return c;
    }

    // ----- Zona admin -----

    public List<Cupon> listar() { return cuponRepository.findAll(); }

    @Transactional
    public Cupon crear(CuponRequest req) {
        cuponRepository.findByCodigoIgnoreCase(req.codigo().trim()).ifPresent(x -> {
            throw new IllegalArgumentException("Ya existe un cupón con ese código");
        });
        return cuponRepository.save(Cupon.builder()
                .codigo(req.codigo().trim().toUpperCase())
                .porcentaje(req.porcentaje())
                .usosMax(req.usosMax())
                .caduca(req.caduca())
                .build());
    }

    @Transactional
    public Cupon alternarActivo(UUID id) {
        Cupon c = cuponRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cupón no encontrado"));
        c.setActivo(!Boolean.TRUE.equals(c.getActivo()));
        return c;
    }

    public void eliminar(UUID id) { cuponRepository.deleteById(id); }
}
