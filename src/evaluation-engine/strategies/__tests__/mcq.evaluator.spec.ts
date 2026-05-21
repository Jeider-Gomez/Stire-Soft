import { McqEvaluator } from '../mcq.evaluator';

describe('McqEvaluator', () => {
  let evaluator: McqEvaluator;

  beforeEach(() => {
    evaluator = new McqEvaluator();
  });

  // ─── Single-choice ─────────────────────────────────────────────────────────

  describe('Single-choice', () => {
    const config = {
      isMultipleChoice: false,
      correctAnswerId: 'opt_b',
      explanation: 'La respuesta es B.',
    };

    it('devuelve isCorrect:true y score=maxPoints cuando la opción es correcta', () => {
      const result = evaluator.evaluate({ selectedId: 'opt_b' }, config, 10);
      expect(result.isCorrect).toBe(true);
      expect(result.score).toBe(10);
      expect(result.feedback).toContain('Correcto');
    });

    it('devuelve isCorrect:false y score=0 cuando la opción es incorrecta', () => {
      const result = evaluator.evaluate({ selectedId: 'opt_a' }, config, 10);
      expect(result.isCorrect).toBe(false);
      expect(result.score).toBe(0);
      expect(result.feedback).toBe('La respuesta es B.');
    });

    it('usa mensaje genérico si no hay explanation en config', () => {
      const noExp = { isMultipleChoice: false, correctAnswerId: 'opt_c' };
      const result = evaluator.evaluate({ selectedId: 'opt_a' }, noExp, 10);
      expect(result.feedback).toBe('Respuesta incorrecta.');
    });
  });

  // ─── Multi-choice ───────────────────────────────────────────────────────────

  describe('Multi-choice', () => {
    const config = {
      isMultipleChoice: true,
      correctAnswerId: ['opt_a', 'opt_c'],
    };

    it('devuelve isCorrect:true cuando todos los IDs seleccionados son correctos', () => {
      const result = evaluator.evaluate({ selectedId: ['opt_a', 'opt_c'] }, config, 20);
      expect(result.isCorrect).toBe(true);
      expect(result.score).toBe(20);
    });

    it('devuelve isCorrect:false cuando solo parte de los IDs son correctos', () => {
      const result = evaluator.evaluate({ selectedId: ['opt_a'] }, config, 20);
      expect(result.isCorrect).toBe(false);
      expect(result.score).toBe(0);
    });

    it('devuelve isCorrect:false cuando el estudiante selecciona IDs extras', () => {
      const result = evaluator.evaluate({ selectedId: ['opt_a', 'opt_b', 'opt_c'] }, config, 20);
      expect(result.isCorrect).toBe(false);
    });

    it('acepta correctAnswerId como string único y studentAnswer como array', () => {
      const singleCorrect = { isMultipleChoice: true, correctAnswerId: 'opt_x' };
      const result = evaluator.evaluate({ selectedId: ['opt_x'] }, singleCorrect, 10);
      expect(result.isCorrect).toBe(true);
    });
  });

  // ─── Guards (respuestas nulas/vacías) ──────────────────────────────────────

  describe('Guards de entrada', () => {
    const config = { isMultipleChoice: false, correctAnswerId: 'opt_a' };

    it('devuelve score:0 cuando studentAnswer es null', () => {
      const result = evaluator.evaluate(null, config, 10);
      expect(result.isCorrect).toBe(false);
      expect(result.score).toBe(0);
    });

    it('devuelve score:0 cuando selectedId está ausente', () => {
      const result = evaluator.evaluate({}, config, 10);
      expect(result.score).toBe(0);
    });
  });
});
