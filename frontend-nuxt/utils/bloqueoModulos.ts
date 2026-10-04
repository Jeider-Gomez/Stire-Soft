// Bloqueo suave por módulo (MOD-01 y UI-02 de la lista de chequeo de Sistemas Tutores, Caro 2015; pedido de Jeider el
// 04/10: «un bloque por módulo no tan exigente pero que sí exija cierto dominio, y que se avise»).
// - El módulo siguiente se abre cuando el dominio PROMEDIO del anterior llega al umbral de la clase (50 % por defecto).
//   El promedio cuenta todas las lecciones del módulo (las no empezadas suman 0): exige haber trabajado buena parte.
// - Lo que el estudiante ya empezó nunca se bloquea (no se le quita lo que tenía).
// - Umbral 0 = sin bloqueo (el docente lo apaga en Ajustes).
// - Dentro de un módulo abierto la navegación es libre.

export interface ModuloParaBloqueo {
  id: number
  titulo: string
  lecciones: ReadonlyArray<{ dominio: number; empezada: boolean }>
}

export interface EstadoModulo {
  id: number
  abierto: boolean
  /** Dominio promedio de este módulo (0–100, redondeado). */
  dominio: number
  /** Si está cerrado: qué módulo hay que trabajar, cuánto lleva y cuánto pide. */
  requiere: { moduloId: number; titulo: string; dominio: number; umbral: number } | null
}

export function dominioDelModulo(m: ModuloParaBloqueo): number {
  if (m.lecciones.length === 0) return 100 // un módulo sin lecciones no detiene a nadie
  const suma = m.lecciones.reduce((s, l) => s + Math.max(0, Math.min(100, l.dominio)), 0)
  return Math.round(suma / m.lecciones.length)
}

export function estadoDeModulos(modulos: ReadonlyArray<ModuloParaBloqueo>, umbral: number): EstadoModulo[] {
  const estados: EstadoModulo[] = []
  modulos.forEach((m, i) => {
    const dominio = dominioDelModulo(m)
    if (i === 0 || umbral <= 0) {
      estados.push({ id: m.id, abierto: true, dominio, requiere: null })
      return
    }
    const anterior = modulos[i - 1]
    const estadoAnterior = estados[i - 1]
    const yaEmpezado = m.lecciones.some((l) => l.empezada)
    const alcanzado = estadoAnterior.abierto && estadoAnterior.dominio >= umbral
    const abierto = yaEmpezado || alcanzado
    estados.push({
      id: m.id,
      abierto,
      dominio,
      requiere: abierto ? null : { moduloId: anterior.id, titulo: anterior.titulo, dominio: estadoAnterior.dominio, umbral },
    })
  })
  return estados
}

/** Aviso del próximo módulo cerrado para el inicio: el primero que falta abrir. */
export function proximoModuloCerrado(modulos: ReadonlyArray<ModuloParaBloqueo>, estados: ReadonlyArray<EstadoModulo>) {
  const i = estados.findIndex((e) => !e.abierto)
  if (i < 0) return null
  const r = estados[i].requiere!
  return {
    modulo: { id: modulos[i].id, titulo: modulos[i].titulo },
    anterior: { id: r.moduloId, titulo: r.titulo },
    dominio: r.dominio,
    umbral: r.umbral,
    falta: Math.max(0, r.umbral - r.dominio),
  }
}
