// Guía para que el docente arme una buena lección (09/10, Jeider: «indicarle qué debe tener cada lección para abarcar los
// diferentes estilos de aprendizaje»). Los estilos de aprendizaje no tienen evidencia (docs/DISENO_FORMATOS_LECCION.md):
// en vez de un estilo por estudiante, la guía pide VARIAS FORMAS de entrar a la misma idea para todos, y práctica variada.
// Como la guía de ejercicios de programar (utils/guiaEjercicioCodigo.ts): revisa en vivo, dice qué falta y por qué, y
// nunca bloquea guardar ni publicar (BT-42).

import { esPseudocodigo } from './algoritmoMultiformato'
import { PARECIDOS_RECOMENDADOS } from './ejerciciosUnidad'

export interface ExplicacionParaGuia {
  type?: string | null
  body?: string | null
  metadata?: Record<string, unknown> | null
  isVisible?: boolean
}
export interface EjercicioParaGuia { questionType: string | null; difficulty: string | null }
export interface PuntoGuiaLeccion { ok: boolean; texto: string; porque: string }

const CODIGO = /```[^\n]*\n([\s\S]*?)```/g

function bloquesDeCodigo(texto: string): string[] {
  return [...texto.matchAll(CODIGO)].map((m) => m[1])
}

/** Un recurso visual: una imagen o un video (bloque o insertado), una imagen en el texto, o un pseudocódigo (STIRE lo dibuja). */
function tieneVisual(explicaciones: ExplicacionParaGuia[]): boolean {
  return explicaciones.some((e) => {
    if (e.type === 'image' || e.type === 'video') return true
    const body = e.body ?? ''
    if (/!\[[^\]]*\]\([^)]+\)/.test(body)) return true
    if (bloquesDeCodigo(body).some(esPseudocodigo)) return true
    const insertados = e.metadata && typeof e.metadata === 'object' ? (e.metadata as { insertados?: unknown }).insertados : null
    return !!insertados && typeof insertados === 'object' && Object.keys(insertados).length > 0
  })
}

export function revisarLeccion(e: { explicaciones: ExplicacionParaGuia[]; ejercicios: EjercicioParaGuia[] }): PuntoGuiaLeccion[] {
  const visibles = e.explicaciones.filter((x) => x.isVisible !== false)
  const texto = visibles.filter((x) => !x.type || x.type === 'markdown' || x.type === 'text').map((x) => x.body ?? '').join('\n')
  const tipos = new Set(e.ejercicios.map((x) => x.questionType ?? 'otro'))
  const niveles = new Set(e.ejercicios.map((x) => x.difficulty ?? 'basico'))
  const opcionMultiple = new Map<string, number>()
  for (const x of e.ejercicios.filter((x) => x.questionType === 'mcq')) {
    const nivel = x.difficulty ?? 'basico'
    opcionMultiple.set(nivel, (opcionMultiple.get(nivel) ?? 0) + 1)
  }
  return [
    {
      ok: texto.trim().length >= 200,
      texto: 'Una explicación escrita de la idea',
      porque: 'Es la base. Con texto, el estudiante también la puede escuchar con «Escuchar la lección».',
    },
    {
      ok: /(^|\n)#+\s*(un\s+)?ejemplo|ejemplo resuelto/i.test(texto) || bloquesDeCodigo(texto).length > 0,
      texto: 'Un ejemplo resuelto, paso a paso',
      porque: 'Ver un problema resuelto antes de practicar ayuda al que empieza (ejemplos resueltos). Un título «Un ejemplo» o un bloque de código cuentan.',
    },
    {
      ok: tieneVisual(visibles),
      texto: 'Una imagen, un diagrama o un video junto a las palabras',
      porque: 'Palabras e imágenes juntas se aprenden mejor que solo palabras, para todos. Un pseudocódigo «Algoritmo … FinAlgoritmo» STIRE lo muestra también como diagrama de flujo.',
    },
    {
      ok: /error(es)? com[uú]n|cuidado|ojo con|un error frecuente/i.test(texto),
      texto: 'El error más común, explicado',
      porque: 'Anticiparlo ayuda a no cometerlo y le da al estudiante qué revisar si falla un ejercicio.',
    },
    {
      ok: tipos.size >= 2,
      texto: 'Ejercicios de al menos dos tipos',
      porque: 'Reconocer (opción múltiple), ordenar o relacionar y crear (completar o programar) piden cosas distintas: son otras formas de practicar la misma idea.',
    },
    {
      ok: niveles.size >= 2,
      texto: 'Ejercicios de más de un nivel',
      porque: 'Permite subir de nivel o tomar un reto a quien va bien, y afianzar con uno más sencillo a quien le cuesta.',
    },
    {
      ok: [...opcionMultiple.values()].every((n) => n >= PARECIDOS_RECOMENDADOS('mcq')),
      texto: `En opción múltiple, ${PARECIDOS_RECOMENDADOS('mcq')} parecidos por nivel`,
      porque: 'Tiene un solo intento: para volver a intentarlo, STIRE le da un parecido (mismo tipo y nivel) en vez de repetir la misma pregunta.',
    },
  ]
}

export const CONSEJOS_LECCION = [
  'STIRE no adivina el «estilo» de cada estudiante: no hay evidencia de que sirva. Lo que ayuda a todos es dar varias formas de entrar a la misma idea.',
  'En opción múltiple, escribe por qué es correcta: es la retroalimentación que el estudiante ve con su resultado.',
  'Todo es opcional: la guía solo dice qué falta y por qué.',
]
