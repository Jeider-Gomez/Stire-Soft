// P60 (03/11, evaluación heurística, ítem 3): probando como estudiante, «Entregar» devolvió 400 («El intento ya fue
// procesado o ha expirado») y la pantalla no cambió; el error solo quedaba en la pestaña «Registro». El autoguardado
// también fallaba con 400 diez veces seguidas. La causa más probable: el intento se cerró en otra pestaña (o en otra
// entrega) y esta seguía usando su número. Aquí se reconoce ese caso y cada fallo se dice en pantalla con qué hacer.

// El servidor rechaza así un intento que ya no está abierto (submissions.service.ts: entregar y autoguardar).
export function intentoYaCerrado(status: number | undefined, mensaje: string): boolean {
  return status === 400 && /ya fue procesado|ha expirado|inv[aá]lido para autosave/i.test(mensaje)
}

/** Lo que ve el estudiante cuando una entrega falla: qué pasó y qué hacer, sin códigos de error. */
export function mensajeErrorEntrega(o: { status?: number; mensaje: string }): string {
  if (intentoYaCerrado(o.status, o.mensaje)) {
    return 'Este intento ya estaba cerrado (quizá lo entregaste en otra pestaña). Tu código sigue aquí: pulsa «Entregar» otra vez para entregarlo en un intento nuevo.'
  }
  // El servidor ya explica bien cuándo se reabre un intento: se muestra tal cual.
  if (o.status === 400 && /ya usaste los intentos/i.test(o.mensaje)) return o.mensaje
  if (!o.status) {
    return 'No hay conexión con STIRE. Tu código sigue aquí y en este equipo: vuelve a entregar cuando regrese la conexión.'
  }
  if (o.status >= 500) {
    return 'STIRE tuvo un problema al recibir tu entrega. Tu código no se perdió: vuelve a intentarlo en un momento.'
  }
  return `No se pudo entregar: ${o.mensaje}`
}

export const ENTREGA_TARDA =
  'Tu entrega quedó registrada, pero la calificación está tardando más de lo normal. El resultado llegará a tus notificaciones en unos minutos.'
