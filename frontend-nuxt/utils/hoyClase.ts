// «Hoy» de una clase (docs/DISENO_INTERVENCION_DOCENTE.md §8, fase E): lo que el docente tiene pendiente, en orden de
// urgencia, y cada cosa con su acción. No es otro tablero de cifras: un tablero sirve cuando lo que muestra se puede
// convertir en una acción (Molenaar y Knoop-van Campen, 2019), y el docente atiende primero a quien está atascado
// ahora (Holstein, McLaren y Aleven, 2018). Ver docs/investigacion/BASE_TEORICA.md, BT-13.
import { enlaceNuevoRefuerzo } from './refuerzos'

export interface EntregaHoy {
  id: number; titulo: string; cierraAt: string | null; publicada: boolean; estudiantes: number
  conteo: { sin_entregar: number; por_revisar: number; revisada: number }
}
export interface MapaHoy {
  bloqueados: Array<{ studentId: number; fullName: string; unitId: number; unitTitle: string; fallosSeguidos: number }>
  segurosQueFallan: Array<{ studentId: number; fullName: string; unitId: number; unitTitle: string }>
  listosParaMas: Array<{ studentId: number; fullName: string }>
}
export interface RefuerzoHoy {
  id: number; tipo: 'refuerzo' | 'reto'; titulo: string; fechaLimite: string | null; archivado: boolean; createdAt: string
  totalPasos: number; lecciones: Array<{ id: number }>; estudiantes: Array<{ studentId: number; nombre: string; pasosHechos: number }>
}
/** GET /analytics/class/:id/semana (src/analytics/resumen-semanal.ts). */
export interface SemanaHoy {
  total: number
  estaSemana: { estudiantesActivos: number; ejercicios: number; aprobados: number }
  semanaAnterior: { estudiantesActivos: number; ejercicios: number; aprobados: number }
  sinActividad: Array<{ studentId: number; nombre: string; dias: number | null }>
}
/** Lo que se cargó; `null` si esa fuente no respondió (la pantalla lo dice y muestra el resto). */
export interface DatosHoy {
  classId: number
  solicitudes: number | null
  entregas: EntregaHoy[] | null
  mapa: MapaHoy | null
  refuerzos: RefuerzoHoy[] | null
  /** Opcional: sin el resumen de la semana, «Hoy» sigue funcionando. */
  semana?: SemanaHoy | null
  ahora: Date
}

export type TipoPendiente = 'solicitudes' | 'bloqueados' | 'revisar' | 'salto_fallido' | 'refuerzo_quieto' | 'sin_actividad' | 'entrega_cierra' | 'listos'

export interface Pendiente {
  clave: string
  tipo: TipoPendiente
  titulo: string
  detalle: string
  personas: Array<{ id: number; nombre: string; nota?: string }>
  acciones: Array<{ texto: string; to: string }>
}

/** Un refuerzo sin empezar a los 3 días ya merece una pregunta del docente; antes es normal. */
export const DIAS_SIN_EMPEZAR = 3
/** Una entrega que cierra dentro de 3 días y tiene estudiantes sin entregar. */
export const DIAS_PARA_CIERRE = 3

