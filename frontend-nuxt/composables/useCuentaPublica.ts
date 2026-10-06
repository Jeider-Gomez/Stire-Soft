export function useCuentaPublica() {
  const api = useApi()
  return {
    asociarClaveTutor: (apiKey: string) => api.put('/tutor/api-key', { apiKey }),
    solicitarRestablecimiento: (email: string) => api.post<{ message: string }>('/auth/forgot-password', { email }),
    restablecerContrasena: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
  }
}
