package com.hikariforge.store.domain;

/**
 * Tipo de dato de un atributo del catálogo. Determina qué control muestra el
 * formulario de administración y cómo se valida el valor antes de guardarlo.
 */
public enum TipoAtributo {
    TEXTO,      // texto libre (p. ej. modelo de sensor)
    NUMERO,     // entero o decimal (p. ej. DPI, peso)
    BOOLEANO,   // sí / no (p. ej. hot-swap, RGB)
    LISTA       // valor elegido de un conjunto cerrado de opciones
}
