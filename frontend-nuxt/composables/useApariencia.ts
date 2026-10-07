// Apariencia y lectura compartida (utils/apariencia.ts): el panel del perfil y el de la cabecera editan la misma
// preferencia, así que un cambio en uno se ve en el otro. Se guarda en este navegador; sin almacenamiento (modo
// privado) se aplica igual, sin recordarse.
import { computed } from 'vue'
import { APARIENCIA_POR_DEFECTO, aplicarApariencia, CLAVE_APARIENCIA, leerApariencia, preferenciasDelSistema, type Apariencia } from '~/utils/apariencia'

export function leerAparienciaGuardada(): string | null {
  try { return localStorage.getItem(CLAVE_APARIENCIA) } catch { return null }
}

export function useApariencia() {
  const a = useState<Apariencia>('apariencia', () => leerApariencia(leerAparienciaGuardada(), preferenciasDelSistema()))
  const cambiada = computed(() => JSON.stringify(a.value) !== JSON.stringify(APARIENCIA_POR_DEFECTO))

  function cambiar(cambios: Partial<Apariencia>) {
    a.value = { ...a.value, ...cambios }
    aplicarApariencia(a.value)
    try { localStorage.setItem(CLAVE_APARIENCIA, JSON.stringify(a.value)) } catch { /* sin almacenamiento: no se recuerda */ }
  }

  return { apariencia: a, cambiada, cambiar, restablecer: () => cambiar({ ...APARIENCIA_POR_DEFECTO }) }
}

/** Si el dispositivo cambia a oscuro o a más contraste mientras STIRE está abierto, «Como mi dispositivo» lo sigue. */
export function seguirAlSistema(aplicar: () => void): void {
  if (typeof window.matchMedia !== 'function') return
  for (const q of ['(prefers-color-scheme: dark)', '(prefers-contrast: more)']) window.matchMedia(q).addEventListener('change', aplicar)
}

