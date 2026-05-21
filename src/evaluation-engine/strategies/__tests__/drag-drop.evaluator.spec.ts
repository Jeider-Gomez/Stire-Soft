import { DragDropEvaluator } from '../drag-drop.evaluator';

describe('DragDropEvaluator', () => {
  let evaluator: DragDropEvaluator;

  beforeEach(() => {
    evaluator = new DragDropEvaluator();
  });

  const config = {
    mappings: {
      item_1: 'zone_a',
      item_2: 'zone_b',
      item_3: 'zone_c',
    },
  };

  // ─── Respuestas correctas ──────────────────────────────────────────────────

  it('devuelve isCorrect:true y score=maxPoints cuando todos los mappings son correctos', () => {
    const result = evaluator.evaluate(
      { mappings: { item_1: 'zone_a', item_2: 'zone_b', item_3: 'zone_c' } },
      config,
      30,
    );
    expect(result.isCorrect).toBe(true);
    expect(result.score).toBe(30);
  });

  // ─── Respuestas parciales ──────────────────────────────────────────────────

  it('devuelve score proporcional con 1 de 3 mappings correctos', () => {
    const result = evaluator.evaluate(
      { mappings: { item_1: 'zone_a', item_2: 'WRONG', item_3: 'WRONG' } },
      config,
      30,
    );
    expect(result.isCorrect).toBe(false);
    expect(result.score).toBe(10); // 1/3 * 30
    expect(result.feedback).toContain('1 de 3');
  });

  it('devuelve score:0 cuando todos los mappings son incorrectos', () => {
    const result = evaluator.evaluate(
      { mappings: { item_1: 'WRONG', item_2: 'WRONG', item_3: 'WRONG' } },
      config,
      30,
    );
    expect(result.score).toBe(0);
    expect(result.isCorrect).toBe(false);
  });

  // ─── Config sin mappings ───────────────────────────────────────────────────

  it('devuelve isCorrect:true cuando la config no tiene mappings (caso vacío)', () => {
    const emptyConfig = { mappings: {} };
    const result = evaluator.evaluate({ mappings: {} }, emptyConfig, 10);
    expect(result.isCorrect).toBe(true);
    expect(result.score).toBe(10);
  });

  // ─── Guards ────────────────────────────────────────────────────────────────

  it('devuelve score:0 cuando studentAnswer es null', () => {
    const result = evaluator.evaluate(null, config, 30);
    expect(result.isCorrect).toBe(false);
    expect(result.score).toBe(0);
  });

  it('devuelve score:0 cuando mappings está ausente en studentAnswer', () => {
    const result = evaluator.evaluate({}, config, 30);
    expect(result.isCorrect).toBe(false);
    expect(result.score).toBe(0);
  });
});
