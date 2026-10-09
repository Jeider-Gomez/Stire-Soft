// Qué se le dice al estudiante al calificar un ejercicio y a dónde puede ir después (07/10, prueba de Jeider como
// estudiante). Antes, la ventana siempre ofrecía «Seguir practicando» (cerraba y dejaba el MISMO ejercicio, aunque ya lo
// hubiera resuelto o no le quedaran intentos) y «Volver al inicio». Ahora el siguiente paso sale del mismo recomendador
// del servidor (hermano del mismo nivel, nivel siguiente o repaso), como «Continuar» en Khan Academy o Duolingo.

import type { NombreCalidad } from '~/utils/escalaResultados'
import type { SiguienteLeccion } from '~/utils/siguienteLeccion'

export interface RecomendacionSiguiente {
  activityId: number
  title: string
  reason: string
  reasonMessage: string
  allCompleted: boolean
}

export type AccionResultado =
  | { tipo: 'ejercicio'; texto: string; activityId: number; reto: boolean }
  | { tipo: 'reintentar'; texto: string }
  | { tipo: 'leccion'; texto: string }
  | { tipo: 'inicio'; texto: string }
  | { tipo: 'siguiente-leccion'; texto: string; unitId: number }

export interface PasoSiguiente {
  titulo: string
  mensaje: string
  primaria: AccionResultado
  secundaria: AccionResultado
  /**
   * 09/10 (Jeider): pasar a la siguiente lección siempre es una opción, aunque queden ejercicios. null si ya es la
   * primaria, si no hay siguiente o si su módulo está cerrado (entonces `nota` dice qué falta).
   */
  siguienteLeccion: AccionResultado | null
  nota: string | null
}

/** Motivos del recomendador que llevan a OTRO ejercicio de la lección (no al mismo). */
const TEXTO_IR: Record<string, string> = {
  hermana: 'Probar otro ejercicio parecido',
  siguiente: 'Ir al siguiente ejercicio',
  sube_nivel: 'Subir de nivel',
  reto: 'Tomar el reto',
  baja_nivel: 'Afianzar con otro ejercicio',
  repaso: 'Hacer el repaso',
  practica_extra: 'Practicar con otro ejercicio',
  // 08/10: el recomendador también puede devolver uno que ya intentó sin aprobar; antes no se ofrecía y quedaba «Volver a la lección».
  reintento: 'Volver al que te faltó',
}

function irA(rec: RecomendacionSiguiente | null, actual: number): AccionResultado | null {
  if (!rec || rec.activityId === actual || !TEXTO_IR[rec.reason]) return null
  return { tipo: 'ejercicio', texto: TEXTO_IR[rec.reason], activityId: rec.activityId, reto: rec.reason === 'reto' }
}

const LECCION: AccionResultado = { tipo: 'leccion', texto: 'Volver a la lección' }

/** La acción «pasar a la siguiente lección», o null si no hay o su módulo está cerrado. */
export function irASiguienteLeccion(sig: SiguienteLeccion | null | undefined): AccionResultado | null {
  return sig?.abierta ? { tipo: 'siguiente-leccion', texto: `Pasar a la siguiente lección: «${sig.titulo}»`, unitId: sig.id } : null
}

/** Si la siguiente lección está en un módulo cerrado, qué falta para abrirlo. */
export function notaModuloCerrado(sig: SiguienteLeccion | null | undefined): string | null {
  if (!sig || sig.abierta || !sig.requiere) return null
  const r = sig.requiere
  return `La siguiente lección, «${sig.titulo}», se abre con ${r.umbral} % de dominio en «${r.titulo.split(':')[0]}». Vas en ${r.dominio} %: te faltan ${Math.max(0, r.umbral - r.dominio)} puntos.`
}

