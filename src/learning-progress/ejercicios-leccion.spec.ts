import { Difficulty } from '../common/enums/difficulty.enum';
import { QuestionType } from '../common/enums/question-type.enum';
import { ActividadLeccion, ejerciciosDeLaLeccion } from './ejercicios-leccion';

// 08/10, Jeider: en «Ver todos los ejercicios», cuáles todavía suben el dominio, su nivel, tipo y peso, organizados.
const act = (id: number, tipo: QuestionType, nivel: Difficulty, extra: Partial<ActividadLeccion> = {}): ActividadLeccion => ({
  id, title: `Ejercicio ${id}`, difficulty: nivel, questionType: tipo, totalPoints: 20, passingScore: 60, adaptiveWeight: 1,
  activityType: { baseWeight: 1 }, attemptsAllowed: 3, order: id, ...extra,
});

describe('ejerciciosDeLaLeccion', () => {
  const actividades = [
    act(5, QuestionType.CODING, Difficulty.INTERMEDIO),
    act(1, QuestionType.MCQ, Difficulty.BASICO),
    act(2, QuestionType.MCQ, Difficulty.BASICO), // parecido al 1: misma casilla
    act(3, QuestionType.FILL_CODE, Difficulty.BASICO),
    act(4, QuestionType.CODING, Difficulty.BASICO),
  ];

  it('organiza por nivel y, dentro, de reconocer a crear (opción múltiple → completar → programar)', () => {
    expect(ejerciciosDeLaLeccion(actividades, []).map((e) => e.id)).toEqual([1, 2, 3, 4, 5]);
  });

  it('sin hacer nada, todos suben el dominio; los parecidos comparten su peso', () => {
    const r = ejerciciosDeLaLeccion(actividades, []);
    expect(r.every((e) => e.estado === 'por-hacer' && e.subeDominio)).toBe(true);
    // 4 casillas de igual peso: 25 % cada una; el 1 y el 2 son la misma.
    expect(r.find((e) => e.id === 1)).toMatchObject({ pesoPct: 25, parecidos: 2 });
    expect(r.find((e) => e.id === 4)).toMatchObject({ pesoPct: 25, parecidos: 1 });
  });

  it('aprobado con nota completa ya no sube; su parecido sin hacer tampoco (cuenta el mejor de la casilla)', () => {
    const r = ejerciciosDeLaLeccion(actividades, [{ activityId: 1, score: 20 }]);
    expect(r.find((e) => e.id === 1)).toMatchObject({ estado: 'hecho', subeDominio: false, mejorPct: 100, intentosUsados: 1 });
    expect(r.find((e) => e.id === 2)).toMatchObject({ estado: 'cuenta-otro', subeDominio: false });
    expect(r.find((e) => e.id === 3)?.subeDominio).toBe(true);
  });

  it('aprobado sin la nota completa todavía puede subir si le quedan intentos', () => {
    const r = ejerciciosDeLaLeccion([act(3, QuestionType.FILL_CODE, Difficulty.BASICO)], [{ activityId: 3, score: 14 }]);
    expect(r[0]).toMatchObject({ estado: 'hecho', mejorPct: 70, subeDominio: true });
  });

  it('intentado sin aprobar: en curso; sin intentos: ya no sube', () => {
    expect(ejerciciosDeLaLeccion([act(4, QuestionType.CODING, Difficulty.BASICO)], [{ activityId: 4, score: 0 }])[0]).toMatchObject({ estado: 'en-curso', subeDominio: true });
    const agotado = ejerciciosDeLaLeccion([act(4, QuestionType.CODING, Difficulty.BASICO)], [0, 0, 0].map((score) => ({ activityId: 4, score })));
    expect(agotado[0]).toMatchObject({ estado: 'sin-intentos', subeDominio: false, intentosUsados: 3 });
  });

  it('sin límite de intentos (0) nunca se agota', () => {
    const r = ejerciciosDeLaLeccion([act(4, QuestionType.CODING, Difficulty.BASICO, { attemptsAllowed: 0 })], Array.from({ length: 9 }, () => ({ activityId: 4, score: 0 })));
    expect(r[0]).toMatchObject({ estado: 'en-curso', subeDominio: true, intentosPermitidos: 0 });
  });
});
