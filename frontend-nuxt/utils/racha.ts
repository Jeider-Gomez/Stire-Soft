// La racha y la semana (BT-21): lo que se ve sin abrir «Ver más estadísticas». El servidor ya cuenta los días en hora de
// Colombia (src/learning-progress/estadisticas.ts); aquí solo se arma lo que se muestra.

const LETRA_DIA = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

export interface DiaSemana { dia: string; letra: string; practico: boolean; esHoy: boolean }

/** Los últimos 7 días del calendario (el último es hoy), con la inicial del día. */
export function ultimaSemana(calendario: Array<{ dia: string; ejercicios: number }>): DiaSemana[] {
  const ultimos = calendario.slice(-7)
  return ultimos.map((c, i) => ({
    dia: c.dia,
    letra: LETRA_DIA[new Date(`${c.dia}T12:00:00Z`).getUTCDay()],
    practico: c.ejercicios > 0,
    esHoy: i === ultimos.length - 1,
  }))
}

/**
 * Una frase corta y amable debajo de la racha. Si hoy no ha practicado y tiene racha, se avisa (sin culpa) que se
 * pierde mañana; nunca se regaña por un 0.
 */
export function avisoDeRacha(racha: number, practicoHoy: boolean, docente = false): { texto: string; urgente: boolean } {
  if (docente) {
    if (racha === 0) return { texto: 'Sin práctica ayer ni hoy.', urgente: false }
    return { texto: practicoHoy ? 'Practicó hoy.' : 'Aún no practica hoy.', urgente: false }
  }
  if (racha === 0) return { texto: 'Haz un ejercicio hoy y empiezas una racha.', urgente: false }
  if (practicoHoy) return { texto: 'Hoy ya sumaste. ¡Vuelve mañana!', urgente: false }
  return { texto: 'Haz un ejercicio hoy para no perderla.', urgente: true }
}
