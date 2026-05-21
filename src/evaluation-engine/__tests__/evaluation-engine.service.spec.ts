import { BadRequestException } from '@nestjs/common';
import { EvaluationEngineService } from '../evaluation-engine.service';
import { QuestionType } from '../../common/enums/question-type.enum';

describe('EvaluationEngineService', () => {
  let service: EvaluationEngineService;

  beforeEach(() => {
    service = new EvaluationEngineService();
  });

  // ─── Delegación correcta por tipo ─────────────────────────────────────────

  describe('Delegación de estrategias', () => {
    it('MCQ — respuesta correcta single-choice → isCorrect:true', () => {
      const result = service.evaluateAnswer(
        QuestionType.MCQ,
        { selectedId: 'opt_a' },
        { isMultipleChoice: false, correctAnswerId: 'opt_a' },
        10,
      );
      expect(result.isCorrect).toBe(true);
      expect(result.score).toBe(10);
    });

    it('FILL_CODE — todos los blanks correctos → isCorrect:true', () => {
      const result = service.evaluateAnswer(
        QuestionType.FILL_CODE,
        { blanks: { __X__: '0' } },
        { blanks: [{ id: '__X__', answer: '0', regexMode: false }] },
        10,
      );
      expect(result.isCorrect).toBe(true);
    });

    it('DRAG_DROP — todos los mappings correctos → isCorrect:true', () => {
      const result = service.evaluateAnswer(
        QuestionType.DRAG_DROP,
        { mappings: { item_1: 'zone_a' } },
        { mappings: { item_1: 'zone_a' } },
        10,
      );
      expect(result.isCorrect).toBe(true);
    });

    it('ORDERING — orden correcto → isCorrect:true', () => {
      const result = service.evaluateAnswer(
        QuestionType.ORDERING,
        { order: ['a', 'b'] },
        { correctOrder: ['a', 'b'] },
        10,
      );
      expect(result.isCorrect).toBe(true);
    });

    it('MATCHING — todos los pares correctos → isCorrect:true', () => {
      const result = service.evaluateAnswer(
        QuestionType.MATCHING,
        { pairs: { left_1: 'right_a' } },
        { pairs: { left_1: 'right_a' } },
        10,
      );
      expect(result.isCorrect).toBe(true);
    });

    it('CODING — retorna needsAsyncJudge:true (evaluación diferida)', () => {
      const result = service.evaluateAnswer(
        QuestionType.CODING,
        { code: 'console.log("hola")' },
        { language: 'javascript', testCases: [] },
        10,
      );
      expect(result.needsAsyncJudge).toBe(true);
      expect(result.isCorrect).toBe(false); // pendiente de evaluación
    });
  });

  // ─── Tipo desconocido ─────────────────────────────────────────────────────

  describe('Tipo de pregunta no registrado', () => {
    it('lanza BadRequestException para un tipo no implementado', () => {
      expect(() =>
        service.evaluateAnswer(
          'UNKNOWN_TYPE' as QuestionType,
          {},
          {},
          10,
        ),
      ).toThrow(BadRequestException);
    });

    it('el mensaje del error menciona el tipo desconocido', () => {
      expect(() =>
        service.evaluateAnswer('INVALID' as QuestionType, {}, {}, 10),
      ).toThrow(/INVALID/);
    });
  });
});
