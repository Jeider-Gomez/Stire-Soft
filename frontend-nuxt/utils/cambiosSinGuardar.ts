// Aviso al salir sin guardar (ítem 13 de la evaluación heurística, docs/calidad/EVALUACION_HEURISTICA_PLAN_A_5.md): se
// compara lo que hay en el editor con lo que había al abrirlo o al último guardado. La pregunta la hace
// composables/useSalirSinGuardar.ts con el diálogo propio de STIRE.

/** Vigila un formulario: `sucio()` dice si cambió desde la última foto; `guardado()` toma una foto nueva. */
export function vigilarCambios(datos: () => unknown): { sucio: () => boolean; guardado: () => void } {
  const foto = () => JSON.stringify(datos())
  let base = foto()
  return { sucio: () => foto() !== base, guardado: () => { base = foto() } }
}

export const PREGUNTA_SALIR = {
  titulo: '¿Salir sin guardar?',
  mensaje: 'Hiciste cambios que todavía no guardaste. Si sales ahora, se pierden.',
  accion: 'Salir sin guardar',
  cancelar: 'Seguir editando',
  peligro: true,
} as const
