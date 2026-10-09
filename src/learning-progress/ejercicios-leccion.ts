import { Difficulty } from '../common/enums/difficulty.enum';
import { QuestionType } from '../common/enums/question-type.enum';
import { claveCasilla, rangoNivel, rangoTipo } from '../common/utils/casilla';
import { casillasDeDominio, gananciaSiLoResuelve, intentosDisponibles } from '../common/utils/motor-dominio';

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

export interface IntentoLeccion { activityId: number; score: number; isReview?: boolean | null; submittedAt?: Date | string | null; createdAt?: Date | string | null }

/**
 * por-hacer: no lo ha intentado y sube su dominio · en-curso: lo intentó y todavía no lo aprueba · hecho: lo aprobó ·
 * cuenta-otro: no lo ha aprobado, pero su casilla ya está completa (no sube) · sin-intentos: usó los intentos (se reabre).
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
  /** ¿Hacerlo (o mejorarlo) todavía puede subir el dominio? (ganancia de 1 punto o más y un intento disponible). */
  subeDominio: boolean;
  /** Puntos que subiría el dominio de la lección si lo resolviera ahora con nota completa (motor del dominio). */
  ganancia: number;
  /** Cuánto lleva su casilla (sus parecidos y él), de 0 a 100. */
  casillaPct: number;
  /** Si no le quedan intentos: cuándo se reabre uno (ISO). */
  reabreEn: string | null;
  intentosUsados: number;
  /** 0 = sin límite. */
  intentosPermitidos: number;
  /** Mejor nota en porcentaje, o null si no lo ha entregado. */
  mejorPct: number | null;
}

const peso = (a: ActividadLeccion) => (a.adaptiveWeight ?? 1) * (a.activityType?.baseWeight || 1);

/**
 * 09/10 (Jeider: «tengo un ejercicio y no puedo seguir subiendo mi dominio»): la lista calculaba «sube o no» con sus
 * propias reglas (la mejor nota sin la penalización por repetir) y decía «Ya cuenta un parecido · no sube» cuando sí
 * subía. Ahora usa el motor del dominio (common/utils/motor-dominio.ts): cuánto sube cada uno es lo que de verdad
 * cambiaría su dominio, y un ejercicio sin intentos dice cuándo se reabre.
 */
export function ejerciciosDeLaLeccion(
  actividades: ActividadLeccion[],
  intentos: IntentoLeccion[],
  opciones: { nivelSaltadoHasta?: number; ahora?: Date } = {},
): EjercicioLeccion[] {
  const ahora = opciones.ahora ?? new Date();
  const paraMotor = actividades.map((a) => ({ ...a, passingScore: a.passingScore }));
  const casillasMotor = casillasDeDominio(intentos, paraMotor, opciones);
  const casillaDe = new Map<number, number>();
  for (const c of casillasMotor) for (const id of c.actividades) casillaDe.set(id, Math.round(c.estimacion * 100));

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

  return actividades
    .map((a) => {
      const clave = claveCasilla(a);
      const suyos = intentos.filter((i) => i.activityId === a.id);
      const permitidos = a.attemptsAllowed ?? 0;
      const fechas = suyos.map((i) => new Date(i.submittedAt ?? i.createdAt ?? 0));
      const { quedan, reabreEn } = intentosDisponibles(permitidos, fechas, ahora);
      const nota = mejor(a);
      const aprobado = nota !== null && nota * 100 >= a.passingScore;
      const ganancia = gananciaSiLoResuelve(intentos, paraMotor, a.id, { ...opciones, ahora });

      let estado: EstadoEjercicio;
      if (aprobado) estado = 'hecho';
      else if (quedan === 0) estado = 'sin-intentos';
      else if (ganancia < 1) estado = 'cuenta-otro';
      else estado = suyos.length > 0 ? 'en-curso' : 'por-hacer';

      return {
        id: a.id,
        titulo: a.title,
        nivel: a.difficulty ?? Difficulty.BASICO,
        tipo: a.questionType ?? null,
        pesoPct: Math.round(((pesoCasilla.get(clave) ?? 0) / pesoTotal) * 100),
        parecidos: casillas.get(clave)?.length ?? 1,
        estado,
        subeDominio: quedan > 0 && ganancia >= 1,
        ganancia,
        casillaPct: casillaDe.get(a.id) ?? 0,
        reabreEn: reabreEn ? reabreEn.toISOString() : null,
        intentosUsados: suyos.length,
        intentosPermitidos: permitidos,
        mejorPct: nota === null ? null : Math.round(nota * 100),
        orden: a.order ?? 0,
      };
    })
    // Organizado: por nivel (básico → avanzado), y dentro, de reconocer a crear (opción múltiple → programar).
    .sort((x, y) => rangoNivel(x.nivel) - rangoNivel(y.nivel) || rangoTipo(x.tipo) - rangoTipo(y.tipo) || x.orden - y.orden || x.id - y.id)
    .map(({ orden: _orden, ...e }) => e);
}
