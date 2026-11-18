// Sonidos al probar código (ítems 1 y 22 de la evaluación heurística): una nota corta que sube si todos los casos pasan
// y una que baja si alguno falla; al entregar, tres resultados; al ubicar una pieza en un ejercicio, un «tic» suave.
// Encendidos por defecto desde el 17/11 (antes venían apagados y casi nadie los oía); se apagan con el botón de sonido
// de arriba o en «Apariencia y lectura». Se generan con el navegador (Web Audio), sin archivos, y nunca son la única
// señal: el resultado siempre se ve en pantalla.
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

/** Al unir una pareja, ubicar una pieza o soltar un paso: un «tic» corto y suave. */
export const NOTA_TOQUE = [880] as const
export function sonarToque(): void {
  tocar(NOTA_TOQUE, false, 0.06)
}

/** Una vez encendido, se oye una muestra para saber cómo suena. */
export function probarSonido(): void {
  tocar(NOTAS_ENTREGA.acierto, true)
}

/**
 * Un solo contexto de audio para toda la página. En el celular (Safari, Chrome) un audio que no nace de un toque queda en
 * silencio, y la entrega suena después de esperar al servidor: por eso el contexto se crea y se «despierta» con el primer
 * toque o tecla (prepararSonidos, plugins/sonidos.client.ts) y después se reutiliza.
 */
let contexto: AudioContext | null = null
function contextoDeAudio(): AudioContext | null {
  const Contexto = typeof window === 'undefined' ? undefined : window.AudioContext
  if (!Contexto) return null
  contexto ??= new Contexto()
  if (contexto.state === 'suspended') void contexto.resume().catch(() => undefined)
  return contexto
}

/** Despierta el audio con el primer gesto de la persona (los navegadores no dejan sonar antes). */
export function prepararSonidos(): void {
  const despertar = () => {
    contextoDeAudio()
    for (const ev of ['pointerdown', 'keydown', 'touchend'] as const) window.removeEventListener(ev, despertar, true)
  }
  for (const ev of ['pointerdown', 'keydown', 'touchend'] as const) window.addEventListener(ev, despertar, { capture: true, passive: true })
}

function tocar(notas: ReadonlyArray<number>, siempre = false, volumenMax = 0.14): void {
  let guardado: string | null = null
  try { guardado = localStorage.getItem(CLAVE_APARIENCIA) } catch { return }
  if (!siempre && !sonidosEncendidos(guardado)) return
  const ctx = contextoDeAudio()
  if (!ctx) return
  notas.forEach((frecuencia, i) => {
    const osc = ctx.createOscillator()
    const volumen = ctx.createGain()
    const inicio = ctx.currentTime + 0.01 + i * 0.12
    // Triángulo: más cálido que la onda pura y se oye mejor en el parlante de un celular.
    osc.type = 'triangle'
    osc.frequency.value = frecuencia
    volumen.gain.setValueAtTime(0.0001, inicio)
    volumen.gain.exponentialRampToValueAtTime(volumenMax, inicio + 0.015)
    volumen.gain.exponentialRampToValueAtTime(0.001, inicio + 0.22)
    osc.connect(volumen).connect(ctx.destination)
    osc.start(inicio)
    osc.stop(inicio + 0.24)
  })
}
