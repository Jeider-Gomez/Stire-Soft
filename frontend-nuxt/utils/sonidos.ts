// Sonidos opcionales al probar código (ítems 1 y 22 de la evaluación heurística): una nota corta que sube si todos los
// casos pasan y una que baja si alguno falla. Vienen apagados; se encienden en «Apariencia y lectura». Se generan con el
// navegador (Web Audio), sin archivos, y nunca son la única señal: el resultado siempre se ve en pantalla.
import { CLAVE_APARIENCIA, leerApariencia } from './apariencia'

/** Las notas de cada resultado, en hercios: subir es «bien», bajar es «revisa». */
export const NOTAS = { bien: [523.25, 783.99], revisa: [392, 311.13] } as const

export function sonidosEncendidos(guardado: string | null): boolean {
  return leerApariencia(guardado).sonidos
}

export function sonarResultado(todoBien: boolean): void {
  let guardado: string | null = null
  try { guardado = localStorage.getItem(CLAVE_APARIENCIA) } catch { return }
  if (!sonidosEncendidos(guardado)) return
  const Contexto = window.AudioContext
  if (!Contexto) return
  const ctx = new Contexto()
  const notas = todoBien ? NOTAS.bien : NOTAS.revisa
  notas.forEach((frecuencia, i) => {
    const osc = ctx.createOscillator()
    const volumen = ctx.createGain()
    const inicio = ctx.currentTime + i * 0.12
    osc.frequency.value = frecuencia
    volumen.gain.setValueAtTime(0.08, inicio)
    volumen.gain.exponentialRampToValueAtTime(0.001, inicio + 0.18)
    osc.connect(volumen).connect(ctx.destination)
    osc.start(inicio)
    osc.stop(inicio + 0.2)
  })
  setTimeout(() => void ctx.close(), 600)
}
