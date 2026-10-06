/**
 * Sistema de avisos compartido para toda la app del docente (Fase 30 B1).
 * D4: un solo lugar, tipo `exito | error | info`, con opcional «Deshacer».
 * Los de error no se cierran solos; los demás se van a los 6 s.
 * Como máximo 3 avisos visibles a la vez (FIFO: el más antiguo cae).
 */
import { ref } from 'vue'

export type TipoAviso = 'exito' | 'error' | 'info'

export interface Aviso {
  id: number
  tipo: TipoAviso
  texto: string
  deshacer?: () => void
  _timer?: ReturnType<typeof setTimeout>
}

let _secuencia = 0
const _avisos = ref<Aviso[]>([])

export function useAvisos() {
  const MAX = 3

  function avisar(opts: { tipo: TipoAviso; texto: string; deshacer?: () => void }): number {
    const id = ++_secuencia
    const aviso: Aviso = { id, tipo: opts.tipo, texto: opts.texto, deshacer: opts.deshacer }

    // Si ya hay 3, quita el más antiguo antes de agregar
    if (_avisos.value.length >= MAX) {
      const primero = _avisos.value[0]
      if (primero?._timer) clearTimeout(primero._timer)
      _avisos.value.shift()
    }

    _avisos.value.push(aviso)

    // Los de error no se cierran solos
    if (opts.tipo !== 'error') {
      aviso._timer = setTimeout(() => cerrar(id), 6000)
    }

    return id
  }

  function cerrar(id: number) {
    const idx = _avisos.value.findIndex((a) => a.id === id)
    if (idx === -1) return
    const aviso = _avisos.value[idx]
    if (aviso?._timer) clearTimeout(aviso._timer)
    _avisos.value.splice(idx, 1)
  }

  return { avisos: _avisos, avisar, cerrar }
}
