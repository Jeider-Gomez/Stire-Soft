// Avisar al docente que un recurso de la lección no funciona (src/valoraciones/recurso-falla.service.ts).
export function useRecursoFalla() {
  const api = useApi()
  return {
    reportar: (unitId: number, titulo: string, motivo: 'no-se-puede-ver' | 'no-carga') =>
      api.post<{ avisado: boolean }>(`/valoraciones/leccion/${unitId}/recurso-falla`, { titulo, motivo }),
  }
}
