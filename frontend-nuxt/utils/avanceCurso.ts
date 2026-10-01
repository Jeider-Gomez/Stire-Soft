// Avance honesto del curso (docs/DISENO_INTERVENCION_DOCENTE.md §10.2): cuántas lecciones están dominadas de todas las
// del curso, y el dominio promedio solo de las que el estudiante ya trabajó. Antes el inicio decía «Dominio 100 %» con
// 5 lecciones de 17 trabajadas, que se leía como «ya casi termino».

export interface LeccionConAvance {
  status: string
  masteryPercentage: number
  empezada?: boolean
}

export function calcularAvance(lecciones: LeccionConAvance[]) {
  const trabajadas = lecciones.filter((u) => u.empezada)
  return {
    total: lecciones.length,
    dominadas: lecciones.filter((u) => u.status === 'dominado').length,
    trabajadas: trabajadas.length,
    dominioTrabajado: trabajadas.length
      ? Math.round(trabajadas.reduce((suma, u) => suma + u.masteryPercentage, 0) / trabajadas.length)
      : 0,
  }
}
