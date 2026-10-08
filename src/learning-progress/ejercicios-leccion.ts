import { Difficulty } from '../common/enums/difficulty.enum';
import { QuestionType } from '../common/enums/question-type.enum';
import { claveCasilla, rangoNivel, rangoTipo } from '../common/utils/casilla';

// «Ver todos los ejercicios» de una lección (08/10, Jeider): antes era una lista de nombres. Ahora cada ejercicio dice
// si todavía puede subir tu dominio, su nivel, su tipo y cuánto pesa en la lección, con las mismas reglas del dominio
// (src/common/utils/mastery.calculator.ts): los ejercicios «parecidos» (mismo tipo y nivel) son una sola casilla y
// cuenta el mejor de ellos.

export interface ActividadLeccion {
  id: number;
  title: string;
  difficulty?: Difficulty | null;
  questionType?: QuestionType | null;
  totalPoints: number;
  passingScore: number;
  adaptiveWeight?: number | null;
  activityType?: { baseWeight?: number | null } | null;
  attemptsAllowed?: number | null;
  order?: number | null;
}

export interface IntentoLeccion { activityId: number; score: number }

/**
 * por-hacer: no lo ha intentado y sube su dominio · en-curso: lo intentó y todavía no lo aprueba · hecho: lo aprobó ·
 * cuenta-otro: no lo ha hecho, pero un ejercicio parecido ya dio todo lo de su casilla · sin-intentos: usó los intentos.
 */
export type EstadoEjercicio = 'por-hacer' | 'en-curso' | 'hecho' | 'cuenta-otro' | 'sin-intentos';

export interface EjercicioLeccion {
  id: number;
  titulo: string;
  nivel: Difficulty;
  tipo: QuestionType | null;
  /** Parte del dominio de la lección que da su casilla (0-100). */
  pesoPct: number;
  /** Cuántos ejercicios comparten su casilla (incluido él): cuentan como uno. */
  parecidos: number;
  estado: EstadoEjercicio;
  /** ¿Hacerlo (o mejorarlo) todavía puede subir el dominio? */
  subeDominio: boolean;
  intentosUsados: number;
  /** 0 = sin límite. */
  intentosPermitidos: number;
  /** Mejor nota en porcentaje, o null si no lo ha entregado. */
  mejorPct: number | null;
}

const peso = (a: ActividadLeccion) => (a.adaptiveWeight ?? 1) * (a.activityType?.baseWeight || 1);

export function ejerciciosDeLaLeccion(actividades: ActividadLeccion[], intentos: IntentoLeccion[]): EjercicioLeccion[] {
  const casillas = new Map<string, ActividadLeccion[]>();
  for (const a of actividades) {
    const clave = claveCasilla(a);
    casillas.set(clave, [...(casillas.get(clave) ?? []), a]);
  }

  const pesoCasilla = new Map<string, number>();
  for (const [clave, hermanas] of casillas) pesoCasilla.set(clave, Math.max(...hermanas.map(peso)));
  const pesoTotal = [...pesoCasilla.values()].reduce((s, p) => s + p, 0) || 1;

  const mejor = (a: ActividadLeccion): number | null => {
    const notas = intentos.filter((i) => i.activityId === a.id).map((i) => (a.totalPoints > 0 ? i.score / a.totalPoints : 0));
    return notas.length ? Math.max(...notas) : null;
  };
  const mejorDeCasilla = new Map<string, number>();
  for (const [clave, hermanas] of casillas) mejorDeCasilla.set(clave, Math.max(0, ...hermanas.map((h) => mejor(h) ?? 0)));

  return actividades
    .map((a) => {
      const clave = claveCasilla(a);
      const usados = intentos.filter((i) => i.activityId === a.id).length;
      const permitidos = a.attemptsAllowed ?? 0;
      const quedan = permitidos === 0 || usados < permitidos;
      const nota = mejor(a);
      const aprobado = nota !== null && nota * 100 >= a.passingScore;
      const casillaLlena = (mejorDeCasilla.get(clave) ?? 0) >= 1;

      let estado: EstadoEjercicio;
      if (aprobado) estado = 'hecho';
      else if (!quedan) estado = 'sin-intentos';
      else if (casillaLlena) estado = 'cuenta-otro';
      else estado = usados > 0 ? 'en-curso' : 'por-hacer';

      const subeDominio = quedan && !casillaLlena && (estado !== 'hecho' || (nota ?? 0) < 1);
      return {
        id: a.id,
        titulo: a.title,
        nivel: a.difficulty ?? Difficulty.BASICO,
        tipo: a.questionType ?? null,
        pesoPct: Math.round(((pesoCasilla.get(clave) ?? 0) / pesoTotal) * 100),
        parecidos: casillas.get(clave)?.length ?? 1,
        estado,
        subeDominio,
        intentosUsados: usados,
        intentosPermitidos: permitidos,
        mejorPct: nota === null ? null : Math.round(nota * 100),
        orden: a.order ?? 0,
      };
    })
    // Organizado: por nivel (básico → avanzado), y dentro, de reconocer a crear (opción múltiple → programar).
    .sort((x, y) => rangoNivel(x.nivel) - rangoNivel(y.nivel) || rangoTipo(x.tipo) - rangoTipo(y.tipo) || x.orden - y.orden || x.id - y.id)
    .map(({ orden: _orden, ...e }) => e);
}
