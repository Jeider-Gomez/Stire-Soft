// Qué se le dice al estudiante al calificar un ejercicio y a dónde puede ir después (07/10, prueba de Jeider como
// estudiante). Antes, la ventana siempre ofrecía «Seguir practicando» (cerraba y dejaba el MISMO ejercicio, aunque ya lo
// hubiera resuelto o no le quedaran intentos) y «Volver al inicio». Ahora el siguiente paso sale del mismo recomendador
// del servidor (hermano del mismo nivel, nivel siguiente o repaso), como «Continuar» en Khan Academy o Duolingo.

import type { NombreCalidad } from '~/utils/escalaResultados'

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

export interface PasoSiguiente {
  titulo: string
  mensaje: string
  primaria: AccionResultado
  secundaria: AccionResultado
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
}

function irA(rec: RecomendacionSiguiente | null, actual: number): AccionResultado | null {
  if (!rec || rec.activityId === actual || !TEXTO_IR[rec.reason]) return null
  return { tipo: 'ejercicio', texto: TEXTO_IR[rec.reason], activityId: rec.activityId, reto: rec.reason === 'reto' }
}

const LECCION: AccionResultado = { tipo: 'leccion', texto: 'Volver a la lección' }

export function pasoSiguiente(e: {
  aprobado: boolean
  quedanIntentos: number
  actividadActual: number
  recomendacion: RecomendacionSiguiente | null
}): PasoSiguiente {
  const ir = irA(e.recomendacion, e.actividadActual)

  if (e.aprobado) {
    if (ir) {
      return { titulo: '¡Lo lograste!', mensaje: `Sigue: «${e.recomendacion!.title}». ${e.recomendacion!.reasonMessage}`, primaria: ir, secundaria: LECCION }
    }
    if (e.recomendacion?.allCompleted || e.recomendacion?.reason === 'completada') {
      return {
        titulo: '¡Completaste la lección!',
        mensaje: 'Ya resolviste lo que pide esta lección. En el inicio está tu siguiente paso.',
        primaria: { tipo: 'inicio', texto: 'Ir a mi siguiente paso' },
        secundaria: LECCION,
      }
    }
    return { titulo: '¡Lo lograste!', mensaje: 'En la lección eliges con qué seguir.', primaria: LECCION, secundaria: { tipo: 'inicio', texto: 'Ir al inicio' } }
  }

  if (e.quedanIntentos > 0) {
    return {
      titulo: 'Todavía no, pero vas en camino',
      mensaje: `Mira qué falló, corrígelo y vuelve a entregar. ${e.quedanIntentos === 1 ? 'Te queda 1 intento' : `Te quedan ${e.quedanIntentos} intentos`}.`,
      primaria: { tipo: 'reintentar', texto: 'Intentar de nuevo' },
      secundaria: LECCION,
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
