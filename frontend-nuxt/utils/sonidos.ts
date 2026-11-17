// Sonidos opcionales al probar código (ítems 1 y 22 de la evaluación heurística): una nota corta que sube si todos los
// casos pasan y una que baja si alguno falla. Vienen apagados; se encienden en «Apariencia y lectura». Se generan con el
// navegador (Web Audio), sin archivos, y nunca son la única señal: el resultado siempre se ve en pantalla.
import { CLAVE_APARIENCIA, leerApariencia } from './apariencia'

/** Las notas de cada resultado, en hercios: subir es «bien», bajar es «revisa». */
export const NOTAS = { bien: [523.25, 783.99], revisa: [392, 311.13] } as const
/**
 * Al entregar (diseño «Apariencia», ítem 1 de Jeider): tres resultados, tres sonidos. Acierto sube en tres notas; cerca
 * (más de la mitad de los puntos) sube y se queda; aún no baja suave. Nunca suena a error: es «sigue», no «mal».
 */
export const NOTAS_ENTREGA = { acierto: [523.25, 659.25, 783.99], cerca: [440, 523.25], 'aun-no': [392, 349.23] } as const
export type ResultadoEntrega = keyof typeof NOTAS_ENTREGA
export function resultadoDeEntrega(puntos: number, maximo: number): ResultadoEntrega {
  if (maximo > 0 && puntos >= maximo) return 'acierto'
  return maximo > 0 && puntos / maximo >= 0.5 ? 'cerca' : 'aun-no'
}

export function sonidosEncendidos(guardado: string | null): boolean {
  return leerApariencia(guardado).sonidos
}

export function sonarResultado(todoBien: boolean): void {
  tocar(todoBien ? NOTAS.bien : NOTAS.revisa)
}

export function sonarEntrega(resultado: ResultadoEntrega): void {
  tocar(NOTAS_ENTREGA[resultado])
}

/** Una vez encendido, se oye una muestra para saber cómo suena. */
export function probarSonido(): void {
  tocar(NOTAS_ENTREGA.acierto, true)
}

function tocar(notas: ReadonlyArray<number>, siempre = false): void {
  let guardado: string | null = null
  try { guardado = localStorage.getItem(CLAVE_APARIENCIA) } catch { return }
  if (!siempre && !sonidosEncendidos(guardado)) return
  const Contexto = window.AudioContext
  if (!Contexto) return
  const ctx = new Contexto()
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
