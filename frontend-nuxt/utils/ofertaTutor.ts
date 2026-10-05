// Ofrecer el Tutor justo cuando el estudiante falla (02/10). En Khan Academy casi nadie abría a Khanmigo desde un ícono en
// la esquina; por eso lo están llevando al momento del error. Aquí se ofrece, no se impone: el estudiante decide si lo
// abre y puede cerrar la oferta.

/** Tras «Probar código»: se ofrece si terminó de correr y algún caso público falló. */
export function debeOfrecerTutor(casos: ReadonlyArray<{ passed?: boolean }>, corriendo: boolean, cerrada: boolean): boolean {
  return !corriendo && !cerrada && casos.some((c) => c.passed === false)
}

/** La pista rápida que se pide: en código, por qué no sale lo esperado; en lo demás, la idea que hay detrás. */
export function pistaSegunTipo(tipo: string | undefined): 'parada' | 'conceptual' {
  return tipo === 'coding' || tipo === 'html_css' ? 'parada' : 'conceptual'
}

// ── UI-05 · Replanificar sin abrumar (docs/DISENO_REPLANIFICAR.md) ──
// La ayuda escala con los fallos seguidos y cambia de táctica, en lugar de repetir lo mismo (Caro, 2015). Siempre UNA
// acción principal y las demás plegadas en «Otras formas de destrabarte»: muchas opciones a la vez abruman justo cuando
// el estudiante está frustrado. Nada se impone (forzar los pasos frustra: Razzaq y Heffernan, 2006).
// 1 fallo: una pista. 2: por pasos (subpreguntas, lo más efectivo en ASSISTments). 3 o más: cambiar de táctica — un
// ejemplo resuelto PARECIDO (efecto del ejemplo resuelto: Atkinson, Derry, Renkl y Wortham, 2000) o volver a la idea.

export type Ayuda = 'pista' | 'por-pasos' | 'ejemplo' | 'explicacion'

export const TEXTO_AYUDA: Record<Ayuda, string> = {
  pista: 'Pedir una pista al Tutor',
  'por-pasos': 'Resolverlo por pasos con el Tutor',
  ejemplo: 'Ver resuelto un ejemplo parecido',
  explicacion: 'Volver a la explicación de la lección',
}

export function ayudaSegunFallos(fallos: number): { mensaje: string; principal: Ayuda; otras: Ayuda[] } {
  if (fallos >= 3) {
    return {
      mensaje: 'Llevas varios intentos con este ejercicio. Probemos de otra forma: ver resuelto un problema parecido suele destrabar.',
      principal: 'ejemplo',
      otras: ['por-pasos', 'explicacion', 'pista'],
    }
  }
  if (fallos === 2) {
    return {
      mensaje: '¿Lo dividimos en partes? El Tutor te plantea una pregunta pequeña a la vez, sin darte la respuesta.',
      principal: 'por-pasos',
      otras: ['pista', 'explicacion'],
    }
  }
  return {
    mensaje: '¿No te sale lo esperado? El Tutor puede darte una pista mirando tu código, sin darte la respuesta.',
    principal: 'pista',
    otras: ['por-pasos'],
  }
}
