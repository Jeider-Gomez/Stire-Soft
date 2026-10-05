import { Difficulty } from '../../common/enums/difficulty.enum';
import { QuestionType } from '../../common/enums/question-type.enum';
import { claveCasilla, rangoNivel, rangoTipo } from '../../common/utils/casilla';

/**
 * Recomendador de la siguiente actividad de una unidad (docs/DISENO_PRACTICA_ADAPTATIVA.md §3.3). Función pura: recibe
 * las actividades publicadas, los intentos del estudiante, su respuesta a «¿Cómo te sientes con este tema?» y si la
 * unidad tiene un repaso vencido, y devuelve una actividad con el motivo en una línea. Las reglas son deliberadamente
 * simples y explicables; cada una tiene su caso en `recomendar-siguiente.spec.ts`.
 */

/** Respuesta a «¿Cómo te sientes con este tema?»: 1 = Es nuevo para mí, 2 = Tengo dudas, 3 = Me siento seguro. */
export type Confianza = 1 | 2 | 3;
export const CONFIANZA_SEGURO: Confianza = 3;

export interface ActividadParaRecomendar {
  id: number;
  title: string;
  order: number;
  difficulty: Difficulty;
  questionType: QuestionType | null;
  totalPoints: number;
  passingScore: number;
  /** 0 = intentos ilimitados. */
  attemptsAllowed: number;
}

export interface IntentoParaRecomendar {
  activityId: number;
  score: number;
  /** false mientras el intento está en curso: gasta un intento, pero todavía no tiene resultado. */
  calificado: boolean;
  fecha: Date;
}

export type MotivoRecomendacion =
  | 'repaso'
  | 'reto'
  | 'sube_nivel'
  | 'baja_nivel'
  | 'hermana'
  | 'reintento'
  | 'siguiente'
  | 'practica_extra'
  | 'completada'
  | 'sin_intentos'
  | 'pausa';

export interface Recomendacion {
  actividad: ActividadParaRecomendar;
  motivo: MotivoRecomendacion;
  mensaje: string;
  nivel: Difficulty;
  /** Todas las casillas exigidas están aprobadas (las saltadas con un reto no se exigen). */
  completada: boolean;
}

export interface EntradaRecomendador {
  actividades: ActividadParaRecomendar[];
  intentos: IntentoParaRecomendar[];
  confianza: Confianza | null;
  repasoVencido: boolean;
  /**
   * El estudiante pidió un reto («Tomar un reto», pedido del dueño 04/10: «que el que se sienta en confianza pueda elegir
   * un desafío más difícil para subir su dominio más rápido»): un ejercicio pendiente del nivel siguiente al que va.
   */
  reto?: boolean;
}

const NOMBRE_NIVEL: Record<Difficulty, string> = {
  [Difficulty.BASICO]: 'básico',
  [Difficulty.INTERMEDIO]: 'intermedio',
  [Difficulty.AVANZADO]: 'avanzado',
};

function mensajePara(motivo: MotivoRecomendacion, nivel: Difficulty): string {
  switch (motivo) {
    case 'repaso':
      return 'Toca repasar esta lección: aquí tienes un ejercicio parecido a los que ya resolviste.';
    case 'reto':
      return 'Un reto: si lo resuelves al primer intento, te saltas lo básico de esta lección.';
    case 'sube_nivel':
      return `Vas muy bien: pasemos al nivel ${NOMBRE_NIVEL[nivel]}.`;
    case 'baja_nivel':
      return `Te costaron los dos últimos: afiancemos el nivel ${NOMBRE_NIVEL[nivel]}. El tutor puede darte una pista.`;
    case 'hermana':
      return 'Prueba otro ejercicio del mismo tipo y nivel.';
    case 'reintento':
      return 'Inténtalo de nuevo; si te atascas, pídele una pista al tutor.';
    case 'siguiente':
      return 'Sigue con el siguiente ejercicio de la lección.';
    case 'practica_extra':
      return 'Completaste la lección. Si quieres, practica con este ejercicio que aún no has hecho.';
    case 'completada':
      return 'Completaste la lección. Puedes seguir practicando.';
    case 'sin_intentos':
      return 'Usaste todos los intentos de los ejercicios que faltan. Pídele ayuda al tutor o a tu docente.';
    case 'pausa':
      return 'Llevas varios intentos seguidos sin lograrlo. Para un momento: vuelve a la explicación o pídele una pista al tutor. Si lo necesitas, tu docente ya está al tanto y puede ayudarte.';
  }
}

