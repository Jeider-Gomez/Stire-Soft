// Qué le cuenta la pantalla al Tutor (sin proyectos, que arma stores/tutor.ts). Solo lo que el estudiante tiene ABIERTO
// ahora: antes se mandaba la «unidad recomendada» en vez de la lección abierta, y el último ejercicio visitado aunque ya
// se hubiera salido de él, así que el Tutor no sabía dónde estaba el estudiante. El texto de la lección no viaja desde
// aquí: lo busca el servidor con la unidad (no se confía en un texto que mande el navegador).

export interface EjercicioAbierto {
  activityId: number
  title: string
  learningUnitId?: number
  questionType: string
}

/** Señales para el Tutor (src/tutor/tutor-senales.ts): error probable, juicio de confianza y modo por pasos. */
export interface SenalesTutor {
  errorProbable?: string
  confianza?: string
  acerto?: boolean
  modo?: 'por-pasos' | 'otra-explicacion' | 'ejemplo-parecido'
  /** Conceptos que pide el ejercicio (utils/conceptosEjercicio.ts). */
  conceptos?: string[]
}

/** Resultado del último «Probar código» (10/10): el Tutor lo ve en vez de felicitar una línea suelta. */
export interface UltimaPrueba { entrada: string; esperada: string; obtenida: string }

export interface ContextoTutor {
  senales?: SenalesTutor
  ultimaPrueba?: UltimaPrueba
  currentRoute: string
  learningUnitId?: number
  activityId?: number
  activityTitle?: string
  currentCode?: string
  codeLanguage?: string
}

export function contextoSegunPantalla(
  ruta: string,
  ejercicio: EjercicioAbierto | null,
  codigo: { js: string; html: string; css: string },
  senales?: SenalesTutor,
  ultimaPrueba?: UltimaPrueba | null,
): ContextoTutor {
  // Leyendo una lección: /estudiante/unidad/<id>
  const leccion = /^\/estudiante\/unidad\/(\d+)/.exec(ruta)
  if (leccion) return { currentRoute: ruta, learningUnitId: Number(leccion[1]), ...(senales?.modo === 'otra-explicacion' ? { senales: { modo: senales.modo } } : {}) }

  // Resolviendo un ejercicio: /estudiante/evaluacion/<id> (solo si el ejercicio cargado es ese)
  const evaluacion = /^\/estudiante\/evaluacion\/(\d+)/.exec(ruta)
  if (evaluacion && ejercicio && ejercicio.activityId === Number(evaluacion[1])) {
    return {
      currentRoute: ruta,
      learningUnitId: ejercicio.learningUnitId,
      activityId: ejercicio.activityId,
      activityTitle: ejercicio.title,
      // En un ejercicio de HTML y CSS el código está en html/css (`js` es el búfer del ejercicio de JavaScript).
      ...(ejercicio.questionType === 'html_css'
        ? { currentCode: ['<!-- index.html -->', codigo.html, '', '/* estilos.css */', codigo.css].join('\n'), codeLanguage: 'html' }
        : { currentCode: codigo.js }),
      // Solo las señales que existen: un objeto vacío no se manda.
      ...(senales && Object.values(senales).some((v) => v !== undefined) ? { senales } : {}),
      ...(ultimaPrueba ? { ultimaPrueba } : {}),
    }
  }

  // Cualquier otra pantalla (inicio, progreso, repasos…): solo dónde está, sin suponer una lección ni un ejercicio.
  return { currentRoute: ruta }
}

/** El caso que más le sirve al Tutor: el primero que no coincide; si todos coinciden, ninguno. Sin probar, nada. */
export function ultimaPruebaDe(casos: ReadonlyArray<{ input: string; expectedOutput: string; actualOutput?: string; passed?: boolean }>): UltimaPrueba | null {
  const c = casos.find((x) => x.passed === false)
  return c ? { entrada: c.input, esperada: c.expectedOutput, obtenida: c.actualOutput ?? '' } : null
}
