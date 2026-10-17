/** Una entrega en la ficha del estudiante que ve el docente (GET /analytics/student/:id/entregas). */
export interface EntregaFicha {
  id: string
  activityId: number
  activityTitle: string
  score: number
  maxScore: number | null
  passed: boolean | null
  status: string
  createdAt: string
}

export interface PaginaEntregas {
  items: EntregaFicha[]
  total: number
  pagina: number
  porPagina: number
}

export function estadoEntrega(status: string): string {
  switch (status) {
    case 'graded': return 'Calificado'
    case 'in_progress': return 'En curso'
    case 'submitted': return 'Calificando'
    case 'expired': return 'Expirado'
    default: return 'Sin entregar'
  }
}

/** «Las 20 más recientes de 47», o «47 entregas» cuando ya se ven todas. */
export function textoConteo(vistas: number, total: number): string {
  if (vistas >= total) return total === 1 ? '1 entrega' : `${total} entregas`
  return `Las ${vistas} más recientes de ${total}`
}