/**
 * Tope estilo ASSISTments (docs/DISENO_INTERVENCION_DOCENTE.md §4.4; BASE_TEORICA.md BT-16): tras estos fallos
 * seguidos en una lección, STIRE deja de empujar «otro ejercicio más», propone volver a la explicación o pedir una pista
 * y avisa al docente. Es el mismo umbral con el que el mapa de calor marca a alguien como bloqueado.
 */
export const FALLOS_PARA_PAUSA = 3;

/** Intentos calificados seguidos sin aprobar, contando desde el último hacia atrás (un aprobado corta la racha). */
export function fallosSeguidos(intentos: Array<{ aprobado: boolean; fecha: Date }>): number {
  const ordenados = [...intentos].sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
  let n = 0;
  for (let i = ordenados.length - 1; i >= 0 && !ordenados[i].aprobado; i--) n++;
  return n;
}

/** Mismo criterio que `isSubmissionPassed`: el puntaje de aprobación es un porcentaje del total de la actividad. */
function aprueba(actividad: ActividadParaRecomendar, score: number): boolean {
  return actividad.totalPoints > 0 && (score / actividad.totalPoints) * 100 >= actividad.passingScore;
}

/**
 * Reto de salto: con «Me siento seguro», acertar al primer intento una actividad de un nivel superior hace que los
 * niveles de abajo dejen de exigirse (siguen disponibles). Devuelve el nivel (0 básico, 1 intermedio, 2 avanzado) desde
 * el que se exige; -1 si no se saltó nada. Lo usan el recomendador y el cálculo del dominio, para que la unidad no diga
 * «completada» con un dominio que todavía cuenta como pendientes las casillas saltadas.
 */
export function nivelSaltadoHasta(
  actividades: Array<Pick<ActividadParaRecomendar, 'id' | 'difficulty' | 'totalPoints' | 'passingScore'>>,
  intentos: IntentoParaRecomendar[],
  confianza: Confianza | null,
): number {
  if (confianza !== CONFIANZA_SEGURO) return -1;
  const calificados = intentos.filter((i) => i.calificado).sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
  const niveles = actividades
    .filter((a) => {
      const primero = calificados.find((i) => i.activityId === a.id);
      return !!primero && a.totalPoints > 0 && (primero.score / a.totalPoints) * 100 >= a.passingScore;
    })
    .map((a) => rangoNivel(a.difficulty));
  return Math.max(-1, ...niveles);
}

interface Casilla {
  clave: string;
  nivel: number;
  actividades: ActividadParaRecomendar[];
}

/**
 * La siguiente actividad. Si el estudiante lleva FALLOS_PARA_PAUSA seguidos en la lección, la recomendación se vuelve
 * una pausa: la misma actividad queda disponible, pero lo primero que se le propone es volver a la explicación.
 */
export function recomendarSiguiente(entrada: EntradaRecomendador): Recomendacion | null {
  const recomendacion = recomendarSinTope(entrada);
  if (!recomendacion || recomendacion.completada || recomendacion.motivo === 'sin_intentos') return recomendacion;
  const porId = new Map(entrada.actividades.map((a) => [a.id, a]));
  const calificados = entrada.intentos
    .filter((i) => i.calificado && porId.has(i.activityId))
    .map((i) => ({ aprobado: aprueba(porId.get(i.activityId)!, i.score), fecha: i.fecha }));
  if (fallosSeguidos(calificados) < FALLOS_PARA_PAUSA) return recomendacion;
  return { ...recomendacion, motivo: 'pausa', mensaje: mensajePara('pausa', recomendacion.nivel) };
}

