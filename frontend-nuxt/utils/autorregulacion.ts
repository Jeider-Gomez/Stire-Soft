// «Mi autorregulación» (META-01 de la lista de chequeo de Sistemas Tutores, Caro 2015: doble lazo, nivel objeto y
// meta-nivel). «Mi progreso» mostraba números; esto los convierte en UNA observación sobre cómo estudia y una pregunta
// para que la piense. Se elige la observación más útil según sus datos; nunca regaña.

export interface DatosAutorregulacion {
  /** Días con práctica en los últimos 7 (incluido hoy). */
  diasSemana: number
  vencidos: number
  retencion: { repasos: number; porcentaje: number | null }
  lecciones: { enPractica: number; dominadaReciente: number; dominadaFirme: number }
}

export interface Reflexion { observacion: string; pregunta: string }

export function reflexionDeLaSemana(d: DatosAutorregulacion): Reflexion {
  if (d.vencidos > 0) {
    return {
      observacion: `Tienes ${d.vencidos === 1 ? '1 repaso pendiente' : `${d.vencidos} repasos pendientes`}. Repasar justo cuando toca es lo que evita que olvides lo que ya aprendiste.`,
      pregunta: '¿En qué momento de hoy puedes dedicarles 10 minutos?',
    }
  }
  if (d.retencion.repasos >= 3 && d.retencion.porcentaje !== null && d.retencion.porcentaje < 60) {
    return {
      observacion: `En tus repasos del último mes aciertas el ${d.retencion.porcentaje} %. Puede que estés repasando sin volver a la idea.`,
      pregunta: 'Antes del próximo repaso, ¿lees primero la explicación o vas directo al ejercicio?',
    }
  }
  const dominadas = d.lecciones.dominadaReciente + d.lecciones.dominadaFirme
  if (d.lecciones.enPractica >= 3 && d.lecciones.enPractica > dominadas) {
    return {
      observacion: `Tienes ${d.lecciones.enPractica} lecciones empezadas que todavía no dominas.`,
      pregunta: '¿Te ayudaría terminar una antes de abrir otra?',
    }
  }
  if (d.diasSemana >= 4) {
    return {
      observacion: `Estudiaste ${d.diasSemana} días esta semana. La constancia ayuda más que una sesión larga de vez en cuando.`,
      pregunta: '¿Qué te funcionó esta semana que quieras repetir?',
    }
  }
  if (d.diasSemana === 0) {
    return {
      observacion: 'Esta semana todavía no has practicado.',
      pregunta: '¿Qué día y a qué hora puedes reservar 15 minutos para STIRE?',
    }
  }
  return {
    observacion: `Practicaste ${d.diasSemana === 1 ? '1 día' : `${d.diasSemana} días`} esta semana. Repartir la práctica en varios días ayuda a recordar mejor.`,
    pregunta: '¿Qué tema te costó más y por qué crees que fue?',
  }
}
