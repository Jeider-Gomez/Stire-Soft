import { Difficulty } from '../enums/difficulty.enum';
import { claveCasilla, rangoNivel } from './casilla';

/**
 * Motor del dominio por evidencia (docs/DISENO_DOMINIO.md; BT-43). Reemplaza «la mejor nota de cada casilla» (09/10,
 * Jeider: «tengo un ejercicio y no puedo seguir subiendo mi dominio»; «que suba y baje, pero que un error no le cueste
 * toda la lección; que repetir el mismo ejercicio suba poco; que quien ya sabe suba rápido»).
 *
 * - Cada casilla (tipo de pregunta × nivel) tiene una estimación p de 0 a 1. Los intentos se recorren en orden y cada
 *   uno la mueve hacia su nota, como una media móvil exponencial (Pelánek, 2016: el Elo en sistemas adaptativos):
 *   aprobar un ejercicio NUEVO a la primera la lleva a su nota de una vez (quien ya sabe avanza rápido); aprobarlo tras
 *   fallar, o repetir uno ya aprobado, la acerca menos (más lo repite, menos sube); fallar la baja un poco, en proporción
 *   a lo que tenía, nunca a cero (un error no cuesta la lección).
 * - El dominio de la lección es el promedio de las casillas, pesando más los niveles altos.
 * - GARANTÍA: desde cualquier estado, aprobar ejercicios lleva la lección al 100 %. Toda casilla tiene al menos un
 *   ejercicio que se puede intentar (los intentos se reabren: `intentosDisponibles`), cada aprobado con nota completa la
 *   acerca a 1 al menos REGLAS.repetirResuelto del camino que falta, y cerca de 1 se completa (REGLAS.completo). Lo prueba
 *   motor-dominio.spec.ts con lecciones al azar.
 * Función pura: el mismo historial da el mismo dominio, así que se puede recalcular cuando cambien las reglas.
 */

export const REGLAS = {
  /**
   * Cuánto pesa cada nivel en el dominio de la lección. Por ahora 1 en todos: subirlo (p. ej., 1 / 1,5 / 2) cambia el
   * dominio de todos hacia atrás, y en plena prueba con el equipo eso confundiría. Propuesta para después del 16/10
   * (docs/DISENO_DOMINIO.md §6). Quien ya sabe avanza rápido igual: un ejercicio nuevo aprobado a la primera llena su
   * casilla y el reto salta los niveles de abajo.
   */
  pesoNivel: {
    [Difficulty.BASICO]: 1,
    [Difficulty.INTERMEDIO]: 1,
    [Difficulty.AVANZADO]: 1,
  } as Record<string, number>,
  /** Cuánto del camino a su nota avanza un aprobado, según el intento en el que lo logra en ESE ejercicio (1.º, 2.º, 3.º o más). */
  aprobarEnIntento: [1, 0.6, 0.4],
  /** Volver a aprobar un ejercicio que ya aprobó: es repaso, suma poco. Es también el piso que garantiza llegar al 100 %. */
  repetirResuelto: 0.25,
  /** Un intento no aprobado pero con parte bien (p. ej., 3 de 5 casos) acerca un poco la casilla a esa nota. */
  creditoParcial: 0.25,
  /** Al fallar en práctica se pierde esta fracción de lo que se tenía por encima de la nota del intento. */
  bajaPorFallo: 0.1,
  /** Al fallar un repaso (lo olvidó), la baja es mayor, pero tampoco a cero. */
  bajaPorRepasoFallado: 0.25,
  /** Desde aquí la casilla cuenta como completa: sin esto, la media móvil se acercaría a 1 sin llegar nunca. */
  completo: 0.98,
  /** Un ejercicio sin intentos se reabre un intento cada tanto tiempo desde el último (garantía de que se puede seguir). */
  reabrirCadaHoras: 24,
} as const;

/**
 * Desde esta fecha rigen las reglas nuevas. Los intentos de antes se cuentan con las reglas de antes (la mejor nota, con
 * la penalización suave por repetir un básico y sin bajar por fallar): a nadie se le quita lo que ya ganó al cambiar.
 * Medianoche del 10/10/2026 en Colombia.
 */
export const CORTE_REGLAS_NUEVAS = new Date('2026-10-10T05:00:00Z');

export interface ActividadDominio {
  id: number;
  difficulty?: Difficulty | null;
  questionType?: string | null;
  totalPoints: number;
  passingScore: number;
  adaptiveWeight?: number | null;
  activityType?: { baseWeight?: number | null } | null;
}

