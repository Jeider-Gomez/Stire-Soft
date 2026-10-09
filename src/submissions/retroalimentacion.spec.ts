import { QuestionType } from '../common/enums/question-type.enum';
import { retroalimentacionCerrada } from './retroalimentacion';

const mcq = (id: number, config: Record<string, unknown>) => ({
  id,
  type: QuestionType.MCQ,
  config,
});

describe('retroalimentación de opción múltiple (JEIDER-S08-11)', () => {
  const preguntas = [
    mcq(1, {
      explanation: 'La A de REDA es «Abierto».',
      repasar: 'Repasa qué hace abierto a un recurso.',
    }),
    mcq(2, { explanation: '  ' }),
    { id: 3, type: QuestionType.CODING, config: {} },
  ];

  it('al acertar: por qué es correcta, para afianzarla', () => {
    expect(
      retroalimentacionCerrada(preguntas, [{ questionId: 1, isCorrect: true }]),
    ).toEqual([
      {
        preguntaId: 1,
        correcta: true,
        explicacion: 'La A de REDA es «Abierto».',
        repasar: null,
      },
    ]);
  });

  it('al fallar: qué repasar, nunca la explicación (daría la respuesta)', () => {
    const [r] = retroalimentacionCerrada(preguntas, [
      { questionId: 1, isCorrect: false },
    ]);
    expect(r).toEqual({
      preguntaId: 1,
      correcta: false,
      explicacion: null,
      repasar: 'Repasa qué hace abierto a un recurso.',
    });
  });

  it('sin texto del docente, null; otros tipos y respuestas pendientes no traen nada', () => {
    expect(
      retroalimentacionCerrada(preguntas, [
        { questionId: 2, isCorrect: false },
        { questionId: 3, isCorrect: false },
        { questionId: 1, isCorrect: null },
        { questionId: 99, isCorrect: true },
      ]),
    ).toEqual([
      { preguntaId: 2, correcta: false, explicacion: null, repasar: null },
    ]);
  });
});
