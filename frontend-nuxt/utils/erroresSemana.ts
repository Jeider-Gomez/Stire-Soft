// «Errores que más se repiten esta semana» en «Hoy» del docente (MOD-02, propuesta de Pedro del 19/10; el cálculo está en
// src/analytics/errores-de-la-clase.ts). Los de concepto se explican en clase; los de escritura se corrigen practicando.
import { enlaceNuevoRefuerzo } from './refuerzos'

export interface ErrorDeLaClase {
  tipo: string
  nombre: string
  detalle: string
  entregas: number
  estudiantes: Array<{ studentId: number; nombre: string; veces: number }>
  lecciones: number[]
}
/** GET /analytics/class/:id/errores-semana */
export interface ErroresSemana { concepto: ErrorDeLaClase[]; escritura: ErrorDeLaClase[] }

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`

/** «3 estudiantes · 5 ejercicios» */
export function cuantosConElError(e: ErrorDeLaClase): string {
  return `${plural(e.estudiantes.length, 'estudiante', 'estudiantes')} · ${plural(e.entregas, 'ejercicio', 'ejercicios')}`
}

/** Un refuerzo ya armado con quienes tienen el error y las lecciones donde apareció; el docente lo revisa antes de crearlo. */
export function enlaceRefuerzoDeError(classId: number, e: ErrorDeLaClase): string {
  return enlaceNuevoRefuerzo(classId, 'refuerzo', e.estudiantes.map((x) => x.studentId), e.lecciones)
}
