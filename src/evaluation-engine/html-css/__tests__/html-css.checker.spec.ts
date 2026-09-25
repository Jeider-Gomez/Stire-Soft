import {
  evaluateRules,
  HTML_CSS_MAX_CHARS,
  inputSizeError,
  isValidSelector,
  runPublicHtmlCssRules,
} from '../html-css.checker';
import { HtmlCssCheck, HtmlCssConfig, HtmlCssRule } from '../../../activity-questions/interfaces/question-configs.interface';

function rule(id: string, check: HtmlCssCheck, extra: Partial<HtmlCssRule> = {}): HtmlCssRule {
  return { id, label: id, isPublic: true, weight: 10, check, ...extra };
}

function passes(html: string, css: string, check: HtmlCssCheck): boolean {
  return evaluateRules(html, css, [rule('r', check)])[0].passed;
}

describe('html-css.checker — reglas', () => {
  describe('element_exists / element_count', () => {
    const html = '<ul><li>a</li><li>b</li><li>c</li></ul>';

    it('element_exists: cumple con al menos uno y respeta min', () => {
      expect(passes(html, '', { kind: 'element_exists', selector: 'ul' })).toBe(true);
      expect(passes(html, '', { kind: 'element_exists', selector: 'li', min: 3 })).toBe(true);
      expect(passes(html, '', { kind: 'element_exists', selector: 'li', min: 4 })).toBe(false);
      expect(passes(html, '', { kind: 'element_exists', selector: 'table' })).toBe(false);
    });

    it('element_count: equals, min y max', () => {
      expect(passes(html, '', { kind: 'element_count', selector: 'li', equals: 3 })).toBe(true);
      expect(passes(html, '', { kind: 'element_count', selector: 'li', equals: 2 })).toBe(false);
      expect(passes(html, '', { kind: 'element_count', selector: 'li', min: 2, max: 3 })).toBe(true);
      expect(passes(html, '', { kind: 'element_count', selector: 'li', max: 2 })).toBe(false);
      expect(passes(html, '', { kind: 'element_count', selector: 'table', equals: 0 })).toBe(true);
    });

    it('el mensaje de fallo no revela nada de más', () => {
      const out = evaluateRules(html, '', [rule('r', { kind: 'element_exists', selector: 'table' })])[0];
      expect(out.passed).toBe(false);
      expect(out.detail).toBe('No se encontró ningún elemento.');
    });
  });

  describe('text', () => {
    const html = '<h1>  Hola \n   Mundo </h1><p>Bienvenido a STIRE</p>';

    it('contains ignora mayúsculas y espacios repetidos por defecto', () => {
      expect(passes(html, '', { kind: 'text', selector: 'h1', mode: 'contains', value: 'hola mundo' })).toBe(true);
      expect(passes(html, '', { kind: 'text', selector: 'p', mode: 'contains', value: 'stire' })).toBe(true);
    });

    it('equals compara el texto completo normalizado', () => {
      expect(passes(html, '', { kind: 'text', selector: 'h1', mode: 'equals', value: 'Hola Mundo' })).toBe(true);
      expect(passes(html, '', { kind: 'text', selector: 'h1', mode: 'equals', value: 'Hola' })).toBe(false);
    });

    it('caseSensitive distingue mayúsculas', () => {
      expect(passes(html, '', { kind: 'text', selector: 'h1', mode: 'contains', value: 'hola', caseSensitive: true })).toBe(false);
      expect(passes(html, '', { kind: 'text', selector: 'h1', mode: 'contains', value: 'Hola', caseSensitive: true })).toBe(true);
    });

    it('falla si no hay ningún elemento que coincida con el selector', () => {
      expect(passes(html, '', { kind: 'text', selector: 'h2', mode: 'contains', value: 'Hola' })).toBe(false);
    });
  });

  describe('attribute', () => {
    const html = '<a href="https://unicor.edu.co" target="_blank">Unicor</a><img src="a.png">';

    it('exists / equals / contains', () => {
      expect(passes(html, '', { kind: 'attribute', selector: 'a', name: 'target', mode: 'exists' })).toBe(true);
      expect(passes(html, '', { kind: 'attribute', selector: 'img', name: 'alt', mode: 'exists' })).toBe(false);
      expect(passes(html, '', { kind: 'attribute', selector: 'a', name: 'target', mode: 'equals', value: '_blank' })).toBe(true);
      expect(passes(html, '', { kind: 'attribute', selector: 'a', name: 'href', mode: 'contains', value: 'unicor' })).toBe(true);
      expect(passes(html, '', { kind: 'attribute', selector: 'a', name: 'href', mode: 'equals', value: 'unicor' })).toBe(false);
    });
  });

  describe('css_property (valor calculado por jsdom)', () => {
    it('cumple con lo declarado en la hoja de estilo del estudiante', () => {
      expect(passes('<div class="tarjeta"></div>', '.tarjeta{display:flex}', { kind: 'css_property', selector: '.tarjeta', property: 'display', oneOf: ['flex'] })).toBe(true);
      expect(passes('<div class="tarjeta"></div>', '.tarjeta{display:block}', { kind: 'css_property', selector: '.tarjeta', property: 'display', oneOf: ['flex'] })).toBe(false);
    });

    // OJO: jest.config.js sustituye @asamuzakjp/css-color por un stub inerte (es ESM puro y Jest no puede cargarlo), así que
    // aquí solo se prueban colores por NOMBRE. La equivalencia #F00 = red = rgb(255,0,0) se verifica en Node real con
    // docs/testing/html-css-color-check.cjs (ver el CHANGELOG de la Fase 25).
    it('un color por nombre se compara con su valor calculado', () => {
      const html = '<h1>t</h1>';
      expect(passes(html, 'h1{color:red}', { kind: 'css_property', selector: 'h1', property: 'color', oneOf: ['red'] })).toBe(true);
      expect(passes(html, 'h1{color:blue}', { kind: 'css_property', selector: 'h1', property: 'color', oneOf: ['red', 'green'] })).toBe(false);
      expect(passes(html, 'h1{color:blue}', { kind: 'css_property', selector: 'h1', property: 'color', oneOf: ['red', 'blue'] })).toBe(true);
    });

    it('aplica la especificidad (un id gana a una clase, sin importar el orden)', () => {
      const html = '<div id="a" class="a"></div>';
      const css = '#a{color:blue} .a{color:red}';
      expect(passes(html, css, { kind: 'css_property', selector: '#a', property: 'color', oneOf: ['blue'] })).toBe(true);
      expect(passes(html, css, { kind: 'css_property', selector: '#a', property: 'color', oneOf: ['red'] })).toBe(false);
    });

    it('considera la herencia de propiedades heredables', () => {
      expect(passes('<div class="x"><p>t</p></div>', '.x{color:green}', { kind: 'css_property', selector: 'p', property: 'color', oneOf: ['green'] })).toBe(true);
    });

    it('NO evalúa @media (límite documentado del ADR 13)', () => {
      const css = '.c{display:block} @media (max-width:600px){.c{display:flex}}';
      expect(passes('<div class="c"></div>', css, { kind: 'css_property', selector: '.c', property: 'display', oneOf: ['flex'] })).toBe(false);
    });

    it('una propiedad sin definir falla con un mensaje claro', () => {
      const out = evaluateRules('<div class="c"></div>', '', [rule('r', { kind: 'css_property', selector: '.c', property: 'gap', oneOf: ['10px'] })])[0];
      expect(out.passed).toBe(false);
      expect(out.detail).toBe('La propiedad no está definida.');
    });

    it('cuenta también el <style> que el estudiante escribe dentro de su HTML', () => {
      expect(passes('<style>p{font-weight:bold}</style><p>x</p>', '', { kind: 'css_property', selector: 'p', property: 'font-weight', oneOf: ['bold', '700'] })).toBe(true);
    });
  });

  describe('a11y', () => {
    it('img_alt: todas las imágenes deben tener alt (vacío cuenta)', () => {
      expect(passes('<img src="a" alt="x"><img src="b" alt="">', '', { kind: 'a11y', check: 'img_alt' })).toBe(true);
      expect(passes('<img src="a" alt="x"><img src="b">', '', { kind: 'a11y', check: 'img_alt' })).toBe(false);
    });

    it('form_labels: for/id, etiqueta envolvente y aria-label; se ignoran hidden y botones', () => {
      const ok = '<label for="n">Nombre</label><input id="n"><label>Edad <input></label><input aria-label="Buscar"><input type="hidden"><input type="submit">';
      expect(passes(ok, '', { kind: 'a11y', check: 'form_labels' })).toBe(true);
      expect(passes('<input id="n">', '', { kind: 'a11y', check: 'form_labels' })).toBe(false);
      expect(passes('<label for="otro">x</label><input id="n">', '', { kind: 'a11y', check: 'form_labels' })).toBe(false);
    });

    it('html_lang y document_title existen solo en un documento completo', () => {
      const full = '<!doctype html><html lang="es"><head><title>Mi página</title></head><body><h1>a</h1></body></html>';
      expect(passes(full, '', { kind: 'a11y', check: 'html_lang' })).toBe(true);
      expect(passes(full, '', { kind: 'a11y', check: 'document_title' })).toBe(true);
      expect(passes('<h1>a</h1>', '', { kind: 'a11y', check: 'html_lang' })).toBe(false);
      expect(passes('<h1>a</h1>', '', { kind: 'a11y', check: 'document_title' })).toBe(false);
    });

    it('single_h1: exactamente uno', () => {
      expect(passes('<h1>a</h1><h2>b</h2>', '', { kind: 'a11y', check: 'single_h1' })).toBe(true);
      expect(passes('<h1>a</h1><h1>b</h1>', '', { kind: 'a11y', check: 'single_h1' })).toBe(false);
      expect(passes('<h2>b</h2>', '', { kind: 'a11y', check: 'single_h1' })).toBe(false);
    });
  });

  describe('seguridad — nunca se ejecuta nada del estudiante', () => {
    it('un <script> no se ejecuta (no modifica el documento)', () => {
      const html = '<p id="a"></p><script>document.getElementById("a").textContent="EJECUTADO"</script>';
      expect(passes(html, '', { kind: 'text', selector: '#a', mode: 'contains', value: 'EJECUTADO' })).toBe(false);
      // el elemento <script> sí existe como marcado: se puede exigir o prohibir por regla
      expect(passes(html, '', { kind: 'element_exists', selector: 'script' })).toBe(true);
    });

    it('un atributo on… (onerror, onload) no se ejecuta', () => {
      const html = '<img src="x" onerror="document.body.setAttribute(\'data-pwned\',\'1\')"><body></body>';
      expect(passes(html, '', { kind: 'attribute', selector: 'body', name: 'data-pwned', mode: 'exists' })).toBe(false);
    });

    it('no carga recursos externos: una hoja de estilo remota no cuelga la evaluación', () => {
      const started = Date.now();
      const out = evaluateRules('<link rel="stylesheet" href="http://10.255.255.1/x.css"><img src="http://10.255.255.1/a.png"><h1>a</h1>', '', [
        rule('r', { kind: 'element_exists', selector: 'h1' }),
      ]);
      expect(out[0].passed).toBe(true);
      expect(Date.now() - started).toBeLessThan(2000);
    });

    it('una regla que no se puede evaluar cuenta como no cumplida, sin lanzar', () => {
      const out = evaluateRules('<h1>a</h1>', '', [
        rule('mala', { kind: 'element_exists', selector: '>>>' }),
        rule('buena', { kind: 'element_exists', selector: 'h1' }),
      ]);
      expect(out[0]).toEqual({ id: 'mala', passed: false, detail: 'No se pudo evaluar esta regla.' });
      expect(out[1].passed).toBe(true);
    });

    it('HTML mal formado no rompe la evaluación', () => {
      expect(passes('<div><p>sin cerrar<h1>t', '', { kind: 'element_exists', selector: 'h1' })).toBe(true);
    });
  });

  describe('utilidades', () => {
    it('inputSizeError: rechaza tipos que no son texto y textos por encima del tope', () => {
      expect(inputSizeError('<p>x</p>', '')).toBeNull();
      expect(inputSizeError('a'.repeat(HTML_CSS_MAX_CHARS), 'b'.repeat(HTML_CSS_MAX_CHARS))).toBeNull();
      expect(inputSizeError('a'.repeat(HTML_CSS_MAX_CHARS + 1), '')).toContain('50000');
      expect(inputSizeError('', 'b'.repeat(HTML_CSS_MAX_CHARS + 1))).toContain('50000');
      expect(inputSizeError(123, '')).toBe('El HTML y el CSS deben ser texto.');
    });

    it('isValidSelector', () => {
      for (const ok of ['h1', '.a > p', 'a[href^="http"]', 'li:nth-child(2)', ':is(h1, h2)', 'div:not(.a)']) expect(isValidSelector(ok)).toBe(true);
      for (const bad of ['', 'div >', '>>>', '[data-x=]']) expect(isValidSelector(bad)).toBe(false);
    });
  });
});

