// Textos de la tarjeta «Perfil de aprendizaje» (MOD-02; el cálculo está en src/analytics/perfil-aprendizaje.ts). Describe
// cómo estudia el estudiante con sus datos reales, para que lo piense; no lo encasilla ni cambia lo que STIRE le muestra.

export interface PerfilAprendizaje {
  errores: {
    seRepiten: Array<{ tipo: string; veces: number; explicacion: string; ultima: string }>
    conceptoUnaVez: number
    descuidos: number
  }
  orden: { enOrden: number; saltos: number; pctEnOrden: number | null; etiqueta: 'secuencial' | 'global' | 'equilibrado' | null }
  formatos: { visual: number; verbal: number; pctVisual: number | null; etiqueta: 'visual' | 'verbal' | 'equilibrado' | null }
  dominio: { dominadas: number; enProceso: number; sinEmpezar: number; total: number }
}

/** Visual / Verbal en una frase; null si todavía no hay datos suficientes. */
export function fraseFormatos(f: PerfilAprendizaje['formatos'], tu = true): string | null {
  if (f.pctVisual === null || !f.etiqueta) return null
  const quien = tu ? 'Eliges' : 'Elige'
  if (f.etiqueta === 'visual') return `Más visual (${f.pctVisual} %): ${quien.toLowerCase()} sobre todo el diagrama, el video o el ejemplo en vivo.`
  if (f.etiqueta === 'verbal') return `Más verbal (${100 - f.pctVisual} %): ${quien.toLowerCase()} sobre todo el pseudocódigo, el paso a paso o escuchar.`
  return `Equilibrado: ${quien.toLowerCase()} tanto formatos visuales (${f.pctVisual} %) como de palabras.`
}

/** Global / Secuencial en una frase; null si todavía no hay datos suficientes. */
export function fraseOrden(o: PerfilAprendizaje['orden'], tu = true): string | null {
  if (o.pctEnOrden === null || !o.etiqueta) return null
  const sigue = tu ? 'Sigues' : 'Sigue'
  const salta = tu ? 'saltas' : 'salta'
  if (o.etiqueta === 'secuencial') return `Secuencial (${o.pctEnOrden} %): ${sigue.toLowerCase()} las lecciones en el orden del plan.`
  if (o.etiqueta === 'global') return `Global (${100 - o.pctEnOrden} %): ${salta} entre lecciones para ver el panorama.`
  return `Equilibrado: a veces ${sigue.toLowerCase()} el orden del plan y a veces ${salta} entre lecciones.`
}

/** El temario: porcentaje dominado, en proceso y sin empezar (verde, ámbar y gris), sumando 100. */
export function partesDominio(d: PerfilAprendizaje['dominio']): { dominado: number; proceso: number; pendiente: number } {
  if (d.total === 0) return { dominado: 0, proceso: 0, pendiente: 100 }
  const dominado = Math.round((100 * d.dominadas) / d.total)
  const proceso = Math.round((100 * d.enProceso) / d.total)
  return { dominado, proceso, pendiente: Math.max(0, 100 - dominado - proceso) }
}
