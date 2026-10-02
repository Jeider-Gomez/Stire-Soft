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

export interface ContextoTutor {
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
): ContextoTutor {
  // Leyendo una lección: /estudiante/unidad/<id>
  const leccion = /^\/estudiante\/unidad\/(\d+)/.exec(ruta)
  if (leccion) return { currentRoute: ruta, learningUnitId: Number(leccion[1]) }

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
    }
  }

  // Cualquier otra pantalla (inicio, progreso, repasos…): solo dónde está, sin suponer una lección ni un ejercicio.
  return { currentRoute: ruta }
}
