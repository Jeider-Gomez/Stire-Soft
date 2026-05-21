import { MatchingEvaluator } from '../matching.evaluator';

describe('MatchingEvaluator', () => {
  let evaluator: MatchingEvaluator;

  beforeEach(() => {
    evaluator = new MatchingEvaluator();
  });

  const config = {
    pairs: {
      left_1: 'right_a',
      left_2: 'right_b',
      left_3: 'right_c',
    },
  };

  // ─── Todos correctos ───────────────────────────────────────────────────────

  it('devuelve isCorrect:true y score=maxPoints cuando todos los pares son correctos', () => {
    const result = evaluator.evaluate(
      { pairs: { left_1: 'right_a', left_2: 'right_b', left_3: 'right_c' } },
      config,
      30,
    );
    expect(result.isCorrect).toBe(true);
    expect(result.score).toBe(30);
    expect(result.feedback).toContain('correctas');
  });

  // ─── Parciales ────────────────────────────────────────────────────────────

  it('devuelve score proporcional con 2 de 3 pares correctos', () => {
    const result = evaluator.evaluate(
      { pairs: { left_1: 'right_a', left_2: 'right_b', left_3: 'WRONG' } },
      config,
      30,
    );
    expect(result.isCorrect).toBe(false);
    expect(result.score).toBe(20); // 2/3 * 30
    expect(result.feedback).toContain('2 de 3');
  });

  it('devuelve score:0 cuando ningún par es correcto', () => {
    const result = evaluator.evaluate(
      { pairs: { left_1: 'WRONG', left_2: 'WRONG', left_3: 'WRONG' } },
      config,
      30,
    );
    expect(result.score).toBe(0);
    expect(result.isCorrect).toBe(false);
  });

  // ─── Pares faltantes en respuesta del estudiante ──────────────────────────

  it('cuenta como incorrecto el par que no fue respondido', () => {
    const result = evaluator.evaluate(
      { pairs: { left_1: 'right_a' } }, // faltan left_2 y left_3
      config,
      30,
    );
    expect(result.score).toBe(10); // 1/3 * 30
    expect(result.isCorrect).toBe(false);
  });

  // ─── Guards ────────────────────────────────────────────────────────────────

  it('devuelve score:0 cuando studentAnswer es null', () => {
    const result = evaluator.evaluate(null, config, 30);
    expect(result.isCorrect).toBe(false);
    expect(result.score).toBe(0);
  });

  it('devuelve score:0 cuando pairs está ausente en studentAnswer', () => {
    const result = evaluator.evaluate({}, config, 30);
    expect(result.isCorrect).toBe(false);
    expect(result.score).toBe(0);
  });
});