export function pasoSiguiente(e: {
  aprobado: boolean
  quedanIntentos: number
  actividadActual: number
  recomendacion: RecomendacionSiguiente | null
  siguienteLeccion?: SiguienteLeccion | null
}): PasoSiguiente {
  const ir = irA(e.recomendacion, e.actividadActual)
  const siguiente = irASiguienteLeccion(e.siguienteLeccion)
  const nota = notaModuloCerrado(e.siguienteLeccion)
  const completa = !!e.recomendacion && (e.recomendacion.allCompleted || e.recomendacion.reason === 'completada')

  if (e.aprobado) {
    // Lección completa: lo recomendado es avanzar; practicar más (hasta el 100 %) o repasar queda como opción.
    if (completa) {
      return {
        titulo: '¡Completaste la lección!',
        mensaje: siguiente
          ? 'Ya resolviste un ejercicio de cada tipo. Lo recomendado es seguir con la siguiente lección; si quieres, practica más para llegar al 100 %.'
          : 'Ya resolviste lo que pide esta lección. En el inicio está tu siguiente paso.',
        primaria: siguiente ?? { tipo: 'inicio', texto: 'Ir a mi siguiente paso' },
        secundaria: ir ?? LECCION,
        siguienteLeccion: null,
        nota,
      }
    }
    if (ir) {
      return { titulo: '¡Lo lograste!', mensaje: `Sigue: «${e.recomendacion!.title}». ${e.recomendacion!.reasonMessage}`, primaria: ir, secundaria: LECCION, siguienteLeccion: siguiente, nota }
    }
    return { titulo: '¡Lo lograste!', mensaje: 'En la lección eliges con qué seguir.', primaria: LECCION, secundaria: { tipo: 'inicio', texto: 'Ir al inicio' }, siguienteLeccion: siguiente, nota }
  }

  if (e.quedanIntentos > 0) {
    const quedan = e.quedanIntentos === 1 ? 'Te queda 1 intento' : `Te quedan ${e.quedanIntentos} intentos`
    // 09/10 (Jeider): mejor un ejercicio distinto que repetir el mismo; repetir queda como segunda opción.
    return {
      titulo: 'Todavía no, pero vas en camino',
      mensaje: ir
        ? `Revisa qué falló y practica la misma idea con otro ejercicio, «${e.recomendacion!.title}». Si prefieres, corrige este: ${quedan.toLowerCase()}.`
        : `Mira qué falló, corrígelo y vuelve a entregar. ${quedan}.`,
      primaria: ir ?? { tipo: 'reintentar', texto: 'Intentar de nuevo' },
      secundaria: ir ? { tipo: 'reintentar', texto: 'Corregir este' } : LECCION,
      siguienteLeccion: siguiente,
      nota,
    }
  }

  // Sin intentos: este ejercicio ya no se puede entregar; no se ofrece «seguir» en una pantalla que no deja hacer nada.
  return {
    titulo: 'Se acabaron los intentos de este ejercicio',
    mensaje: ir
      ? `No pasa nada: equivocarse es parte de practicar. Practica la misma idea con «${e.recomendacion!.title}».`
      : 'No pasa nada: equivocarse es parte de practicar. Repasa la explicación o pídele una pista al Tutor antes de seguir.',
    primaria: ir ?? LECCION,
    secundaria: ir ? LECCION : { tipo: 'inicio', texto: 'Ir al inicio' },
    siguienteLeccion: siguiente,
    nota,
  }
}

/**
 * Al volver a abrir un ejercicio sin intentos, la página ya no deja entregar: en vez de una pantalla que no sirve para
 * nada (07/10, Jeider), ofrece otro ejercicio de la lección o volver a ella.
 */
export function accionesSinIntentos(rec: RecomendacionSiguiente | null, actual: number): [AccionResultado, AccionResultado] {
  const ir = irA(rec, actual)
  return ir ? [ir, LECCION] : [LECCION, { tipo: 'inicio', texto: 'Ir al inicio' }]
}

