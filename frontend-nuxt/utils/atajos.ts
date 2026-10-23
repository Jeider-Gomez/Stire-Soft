// Atajos de teclado de STIRE (ítem 21 de la evaluación heurística). Se listan en el menú de ayuda («Atajos de teclado»)
// y cada uno está implementado donde dice; la prueba atajos-y-control.frontend.spec.ts lo comprueba.

export interface AtajoTeclado {
  teclas: string[]
  accion: string
  donde: string
}

export const ATAJOS: AtajoTeclado[] = [
  { teclas: ['Ctrl', 'Enter'], accion: 'Probar tu código', donde: 'En un ejercicio de programar (en Mac, Cmd + Enter)' },
  { teclas: ['Enter'], accion: 'Enviar tu pregunta al Tutor', donde: 'En el chat del Tutor' },
  { teclas: ['Esc'], accion: 'Cerrar el Tutor, un menú o una ventana', donde: 'En cualquier pantalla' },
  { teclas: ['Tab'], accion: 'Pasar al siguiente botón o campo (Shift + Tab: al anterior)', donde: 'En cualquier pantalla' },
]

/** Ctrl+Enter o Cmd+Enter, sin Shift ni Alt. */
export function esAtajoProbar(e: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'shiftKey' | 'altKey'>): boolean {
  return e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey
}