function recomendarSinTope(entrada: EntradaRecomendador): Recomendacion | null {
  const actividades = [...entrada.actividades].sort(
    (a, b) =>
      rangoNivel(a.difficulty) - rangoNivel(b.difficulty) ||
      rangoTipo(a.questionType) - rangoTipo(b.questionType) ||
      a.order - b.order ||
      a.id - b.id,
  );
  if (actividades.length === 0) return null;

  const porId = new Map(actividades.map((a) => [a.id, a]));
  const intentos = entrada.intentos.filter((i) => porId.has(i.activityId));
  const calificados = intentos
    .filter((i) => i.calificado)
    .sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

  const aprobada = (a: ActividadParaRecomendar) => calificados.some((i) => i.activityId === a.id && aprueba(a, i.score));
  const intentada = (a: ActividadParaRecomendar) => intentos.some((i) => i.activityId === a.id);
  // Misma regla que SubmissionsService.start: solo un límite positivo restringe.
  const quedanIntentos = (a: ActividadParaRecomendar) =>
    !(a.attemptsAllowed > 0) || intentos.filter((i) => i.activityId === a.id).length < a.attemptsAllowed;

  // Casillas en orden pedagógico: nivel, luego tipo.
  const casillas: Casilla[] = [];
  for (const a of actividades) {
    const clave = claveCasilla(a);
    const existente = casillas.find((c) => c.clave === clave);
    if (existente) existente.actividades.push(a);
    else casillas.push({ clave, nivel: rangoNivel(a.difficulty), actividades: [a] });
  }
  const casillaAprobada = (c: Casilla) => c.actividades.some(aprobada);

  // Reto de salto: con «Me siento seguro», acertar al primer intento una actividad de un nivel superior hace que los
  // niveles de abajo dejen de exigirse (siguen disponibles).
  const saltadoHasta = nivelSaltadoHasta(actividades, intentos, entrada.confianza);
  const exigida = (c: Casilla) => c.nivel >= saltadoHasta;
  const pendientes = casillas.filter((c) => exigida(c) && !casillaAprobada(c));
  const completada = pendientes.length === 0;
  const nivelesConPendientes = [...new Set(pendientes.map((c) => c.nivel))].sort((a, b) => a - b);

  const resultado = (actividad: ActividadParaRecomendar, motivo: MotivoRecomendacion): Recomendacion => ({
    actividad,
    motivo,
    mensaje: mensajePara(motivo, actividad.difficulty),
    nivel: actividad.difficulty,
    completada,
  });

  // Dentro de una casilla sin aprobar: tras un fallo, una hermana nueva; si no hay, reintentar; si no, la primera libre.
  const elegirEnCasilla = (c: Casilla): { actividad: ActividadParaRecomendar; motivo: MotivoRecomendacion } | null => {
    const conIntentos = c.actividades.filter(quedanIntentos);
    if (conIntentos.length === 0) return null;
    const fallada = [...calificados].reverse().find((i) => c.actividades.some((a) => a.id === i.activityId));
    const nueva = conIntentos.find((a) => !intentada(a));
    if (fallada) {
      if (nueva) return { actividad: nueva, motivo: 'hermana' };
      const misma = conIntentos.find((a) => a.id === fallada.activityId);
      return { actividad: misma ?? conIntentos[0], motivo: 'reintento' };
    }
    return { actividad: nueva ?? conIntentos[0], motivo: 'siguiente' };
  };

  const primeraPendienteEnNivel = (nivel: number) => {
    for (const c of pendientes.filter((p) => p.nivel === nivel)) {
      const elegida = elegirEnCasilla(c);
      if (elegida) return elegida;
    }
    return null;
  };

  // 0. Reto pedido: la primera casilla pendiente del nivel siguiente al que viene trabajando (la zona de lo que aún no
  //    domina pero está a su alcance; Metcalfe, 2009). Si no hay nivel más alto pendiente, sigue la recomendación normal.
  if (entrada.reto && !completada) {
    // Dónde va: lo más alto entre su nivel pendiente más bajo, lo que ya aprobó y lo último que intentó.
    const ultimo = calificados[calificados.length - 1];
    const nivelActual = Math.max(
      nivelesConPendientes[0],
      ultimo ? rangoNivel(porId.get(ultimo.activityId)!.difficulty) : -1,
      ...actividades.filter(aprobada).map((a) => rangoNivel(a.difficulty)),
    );
    for (const nivel of nivelesConPendientes.filter((n) => n > nivelActual)) {
      const elegida = primeraPendienteEnNivel(nivel);
      if (elegida) return resultado(elegida.actividad, 'reto');
    }
  }

  // 1. Repaso primero: una hermana de una casilla ya aprobada (la no intentada; si no, la practicada hace más tiempo).
  if (entrada.repasoVencido) {
    const deCasillasAprobadas = casillas.filter(casillaAprobada).flatMap((c) => c.actividades).filter(quedanIntentos);
    const ultimaVez = (a: ActividadParaRecomendar) =>
      Math.max(0, ...intentos.filter((i) => i.activityId === a.id).map((i) => i.fecha.getTime()));
    const candidata =
      deCasillasAprobadas.find((a) => !intentada(a)) ??
      [...deCasillasAprobadas].sort((a, b) => ultimaVez(a) - ultimaVez(b))[0];
    if (candidata) return resultado(candidata, 'repaso');
  }

  if (completada) {
    const extra = actividades.find((a) => !intentada(a) && quedanIntentos(a));
    return extra ? resultado(extra, 'practica_extra') : resultado(actividades[actividades.length - 1], 'completada');
  }

  // 2. Nivel objetivo.
  let nivelObjetivo = nivelesConPendientes[0];
  let motivoNivel: MotivoRecomendacion | null = null;

  if (calificados.length === 0) {
    // Sin intentos todavía: «Me siento seguro» abre con un reto del nivel siguiente al más bajo pendiente.
    const siguiente = nivelesConPendientes.find((n) => n > nivelObjetivo);
    if (entrada.confianza === CONFIANZA_SEGURO && siguiente !== undefined) {
      nivelObjetivo = siguiente;
      motivoNivel = 'reto';
    }
  } else {
    const ultimo = calificados[calificados.length - 1];
    const nivelUltimo = rangoNivel(porId.get(ultimo.activityId)!.difficulty);
    const recientes = calificados.slice(-2);
    const esPrimerIntento = (i: IntentoParaRecomendar) =>
      calificados.find((c) => c.activityId === i.activityId) === i && aprueba(porId.get(i.activityId)!, i.score);
    const falla = (i: IntentoParaRecomendar) => !aprueba(porId.get(i.activityId)!, i.score);
    const ultimosSeis = calificados.slice(-6);
    const tasaPrimerIntento = ultimosSeis.filter(esPrimerIntento).length / ultimosSeis.length;
    const tasaAcierto = ultimosSeis.filter((i) => !falla(i)).length / ultimosSeis.length;

    const sube =
      (recientes.length === 2 && recientes.every(esPrimerIntento)) || (ultimosSeis.length === 6 && tasaPrimerIntento > 0.9);
    const baja =
      (recientes.length === 2 && recientes.every(falla)) || (ultimosSeis.length >= 4 && tasaAcierto < 0.5);

    if (baja && nivelUltimo > 0) {
      // Bajar un nivel: una casilla pendiente de ahí o, si ya está aprobado, una hermana nueva para practicar.
      const abajo = nivelUltimo - 1;
      const pendiente = primeraPendienteEnNivel(abajo);
      if (pendiente) return resultado(pendiente.actividad, 'baja_nivel');
      const practica = actividades.find((a) => rangoNivel(a.difficulty) === abajo && !intentada(a) && quedanIntentos(a));
      if (practica) return resultado(practica, 'baja_nivel');
      nivelObjetivo = nivelUltimo;
    } else if (sube) {
      const arriba = nivelesConPendientes.find((n) => n > nivelUltimo);
      if (arriba !== undefined) {
        nivelObjetivo = arriba;
        motivoNivel = 'sube_nivel';
      } else if (nivelesConPendientes.includes(nivelUltimo)) {
        nivelObjetivo = nivelUltimo;
      }
    } else if (nivelesConPendientes.includes(nivelUltimo)) {
      // Seguir en el nivel donde viene trabajando; al terminarlo, el siguiente hacia arriba y al final los huecos.
      nivelObjetivo = nivelUltimo;
    } else {
      nivelObjetivo = nivelesConPendientes.find((n) => n > nivelUltimo) ?? nivelesConPendientes[0];
    }
  }

  // 3. La primera casilla pendiente del nivel objetivo; si no hay nada que hacer ahí, las demás en orden.
  const orden = [nivelObjetivo, ...nivelesConPendientes.filter((n) => n !== nivelObjetivo)];
  for (const nivel of orden) {
    const elegida = primeraPendienteEnNivel(nivel);
    if (elegida) {
      const motivo = nivel === nivelObjetivo && motivoNivel && elegida.motivo === 'siguiente' ? motivoNivel : elegida.motivo;
      return resultado(elegida.actividad, motivo);
    }
  }

  // Quedan casillas sin aprobar, pero sin intentos disponibles.
  return resultado(pendientes[0].actividades[0], 'sin_intentos');
}
