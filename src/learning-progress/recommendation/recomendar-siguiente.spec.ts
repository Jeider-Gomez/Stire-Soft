import { Difficulty } from '../../common/enums/difficulty.enum';
import { QuestionType } from '../../common/enums/question-type.enum';
import {
  ActividadParaRecomendar,
  Confianza,
  IntentoParaRecomendar,
  nivelSaltadoHasta,
  recomendarSiguiente,
} from './recomendar-siguiente';

// Una prueba por regla de docs/DISENO_PRACTICA_ADAPTATIVA.md §3.3.

const B = Difficulty.BASICO;
const I = Difficulty.INTERMEDIO;
const A = Difficulty.AVANZADO;

function act(id: number, difficulty: Difficulty, questionType: QuestionType | null, extra: Partial<ActividadParaRecomendar> = {}): ActividadParaRecomendar {
  return { id, title: `Actividad ${id}`, order: id, difficulty, questionType, totalPoints: 100, passingScore: 60, attemptsAllowed: 3, ...extra };
}

let reloj = 0;
function intento(activityId: number, score: number, calificado = true): IntentoParaRecomendar {
  reloj += 1;
  return { activityId, score, calificado, fecha: new Date(2026, 8, 1, 0, reloj) };
}

function recomendar(actividades: ActividadParaRecomendar[], intentos: IntentoParaRecomendar[] = [], confianza: Confianza | null = null, repasoVencido = false) {
  return recomendarSiguiente({ actividades, intentos, confianza, repasoVencido });
}

// Unidad típica: básico (predecir, ordenar ×2 hermanas, programar), intermedio (completar, programar), avanzado (programar).
const UNIDAD = [
  act(1, B, QuestionType.MCQ),
  act(2, B, QuestionType.ORDERING),
  act(3, B, QuestionType.ORDERING),
  act(4, B, QuestionType.CODING),
  act(5, I, QuestionType.FILL_CODE),
  act(6, I, QuestionType.CODING),
  act(7, A, QuestionType.CODING),
];

