// Datos para la investigación (GET /usabilidad/investigacion/exportar): CSV sin nombres de quienes aceptaron participar.
export function useInvestigacion() {
  const api = useApi()
  return {
    exportarCsv: () => api.apiFetch<Blob>('/usabilidad/investigacion/exportar', { responseType: 'blob' }),
  }
}