/** El cambio de dominio dicho como es: sube, baja o se mantiene (antes, una bajada se mostraba como «se mantiene»). */
export function textoCambioDominio(antes: number | null, despues: number | null): { texto: string; diferencia: number } | null {
  if (antes === null || despues === null) return null
  const diferencia = Math.round(despues - antes)
  if (diferencia > 0) return { texto: `Tu dominio de esta lección subió de ${antes} % a ${despues} %`, diferencia }
  if (diferencia < 0) return { texto: `Tu dominio de esta lección bajó de ${antes} % a ${despues} %`, diferencia }
  return { texto: `Tu dominio de esta lección sigue en ${despues} %`, diferencia }
}

/** Lo mismo, corto, para la tabla de «Tus últimos ejercicios»: «+20 %», «−3 %» o «igual». */
export function cambioCorto(antes: number | null | undefined, despues: number | null | undefined): { corto: string; diferencia: number } | null {
  if (antes === null || antes === undefined || despues === null || despues === undefined) return null
  const diferencia = Math.round(despues - antes)
  return { corto: diferencia > 0 ? `+${diferencia} %` : diferencia < 0 ? `−${-diferencia} %` : 'igual', diferencia }
}

/** Cuándo vuelve la lección a sus repasos, en palabras (antes: «Para tus repasos: Otra vez», que no se entendía). */
export const CUANDO_VUELVE: Record<NombreCalidad, string> = {
  'otra-vez': 'Esta lección vuelve pronto a tus repasos, para afianzarla.',
  dificil: 'Esta lección vuelve en pocos días a tus repasos, porque te costó un poco.',
  bien: 'Esta lección vuelve a tus repasos en unos días, para que no se te olvide.',
  facil: 'Esta lección tarda más en volver a tus repasos: ya la tienes clara.',
}

export type MotivoAviso = 'sin-intentos' | 'completado' | 'parecido'

/**
 * El aviso al abrir un ejercicio según cómo va en la lista de la lección (09/10, Jeider: «al entrar a un ejercicio ya
 * hecho no me avisa que no subirá el dominio»). Antes solo se avisaba en el mismo ejercicio aprobado; un «parecido» de
 * uno ya resuelto (mismo tipo y nivel: cuenta el mejor) tampoco sube el dominio y no decía nada.
 */
export function avisoPorEstado(estado: string | undefined): MotivoAviso | null {
  if (estado === 'hecho') return 'completado'
  if (estado === 'cuenta-otro') return 'parecido'
  if (estado === 'sin-intentos') return 'sin-intentos'
  return null
}

/** Lo que el docente escribió para cada pregunta de opción múltiple, como lo lee el estudiante (JEIDER-S08-11; BT-41). */
export interface RetroalimentacionPregunta { preguntaId: number; correcta: boolean; explicacion: string | null; repasar: string | null }
export interface RetroParaMostrar { tipo: 'porque' | 'repasar'; texto: string }

const REPASAR_POR_DEFECTO = 'Vuelve a la explicación de la lección y prueba con un ejercicio parecido: no te damos la respuesta para que la descubras.'

/**
 * Al acertar, por qué es correcta (si el docente lo escribió); al fallar, qué repasar, nunca la respuesta. Sin texto del
 * docente, al fallar se sugiere volver a la explicación (una sola vez, aunque fallen varias preguntas).
 */
export function retroParaMostrar(retro: ReadonlyArray<RetroalimentacionPregunta> | undefined): RetroParaMostrar[] {
  const out: RetroParaMostrar[] = []
  for (const r of retro ?? []) {
    if (r.correcta && r.explicacion) out.push({ tipo: 'porque', texto: r.explicacion })
    if (!r.correcta) out.push({ tipo: 'repasar', texto: r.repasar ?? REPASAR_POR_DEFECTO })
  }
  return out.filter((x, i) => out.findIndex((y) => y.tipo === x.tipo && y.texto === x.texto) === i)
}
