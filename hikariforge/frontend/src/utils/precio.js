/**
 * Lógica de precios de un producto en un solo sitio, para que tarjetas, ficha,
 * carrito y pedidos calculen igual.
 *
 * La VIGENCIA de la oferta (fecha límite o "hasta fin de existencias") la decide
 * el backend y llega en el campo `ofertaVigente`. Si por lo que sea no viene
 * (datos antiguos), se recurre a la comprobación local de que el precio de oferta
 * sea válido. Así el frontend nunca muestra una oferta que el backend no aplicaría.
 */

// ¿El producto tiene una oferta vigente ahora mismo?
export function tieneOferta(p) {
  if (p?.ofertaVigente != null) return p.ofertaVigente;
  // Respaldo para datos sin el campo de vigencia: solo validez del precio.
  return p?.precioOferta != null
    && Number(p.precioOferta) > 0
    && Number(p.precioOferta) < Number(p.precio);
}

// Precio al que se vende realmente (oferta si está vigente, si no el normal).
export function precioEfectivo(p) {
  return tieneOferta(p) ? Number(p.precioOferta) : Number(p.precio);
}

// Porcentaje de descuento redondeado (p. ej. 20 para "-20%"). 0 si no hay oferta.
export function porcentajeDescuento(p) {
  if (!tieneOferta(p)) return 0;
  return Math.round((1 - Number(p.precioOferta) / Number(p.precio)) * 100);
}
