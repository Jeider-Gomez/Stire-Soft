import { OrderingEvaluator } from '../ordering.evaluator';

describe('OrderingEvaluator', () => {
  let evaluator: OrderingEvaluator;

  beforeEach(() => {
    evaluator = new OrderingEvaluator();
  });

  const config = {
    correctOrder: ['step_1', 'step_2', 'step_3', 'step_4'],
  };

  // ─── Orden perfecto ────────────────────────────────────────────────────────

  it('devuelve isCorrect:true y score=maxPoints con el orden exacto', () => {
    const result = evaluator.evaluate(
      { order: ['step_1', 'step_2', 'step_3', 'step_4'] },
      config,
      40,
    );
    expect(result.isCorrect).toBe(true);
    expect(result.score).toBe(40);
    expect(result.feedback).toContain('correcto');
  });

  // ─── Orden incorrecto (todo-o-nada) ───────────────────────────────────────

  it('devuelve score:0 cuando cualquier elemento está fuera de lugar', () => {
    const result = evaluator.evaluate(
      { order: ['step_1', 'step_3', 'step_2', 'step_4'] }, // step_2 y step_3 invertidos
      config,
      40,
    );
    expect(result.isCorrect).toBe(false);
    expect(result.score).toBe(0);
    expect(result.feedback).toContain('no es correcto');
  });

  it('devuelve score:0 cuando el orden está completamente invertido', () => {
    const result = evaluator.evaluate(
      { order: ['step_4', 'step_3', 'step_2', 'step_1'] },
      config,
      40,
    );
    expect(result.score).toBe(0);
    expect(result.isCorrect).toBe(false);
  });

  // ─── Longitud diferente ───────────────────────────────────────────────────

  it('devuelve isCorrect:false cuando la respuesta tiene menos elementos que el esperado', () => {
    const result = evaluator.evaluate(
      { order: ['step_1', 'step_2'] }, // faltan 2 elementos
      config,
      40,
    );
    expect(result.isCorrect).toBe(false);
    expect(result.score).toBe(0);
  });

  it('devuelve isCorrect:false cuando la respuesta tiene más elementos que el esperado', () => {
    const result = evaluator.evaluate(
      { order: ['step_1', 'step_2', 'step_3', 'step_4', 'step_5'] },
      config,
      40,
    );
    expect(result.isCorrect).toBe(false);
  });

  // ─── Guards ────────────────────────────────────────────────────────────────

  it('devuelve score:0 cuando studentAnswer es null', () => {
    const result = evaluator.evaluate(null, config, 40);
    expect(result.isCorrect).toBe(false);
    expect(result.score).toBe(0);
    expect(result.feedback).toContain('inválido');
  });

  it('devuelve score:0 cuando order no es un array', () => {
    const result = evaluator.evaluate({ order: 'step_1,step_2' }, config, 40);
    expect(result.isCorrect).toBe(false);
    expect(result.score).toBe(0);
  });
});
