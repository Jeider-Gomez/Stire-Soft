import { FillCodeEvaluator } from '../fill-code.evaluator';

describe('FillCodeEvaluator', () => {
  let evaluator: FillCodeEvaluator;

  beforeEach(() => {
    evaluator = new FillCodeEvaluator();
  });

  // ─── Exact match ───────────────────────────────────────────────────────────

  describe('Exact match (regexMode: false)', () => {
    const config = {
      template: 'for (let i = __A__; i < __B__; i++) {}',
      blanks: [
        { id: '__A__', answer: '0', regexMode: false },
        { id: '__B__', answer: '10', regexMode: false },
      ],
    };

    it('devuelve isCorrect:true y score=maxPoints cuando todos los blanks son correctos', () => {
      const result = evaluator.evaluate({ blanks: { __A__: '0', __B__: '10' } }, config, 20);
      expect(result.isCorrect).toBe(true);
      expect(result.score).toBe(20);
      expect(result.feedback).toContain('correcto');
    });

    it('devuelve score proporcional cuando solo 1 de 2 blanks es correcto', () => {
      const result = evaluator.evaluate({ blanks: { __A__: '0', __B__: '99' } }, config, 20);
      expect(result.isCorrect).toBe(false);
      expect(result.score).toBe(10); // 1/2 * 20
      expect(result.feedback).toContain('1 de 2');
    });

    it('devuelve score:0 cuando ningún blank es correcto', () => {
      const result = evaluator.evaluate({ blanks: { __A__: 'x', __B__: 'y' } }, config, 20);
      expect(result.score).toBe(0);
    });

    it('ignora espacios en blanco al comparar (trim)', () => {
      const result = evaluator.evaluate({ blanks: { __A__: '  0  ', __B__: '10' } }, config, 20);
      expect(result.isCorrect).toBe(true);
    });
  });

  // ─── Regex match ───────────────────────────────────────────────────────────

  describe('Regex match (regexMode: true)', () => {
    it('evalúa correctamente un patrón regex válido que coincide', () => {
      const config = {
        template: '__X__',
        blanks: [{ id: '__X__', answer: '10|n', regexMode: true }],
      };
      const result = evaluator.evaluate({ blanks: { __X__: 'n' } }, config, 10);
      expect(result.isCorrect).toBe(true);
    });

    it('evalúa correctamente un patrón regex válido que NO coincide', () => {
      const config = {
        template: '__X__',
        blanks: [{ id: '__X__', answer: '10|n', regexMode: true }],
      };
      const result = evaluator.evaluate({ blanks: { __X__: 'foo' } }, config, 10);
      expect(result.isCorrect).toBe(false);
    });

    it('hace fallback a exact match si el regex es inválido', () => {
      const config = {
        template: '__X__',
        blanks: [{ id: '__X__', answer: '[invalid', regexMode: true }],
      };
      // '[invalid' no es regex válido; fallback: compara exacto
      const result = evaluator.evaluate({ blanks: { __X__: '[invalid' } }, config, 10);
      expect(result.isCorrect).toBe(true);
    });
  });

  // ─── Edge cases de config ──────────────────────────────────────────────────

  describe('Config sin blanks', () => {
    it('retorna isCorrect:true y score=maxPoints cuando no hay blanks definidos', () => {
      const config = { template: 'código estático', blanks: [] };
      const result = evaluator.evaluate({ blanks: {} }, config, 15);
      expect(result.isCorrect).toBe(true);
      expect(result.score).toBe(15);
    });
  });

  // ─── Guards ────────────────────────────────────────────────────────────────

  describe('Guards de entrada', () => {
    const config = {
      template: '__A__',
      blanks: [{ id: '__A__', answer: '0', regexMode: false }],
    };

    it('devuelve score:0 cuando studentAnswer es null', () => {
      const result = evaluator.evaluate(null, config, 10);
      expect(result.isCorrect).toBe(false);
      expect(result.score).toBe(0);
    });

    it('devuelve score:0 cuando blanks está ausente en studentAnswer', () => {
      const result = evaluator.evaluate({}, config, 10);
      expect(result.score).toBe(0);
    });
  });
});