export interface IntentoDominio {
  activityId: number;
  score: number;
  isReview?: boolean | null;
  submittedAt?: Date | string | null;
  createdAt?: Date | string | null;
}

export interface CasillaDominio {
  clave: string;
  nivel: Difficulty;
  peso: number;
  /** 0 a 1. */
  estimacion: number;
  actividades: number[];
  /** No cuenta: nivel saltado con un reto y nunca intentada. */
  saltada: boolean;
}

const momento = (s: IntentoDominio) => {
  const f = s.submittedAt ?? s.createdAt;
  return f ? new Date(f).getTime() : 0;
};

const pesoDe = (a: ActividadDominio, pesoNivel: Record<string, number>) =>
  (a.adaptiveWeight ?? 1) *
  (a.activityType?.baseWeight || 1) *
  (pesoNivel[a.difficulty ?? Difficulty.BASICO] ?? 1);

export interface OpcionesDominio {
  nivelSaltadoHasta?: number;
  /** Desde cuándo rigen las reglas nuevas (por defecto CORTE_REGLAS_NUEVAS). */
  corte?: Date;
  /** Peso de cada nivel (por defecto REGLAS.pesoNivel). */
  pesoNivel?: Record<string, number>;
}

/** Reglas de antes del corte (el cálculo hasta el 09/10): la mejor nota, con la penalización suave al básico repetido. */
function factorAntiguo(a: ActividadDominio, intento: number): number {
  if ((a.difficulty ?? null) !== Difficulty.BASICO || intento <= 2) return 1;
  return Math.max(0.5, 1 - (intento - 2) * 0.15);
}

/** Mueve la estimación de una casilla con un intento. Exportada para las pruebas. */
export function moverEstimacion(
  p: number,
  intento: {
    nota: number;
    aprobado: boolean;
    repaso: boolean;
    numero: number;
    yaAprobado: boolean;
  },
): number {
  const { nota } = intento;
  if (nota > p) {
    if (!intento.aprobado) return p + REGLAS.creditoParcial * (nota - p); // lo que sí sabe cuenta, poco
    const alfa = intento.yaAprobado
      ? REGLAS.repetirResuelto
      : REGLAS.aprobarEnIntento[
          Math.min(intento.numero, REGLAS.aprobarEnIntento.length) - 1
        ];
    const nueva = p + Math.max(alfa, REGLAS.repetirResuelto) * (nota - p);
    return nueva >= REGLAS.completo && nota >= 1 ? 1 : nueva;
  }
  if (intento.aprobado) return p;
  const baja = intento.repaso
    ? REGLAS.bajaPorRepasoFallado
    : REGLAS.bajaPorFallo;
  return p - baja * (p - nota);
}