describe('recomendarSiguiente', () => {
  beforeEach(() => {
    reloj = 0;
  });

  it('sin actividades no recomienda nada', () => {
    expect(recomendar([])).toBeNull();
  });

  it('sin intentos ni confianza empieza por lo básico, en orden de reconocer a crear (aunque el docente las haya creado en otro orden)', () => {
    const desordenada = [act(9, B, QuestionType.CODING, { order: 0 }), act(8, B, QuestionType.MCQ, { order: 5 })];
    const r = recomendar(desordenada)!;
    expect(r.actividad.id).toBe(8);
    expect(r.motivo).toBe('siguiente');
    expect(r.nivel).toBe(B);
  });

  it('«Es nuevo» y «Tengo dudas» empiezan por lo básico', () => {
    expect(recomendar(UNIDAD, [], 1)!.actividad.id).toBe(1);
    expect(recomendar(UNIDAD, [], 2)!.actividad.id).toBe(1);
  });

  it('«Me siento seguro» sin intentos ofrece un reto del nivel siguiente', () => {
    const r = recomendar(UNIDAD, [], 3)!;
    expect(r.actividad.id).toBe(5);
    expect(r.motivo).toBe('reto');
    expect(r.mensaje).toContain('reto');
  });

  it('acertar el reto al primer intento con «Me siento seguro» salta lo básico: ya no se exige', () => {
    const r = recomendar(UNIDAD, [intento(5, 100), intento(6, 100), intento(7, 100)], 3)!;
    expect(r.completada).toBe(true);
  });

  it('sin «Me siento seguro», acertar lo avanzado no salta lo básico', () => {
    const r = recomendar(UNIDAD, [intento(7, 100)], 2)!;
    expect(r.completada).toBe(false);
  });

  it('sigue con la siguiente casilla del mismo nivel tras aprobar una', () => {
    const r = recomendar(UNIDAD, [intento(1, 40), intento(1, 100)])!;
    expect(r.actividad.id).toBe(2);
    expect(r.motivo).toBe('siguiente');
  });

  it('tras un fallo ofrece una hermana nueva del mismo tipo y nivel, no la misma respuesta', () => {
    const r = recomendar(UNIDAD, [intento(1, 100), intento(2, 20)])!;
    expect(r.actividad.id).toBe(3);
    expect(r.motivo).toBe('hermana');
  });

  it('si no hay hermana nueva, propone reintentar la misma', () => {
    const r = recomendar(UNIDAD, [intento(1, 100), intento(2, 20), intento(3, 30)])!;
    expect(r.actividad.id).toBe(3);
    expect(r.motivo).toBe('reintento');
  });

  it('no recomienda una actividad sin intentos disponibles', () => {
    const sinIntentos = [act(1, B, QuestionType.MCQ, { attemptsAllowed: 1 }), act(2, B, QuestionType.MCQ)];
    const r = recomendar(sinIntentos, [intento(1, 0)])!;
    expect(r.actividad.id).toBe(2);
  });

  it('dos aciertos seguidos al primer intento suben de nivel aunque falten casillas básicas', () => {
    const r = recomendar(UNIDAD, [intento(1, 100), intento(2, 100)])!;
    expect(r.actividad.id).toBe(5);
    expect(r.motivo).toBe('sube_nivel');
    expect(r.mensaje).toContain('intermedio');
  });

  it('un acierto tras un reintento no cuenta como primer intento para subir', () => {
    const r = recomendar(UNIDAD, [intento(1, 100), intento(2, 10), intento(2, 100)])!;
    expect(r.nivel).toBe(B);
  });

  it('tras subir, sigue en el nivel nuevo aunque falle una vez (no lo devuelve de golpe a lo básico)', () => {
    const r = recomendar(UNIDAD, [intento(1, 100), intento(2, 100), intento(5, 30)])!;
    expect(r.nivel).toBe(I);
  });

  it('dos fallos seguidos bajan un nivel con un mensaje que ofrece al tutor', () => {
    const r = recomendar(UNIDAD, [intento(1, 100), intento(2, 100), intento(5, 10), intento(6, 10)])!;
    expect(r.nivel).toBe(B);
    expect(r.motivo).toBe('baja_nivel');
    expect(r.mensaje).toContain('tutor');
  });

  it('con repaso vencido, el siguiente paso es una hermana no intentada de una casilla ya aprobada', () => {
    const r = recomendar(UNIDAD, [intento(1, 100), intento(2, 100)], null, true)!;
    expect(r.actividad.id).toBe(3);
    expect(r.motivo).toBe('repaso');
  });

  it('con repaso vencido y sin hermanas nuevas, repasa la practicada hace más tiempo', () => {
    const r = recomendar([act(1, B, QuestionType.MCQ), act(2, B, QuestionType.ORDERING)], [intento(2, 100), intento(1, 100)], null, true)!;
    expect(r.actividad.id).toBe(2);
    expect(r.motivo).toBe('repaso');
  });

  it('con repaso vencido pero nada aprobado todavía, sigue el camino normal', () => {
    const r = recomendar(UNIDAD, [], null, true)!;
    expect(r.motivo).toBe('siguiente');
  });

  it('al completar la unidad ofrece práctica extra con una hermana no hecha', () => {
    const r = recomendar(UNIDAD, [1, 2, 4, 5, 6, 7].map((id) => intento(id, 100)))!;
    expect(r.completada).toBe(true);
    expect(r.actividad.id).toBe(3);
    expect(r.motivo).toBe('practica_extra');
  });

  it('completada y sin nada nuevo: la última actividad, marcada como completada', () => {
    const r = recomendar([act(1, B, QuestionType.MCQ)], [intento(1, 100)])!;
    expect(r).toEqual(expect.objectContaining({ completada: true, motivo: 'completada' }));
    expect(r.actividad.id).toBe(1);
  });

  it('un intento en curso gasta un intento pero no cuenta como resultado', () => {
    const r = recomendar([act(1, B, QuestionType.MCQ, { attemptsAllowed: 1 }), act(2, B, QuestionType.ORDERING)], [intento(1, 0, false)])!;
    expect(r.actividad.id).toBe(2);
    expect(r.completada).toBe(false);
  });

  it('casillas pendientes sin intentos disponibles: lo dice en vez de fingir que terminó', () => {
    const r = recomendar([act(1, B, QuestionType.MCQ, { attemptsAllowed: 1 })], [intento(1, 0)])!;
    expect(r.motivo).toBe('sin_intentos');
    expect(r.completada).toBe(false);
  });

  it('actividades sin tipo de pregunta conocido se tratan cada una como su propia casilla', () => {
    const r = recomendar([act(1, B, null), act(2, B, null)], [intento(1, 100)])!;
    expect(r.actividad.id).toBe(2);
    expect(r.completada).toBe(false);
  });

  it('cada motivo trae un mensaje de una línea para el estudiante', () => {
    const r = recomendar(UNIDAD)!;
    expect(r.mensaje.length).toBeGreaterThan(10);
    expect(r.mensaje).not.toContain('\n');
  });
});

// El dominio usa el mismo cálculo que el recomendador para saber qué casillas se saltaron (mastery.calculator.ts).
describe('nivelSaltadoHasta', () => {
  const unidad = [act(1, B, QuestionType.MCQ), act(2, I, QuestionType.CODING), act(3, A, QuestionType.CODING)];

  it('sin «Me siento seguro» no se salta nada, aunque acierte arriba', () => {
    expect(nivelSaltadoHasta(unidad, [intento(2, 100)], 2)).toBe(-1);
    expect(nivelSaltadoHasta(unidad, [intento(2, 100)], null)).toBe(-1);
  });

  it('con «Me siento seguro», el nivel más alto acertado al primer intento', () => {
    expect(nivelSaltadoHasta(unidad, [intento(2, 100)], 3)).toBe(1);
    expect(nivelSaltadoHasta(unidad, [intento(2, 100), intento(3, 80)], 3)).toBe(2);
  });

  it('acertar después de fallar no cuenta como salto', () => {
    expect(nivelSaltadoHasta(unidad, [intento(2, 10), intento(2, 100)], 3)).toBe(-1);
  });
});

