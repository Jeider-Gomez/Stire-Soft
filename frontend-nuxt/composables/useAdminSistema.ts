import type { SystemLogs, SystemStatus } from '~/types'

export function useAdminSistema() {
  const api = useApi()
  return {
    estado: () => api.get<SystemStatus>('/admin/system/status'),
    logs: (level: 'todos' | 'error' | 'warn' | 'info') => api.get<SystemLogs>(`/admin/system/logs?level=${level}&limit=100`),
    limpiar: () => api.post<{ message?: string; success?: boolean }>('/maintenance/cleanup'),
  }
}