/** Las casillas de la lección con su estimación, recorriendo los intentos en orden. */
export function casillasDeDominio(
  intentos: IntentoDominio[],
  actividades: ActividadDominio[],
  opciones: OpcionesDominio = {},
): CasillaDominio[] {
  const corte = (opciones.corte ?? CORTE_REGLAS_NUEVAS).getTime();
  const pesoNivel = opciones.pesoNivel ?? REGLAS.pesoNivel;
  const validas = actividades.filter((a) => a.totalPoints > 0);
  const porId = new Map(validas.map((a) => [a.id, a]));
  const casillas = new Map<string, CasillaDominio>();
  for (const a of validas) {
    const clave = claveCasilla({
      id: a.id,
      difficulty: a.difficulty,
      questionType: a.questionType as never,
    });
    const c = casillas.get(clave);
    if (c) {
      c.actividades.push(a.id);
      c.peso = Math.max(c.peso, pesoDe(a, pesoNivel));
    } else {
      casillas.set(clave, {
        clave,
        nivel: a.difficulty ?? Difficulty.BASICO,
        peso: pesoDe(a, pesoNivel),
        estimacion: 0,
        actividades: [a.id],
        saltada: false,
      });
    }
  }
  const casillaDe = new Map<number, CasillaDominio>();
  for (const c of casillas.values())
    for (const id of c.actividades) casillaDe.set(id, c);

  const vistos = new Map<number, { intentos: number; aprobados: number }>();
  const mejorAntiguo = new Map<string, number>();
  for (const s of [...intentos]
    .filter((i) => porId.has(i.activityId))
    .sort((a, b) => momento(a) - momento(b))) {
    const a = porId.get(s.activityId)!;
    const c = casillaDe.get(a.id)!;
    const previo = vistos.get(a.id) ?? { intentos: 0, aprobados: 0 };
    const nota = Math.max(0, Math.min(1, s.score / a.totalPoints));
    const aprobado = nota * 100 >= a.passingScore;
    if (momento(s) < corte) {
      // Reglas de antes: la mejor nota de la casilla, salvo si lo último fue un repaso fallado.
      const mejor = Math.max(
        mejorAntiguo.get(c.clave) ?? 0,
        nota * factorAntiguo(a, previo.intentos + 1),
      );
      mejorAntiguo.set(c.clave, mejor);
      c.estimacion = s.isReview && !aprobado ? Math.min(mejor, nota) : mejor;
    } else {
      c.estimacion = moverEstimacion(c.estimacion, {
        nota,
        aprobado,
        repaso: !!s.isReview,
        numero: previo.intentos + 1,
        yaAprobado: previo.aprobados > 0,
      });
    }
    vistos.set(a.id, {
      intentos: previo.intentos + 1,
      aprobados: previo.aprobados + (aprobado ? 1 : 0),
    });
  }

  const saltadoHasta = opciones.nivelSaltadoHasta ?? -1;
  for (const c of casillas.values()) {
    const intentada = c.actividades.some((id) => vistos.has(id));
    c.saltada = !intentada && rangoNivel(c.nivel) < saltadoHasta;
  }
  return [...casillas.values()];
}

/** Dominio de la lección (0 a 100): el promedio de las casillas, pesando más los niveles altos. */
export function dominioDeCasillas(casillas: CasillaDominio[]): number {
  const cuentan = casillas.filter((c) => !c.saltada);
  const total = cuentan.reduce((s, c) => s + c.peso, 0);
  if (total === 0) return 0;
  return Math.min(
    100,
    Math.round(
      (cuentan.reduce((s, c) => s + c.peso * c.estimacion, 0) / total) * 100,
    ),
  );
}

export function calcularDominio(
  intentos: IntentoDominio[],
  actividades: ActividadDominio[],
  opciones: OpcionesDominio = {},
): number {
  return dominioDeCasillas(casillasDeDominio(intentos, actividades, opciones));
}

/**
 * Cuánto subiría el dominio de la lección si resolviera ahora este ejercicio con nota completa (para «Ver todos los
 * ejercicios»: la lista y el cálculo usan las mismas reglas, así que la lista no puede decir «no sube» cuando sí sube).
 */
export function gananciaSiLoResuelve(
  intentos: IntentoDominio[],
  actividades: ActividadDominio[],
  activityId: number,
  opciones: OpcionesDominio & { ahora?: Date } = {},
): number {
  const a = actividades.find((x) => x.id === activityId);
  if (!a || a.totalPoints <= 0) return 0;
  const antes = calcularDominio(intentos, actividades, opciones);
  const ahora = opciones.ahora ?? new Date();
  const despues = calcularDominio(
    [...intentos, { activityId, score: a.totalPoints, submittedAt: ahora }],
    actividades,
    opciones,
  );
  return Math.max(0, despues - antes);
}

/**
 * Intentos que le quedan a un ejercicio. Con el límite usado, se reabre UN intento cuando pasan REGLAS.reabrirCadaHoras
 * desde el último: así ninguna lección queda sin salida (antes, gastar los intentos dejaba la casilla congelada).
 * `attemptsAllowed` 0 = sin límite.
 */
export function intentosDisponibles(
  attemptsAllowed: number,
  fechasDeIntentos: Date[],
  ahora: Date = new Date(),
): { quedan: number; reabreEn: Date | null } {
  if (!(attemptsAllowed > 0))
    return { quedan: Number.POSITIVE_INFINITY, reabreEn: null };
  const usados = fechasDeIntentos.length;
  if (usados < attemptsAllowed)
    return { quedan: attemptsAllowed - usados, reabreEn: null };
  const ultimo = Math.max(...fechasDeIntentos.map((f) => f.getTime()));
  const reabre = ultimo + REGLAS.reabrirCadaHoras * 3_600_000;
  return reabre <= ahora.getTime()
    ? { quedan: 1, reabreEn: null }
    : { quedan: 0, reabreEn: new Date(reabre) };
}
