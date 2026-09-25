import { HtmlCssEvaluator } from '../html-css.evaluator';
import { HtmlCssConfig } from '../../../activity-questions/interfaces/question-configs.interface';

describe('HtmlCssEvaluator', () => {
  const evaluator = new HtmlCssEvaluator();

  const config: HtmlCssConfig = {
    starterHtml: '',
    starterCss: '',
    modelSolution: { html: '<h1>Hola</h1><ul><li>a</li></ul><img src="a" alt="x">', css: 'h1{color:red}' },
    rules: [
      { id: 'titulo', label: 'Hay un <h1> con «Hola»', isPublic: true, weight: 10, check: { kind: 'text', selector: 'h1', mode: 'contains', value: 'Hola' } },
      { id: 'lista', label: 'Hay una lista', isPublic: true, weight: 30, check: { kind: 'element_exists', selector: 'ul' } },
      { id: 'color', label: 'El título es rojo', isPublic: false, weight: 40, check: { kind: 'css_property', selector: 'h1', property: 'color', oneOf: ['red'] } },
      { id: 'alt', label: 'ETIQUETA-OCULTA-2', isPublic: false, weight: 20, check: { kind: 'a11y', check: 'img_alt' } },
    ],
  };

  it('cumple todo: nota máxima y feedback positivo', () => {
    const result = evaluator.evaluate({ html: config.modelSolution.html, css: config.modelSolution.css }, config, 20);
    expect(result).toEqual({ isCorrect: true, score: 20, feedback: '¡Cumpliste todas las reglas!' });
  });

  it('la nota es proporcional al PESO de las reglas cumplidas, no a su cantidad', () => {
    // Solo cumple «lista» (30 de 100): 30 % de 20 puntos = 6.
    const result = evaluator.evaluate({ html: '<ul><li>a</li></ul><img src="a">', css: '' }, config, 20);
    expect(result.isCorrect).toBe(false);
    expect(result.score).toBe(6);
  });

  it('redondea la nota a un entero', () => {
    // Cumple «titulo» (10) y «lista» (30) y «alt» (20) = 60 de 100 sobre 15 puntos = 9.
    const result = evaluator.evaluate({ html: '<h1>Hola</h1><ul><li>a</li></ul><img src="a" alt="x">', css: '' }, config, 15);
    expect(result.score).toBe(9);
    expect(Number.isInteger(result.score)).toBe(true);
  });

  it('el feedback lista las etiquetas de las reglas PÚBLICAS que fallaron y solo CUÁNTAS ocultas', () => {
    const result = evaluator.evaluate({ html: '<p>nada</p>', css: '' }, config, 20);
    expect(result.feedback).toContain('Cumpliste 1 de 4 reglas.'); // solo «alt» (sin imágenes) pasa
    expect(result.feedback).toContain('Revisa: • Hay un h1 con «Hola» • Hay una lista');
    expect(result.feedback).toContain('1 regla(s) oculta(s) no se cumplieron.');
    expect(result.feedback).not.toContain('ETIQUETA-OCULTA-2');
    expect(result.feedback).not.toContain('El título es rojo');
  });

  it('el feedback no lleva «<» ni «>» (el saneado PLAIN los volvería entidades)', () => {
    const result = evaluator.evaluate({ html: '<p>x</p>', css: '' }, config, 20);
    expect(result.feedback).not.toMatch(/[<>]/);
  });

  it('sin HTML: 0 puntos y mensaje', () => {
    for (const answer of [null, undefined, {}, { html: '' }, { html: '   ' }, { html: 42 }] as any[]) {
      expect(evaluator.evaluate(answer, config, 20)).toEqual({ isCorrect: false, score: 0, feedback: 'No se envió el HTML.' });
    }
  });

  it('el CSS es opcional', () => {
    const result = evaluator.evaluate({ html: '<h1>Hola</h1>' }, config, 20);
    expect(result.score).toBeGreaterThan(0);
  });

  it('rechaza entradas por encima del tope o que no son texto, con 0 puntos', () => {
    const big = evaluator.evaluate({ html: 'a'.repeat(50_001), css: '' }, config, 20);
    expect(big).toMatchObject({ isCorrect: false, score: 0 });
    expect(big.feedback).toContain('50000');
    const notText = evaluator.evaluate({ html: '<h1>Hola</h1>', css: 5 }, config, 20);
    expect(notText).toEqual({ isCorrect: false, score: 0, feedback: 'El HTML y el CSS deben ser texto.' });
  });

  it('un <script> del estudiante no cambia el resultado (no se ejecuta)', () => {
    const html = '<h1></h1><script>document.querySelector("h1").textContent="Hola"</script>';
    const result = evaluator.evaluate({ html, css: '' }, config, 20);
    expect(result.feedback).toContain('• Hay un h1 con «Hola»'); // «titulo» sigue sin cumplirse
  });
});