describe('html-css.checker — runPublicHtmlCssRules («Probar» sin gastar intento)', () => {
  const config: HtmlCssConfig = {
    starterHtml: '',
    starterCss: '',
    modelSolution: { html: '<h1>Hola</h1>', css: '' },
    rules: [
      rule('titulo', { kind: 'text', selector: 'h1', mode: 'contains', value: 'Hola' }, { label: 'Hay un h1 con «Hola»', weight: 10 }),
      rule('lista', { kind: 'element_exists', selector: 'ul' }, { label: 'Hay una lista', weight: 30 }),
      rule('oculta-secreta', { kind: 'element_exists', selector: 'footer' }, { label: 'ETIQUETA-OCULTA', isPublic: false, weight: 60 }),
    ],
  };

  it('devuelve solo las reglas públicas, con sus pesos, y no menciona las ocultas', () => {
    const out = runPublicHtmlCssRules('<h1>Hola</h1>', '', config);
    expect(out.results).toEqual([
      { id: 'titulo', label: 'Hay un h1 con «Hola»', passed: true },
      { id: 'lista', label: 'Hay una lista', passed: false, detail: 'No se encontró ningún elemento.' },
    ]);
    expect(out.allPassed).toBe(false);
    expect(out.passedWeight).toBe(10);
    expect(out.totalWeight).toBe(40); // las ocultas no suman
    expect(JSON.stringify(out)).not.toContain('oculta');
    expect(JSON.stringify(out)).not.toContain('ETIQUETA-OCULTA');
  });

  it('allPassed cuando cumple todas las públicas, aunque falle una oculta', () => {
    const out = runPublicHtmlCssRules('<h1>Hola</h1><ul></ul>', '', config);
    expect(out.allPassed).toBe(true);
    expect(out.passedWeight).toBe(40);
  });
});
