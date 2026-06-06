package com.hikariforge.store.exception;

// Excepción de negocio para "no existe el recurso pedido". El handler la traduce a 404.
public class RecursoNoEncontradoException extends RuntimeException {
    public RecursoNoEncontradoException(String mensaje) {
        super(mensaje);
    }
}