const DIA = 24 * 60 * 60 * 1000
const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`

function agruparPorLeccion<T extends { unitId: number; unitTitle: string }>(filas: T[]): Array<{ unitId: number; unitTitle: string; filas: T[] }> {
  const grupos = new Map<number, { unitId: number; unitTitle: string; filas: T[] }>()
  for (const f of filas) {
    const g = grupos.get(f.unitId) ?? { unitId: f.unitId, unitTitle: f.unitTitle, filas: [] }
    g.filas.push(f)
    grupos.set(f.unitId, g)
  }
  return [...grupos.values()]
}

/** Estudiantes que ya tienen un refuerzo sin terminar en esa lección: no se les propone otro, se espera a ver si funciona. */
function conRefuerzoEnCurso(refuerzos: RefuerzoHoy[] | null, unitId: number): Set<number> {
  const ids = new Set<number>()
  for (const r of refuerzos ?? []) {
    if (r.archivado || r.tipo !== 'refuerzo' || !r.lecciones.some((l) => l.id === unitId)) continue
    for (const e of r.estudiantes) if (e.pasosHechos < r.totalPasos) ids.add(e.studentId)
  }
  return ids
}

function atascados(d: DatosHoy, tipo: 'bloqueados' | 'salto_fallido'): Pendiente[] {
  const filas = tipo === 'bloqueados' ? d.mapa?.bloqueados ?? [] : d.mapa?.segurosQueFallan ?? []
  return agruparPorLeccion(filas).map((g) => {
    const enCurso = conRefuerzoEnCurso(d.refuerzos, g.unitId)
    const sinAyuda = g.filas.filter((f) => !enCurso.has(f.studentId))
    const personas = g.filas.map((f) => ({ id: f.studentId, nombre: f.fullName, nota: enCurso.has(f.studentId) ? 'ya tiene un refuerzo' : undefined }))
    const acciones = sinAyuda.length
      ? [{ texto: sinAyuda.length === 1 ? 'Asignar refuerzo' : `Asignar refuerzo a los ${sinAyuda.length}`, to: enlaceNuevoRefuerzo(d.classId, 'refuerzo', sinAyuda.map((f) => f.studentId), [g.unitId]) }]
      : [{ texto: 'Ver sus refuerzos', to: `/docente/refuerzos?clase=${d.classId}` }]
    return tipo === 'bloqueados'
      ? {
          clave: `bloqueados-${g.unitId}`, tipo, personas, acciones,
          titulo: `${plural(g.filas.length, 'estudiante bloqueado', 'estudiantes bloqueados')} en «${g.unitTitle}»`,
          detalle: sinAyuda.length
            ? 'Fallaron varias veces seguidas: la práctica de siempre no les está funcionando. Un refuerzo les muestra la idea de otra forma.'
            : 'Ya tienen un refuerzo en curso. Mira si lo están haciendo antes de asignar otro.',
        }
      : {
          clave: `salto-${g.unitId}`, tipo, personas, acciones,
          titulo: `${plural(g.filas.length, 'estudiante intentó', 'estudiantes intentaron')} saltar «${g.unitTitle}» con un reto y falló`,
          detalle: 'Creían saberlo y no fue así. Conviene que vean la explicación antes de seguir.',
        }
  })
}

function refuerzosQuietos(d: DatosHoy): Pendiente[] {
  const resultado: Pendiente[] = []
  for (const r of d.refuerzos ?? []) {
    if (r.archivado) continue
    const incompletos = r.estudiantes.filter((e) => e.pasosHechos < r.totalPasos)
    const vencido = r.fechaLimite !== null && new Date(r.fechaLimite).getTime() < d.ahora.getTime()
    const dias = Math.floor((d.ahora.getTime() - new Date(r.createdAt).getTime()) / DIA)
    const quietos = incompletos.filter((e) => e.pasosHechos === 0)
    const nombre = r.tipo === 'reto' ? 'el reto' : 'el refuerzo'
    const acciones = [{ texto: 'Ver cómo van', to: `/docente/refuerzos?clase=${d.classId}` }, { texto: 'Escribirles', to: '/docente/mensajes' }]
    if (vencido && incompletos.length) {
      resultado.push({
        clave: `refuerzo-vencido-${r.id}`, tipo: 'refuerzo_quieto', acciones,
        titulo: `Venció ${nombre} «${r.titulo}» y ${plural(incompletos.length, 'estudiante no lo terminó', 'estudiantes no lo terminaron')}`,
        detalle: 'Pregúntales qué pasó: puede que no lo hayan visto o que algún paso no se entienda.',
        personas: incompletos.map((e) => ({ id: e.studentId, nombre: e.nombre, nota: `${e.pasosHechos} de ${r.totalPasos} pasos` })),
      })
    } else if (!vencido && quietos.length && dias >= DIAS_SIN_EMPEZAR) {
      resultado.push({
        clave: `refuerzo-quieto-${r.id}`, tipo: 'refuerzo_quieto', acciones,
        titulo: `${plural(quietos.length, 'estudiante no ha empezado', 'estudiantes no han empezado')} ${nombre} «${r.titulo}»`,
        detalle: `Lo asignaste hace ${plural(dias, 'día', 'días')}.`,
        personas: quietos.map((e) => ({ id: e.studentId, nombre: e.nombre })),
      })
    }
  }
  return resultado
}

/** La lista de «Hoy», en el orden en que conviene atenderla. Vacía = todo al día. */
export function pendientesDeHoy(d: DatosHoy): Pendiente[] {
  const lista: Pendiente[] = []

  // 1. Quien pidió entrar no puede empezar hasta que el docente lo acepte: se resuelve con un clic.
  if (d.solicitudes) {
    lista.push({
      clave: 'solicitudes', tipo: 'solicitudes', personas: [],
      titulo: `${plural(d.solicitudes, 'solicitud', 'solicitudes')} para entrar a la clase`,
      detalle: 'Mientras no la aceptes, el estudiante no ve el curso.',
      acciones: [{ texto: 'Ver solicitudes', to: `/docente/clase/${d.classId}/ajustes` }],
    })
  }

  // 2. Atascados ahora.
  lista.push(...atascados(d, 'bloqueados'))

  // 3. Trabajo entregado que espera comentario.
  for (const e of d.entregas ?? []) {
    if (!e.conteo.por_revisar) continue
    lista.push({
      clave: `revisar-${e.id}`, tipo: 'revisar', personas: [],
      titulo: `Por revisar: «${e.titulo}»`,
      detalle: `${plural(e.conteo.por_revisar, 'estudiante espera', 'estudiantes esperan')} tu comentario.`,
      acciones: [{ texto: 'Revisar', to: `/docente/entregas/${e.id}` }],
    })
  }

  // 4. Creían saberlo y fallaron el reto de salto.
  lista.push(...atascados(d, 'salto_fallido'))

  // 5. Refuerzos y retos que nadie empezó o que vencieron sin terminar: cerrar el ciclo.
  lista.push(...refuerzosQuietos(d))

  // 6. Quien lleva una semana o más sin practicar (o nunca ha practicado): nadie se entera si no se le pregunta.
  const quietos = d.semana?.sinActividad ?? []
  if (quietos.length) {
    lista.push({
      clave: 'sin_actividad', tipo: 'sin_actividad',
      titulo: `${plural(quietos.length, 'estudiante lleva', 'estudiantes llevan')} una semana o más sin practicar`,
      detalle: 'Un mensaje corto suele bastar para saber si es falta de tiempo o si algo no se entiende.',
      personas: quietos.map((q) => ({ id: q.studentId, nombre: q.nombre, nota: q.dias === null ? 'aún no ha practicado' : `hace ${q.dias} días` })),
      acciones: [{ texto: 'Escribirles', to: '/docente/mensajes' }],
    })
  }

  // 7. Entregas que cierran pronto con estudiantes que no han entregado.
  for (const e of d.entregas ?? []) {
    if (!e.publicada || !e.cierraAt || !e.conteo.sin_entregar) continue
    const faltan = new Date(e.cierraAt).getTime() - d.ahora.getTime()
    if (faltan <= 0 || faltan > DIAS_PARA_CIERRE * DIA) continue
    lista.push({
      clave: `cierra-${e.id}`, tipo: 'entrega_cierra', personas: [],
      titulo: `«${e.titulo}» cierra pronto`,
      detalle: `${e.conteo.sin_entregar} de ${e.estudiantes} todavía no entregan.`,
      acciones: [{ texto: 'Ver la entrega', to: `/docente/entregas/${e.id}` }],
    })
  }

  // 8. Los que van bien también merecen atención: un reto.
  const listos = d.mapa?.listosParaMas ?? []
  if (listos.length) {
    lista.push({
      clave: 'listos', tipo: 'listos',
      titulo: `${plural(listos.length, 'estudiante listo', 'estudiantes listos')} para un reto`,
      detalle: 'Dominan lo que llevan y aciertan al primer intento.',
      personas: listos.map((l) => ({ id: l.studentId, nombre: l.fullName })),
      acciones: [{ texto: 'Asignar un reto', to: enlaceNuevoRefuerzo(d.classId, 'reto', listos.map((l) => l.studentId)) }],
    })
  }

  return lista
}
