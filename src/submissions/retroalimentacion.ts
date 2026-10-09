import { QuestionType } from '../common/enums/question-type.enum';

// JEIDER-S08-11 (09/10): «al fallar en opción múltiple, quiero saber por qué». El docente escribía una explicación y el
// formulario le prometía que «se mostrará tras calificar», pero el servidor nunca la devolvía. Decisión de Jeider: no dar
// la respuesta al fallar (hay ejercicios parecidos para volver a intentarlo), sino decir qué repasar; la explicación de
// por qué es correcta sale al acertar, para afianzarla (BT-41).

export interface RetroalimentacionPregunta {
  preguntaId: number;
  correcta: boolean;
  /** Por qué la respuesta es correcta. Solo si acertó: al fallar, daría la respuesta. */
  explicacion: string | null;
  /** Qué repasar, sin dar la respuesta (lo escribe el docente). Solo si falló. */
  repasar: string | null;
}

interface PreguntaParaRetro {
  id: number;
  type: QuestionType;
  config?: Record<string, unknown> | null;
}

const texto = (v: unknown): string | null =>
  typeof v === 'string' && v.trim() ? v.trim() : null;

/** Por ahora, las preguntas de opción múltiple: las demás ya dicen qué falló (casos de prueba, posiciones). */
export function retroalimentacionCerrada(
  preguntas: PreguntaParaRetro[],
  respuestas: Array<{ questionId: number; isCorrect: boolean | null }>,
): RetroalimentacionPregunta[] {
  return respuestas.flatMap((r) => {
    const p = preguntas.find((q) => q.id === r.questionId);
    if (!p || p.type !== QuestionType.MCQ || r.isCorrect === null) return [];
    const correcta = r.isCorrect === true;
    return [
      {
        preguntaId: p.id,
        correcta,
        explicacion: correcta ? texto(p.config?.explanation) : null,
        repasar: correcta ? null : texto(p.config?.repasar),
      },
    ];
  });
}
