import { validateHtmlCssConfig } from '../html-css.validator';

function valid(): Record<string, any> {
  return {
    starterHtml: '',
    starterCss: '',
    modelSolution: {
      html: '<h1>Hola</h1><ul><li>a</li></ul><img src="a.png" alt="x">',
      css: 'h1{color:red}',
    },
    rules: [
      { id: 'titulo', label: 'Hay un h1 con «Hola»', isPublic: true, weight: 10, check: { kind: 'text', selector: 'h1', mode: 'contains', value: 'Hola' } },
      { id: 'color', label: 'El h1 es rojo', isPublic: true, weight: 10, check: { kind: 'css_property', selector: 'h1', property: 'color', oneOf: ['red', '#ff0000'] } },
      { id: 'alt', label: 'Las imágenes tienen alt', isPublic: false, weight: 20, check: { kind: 'a11y', check: 'img_alt' } },
    ],
  };
}

function withRule(patch: Record<string, any>): Record<string, any> {
  const config = valid();
  config.rules.push({ id: 'extra', label: 'Extra', isPublic: true, weight: 5, check: { kind: 'element_exists', selector: 'h1' }, ...patch });
  return config;
}

describe('validateHtmlCssConfig', () => {
  it('acepta una configuración correcta', () => {
    expect(validateHtmlCssConfig(valid())).toEqual([]);
  });

  it('rechaza lo que no es un objeto', () => {
    expect(validateHtmlCssConfig(null)[0]).toContain('objeto');
    expect(validateHtmlCssConfig('x')[0]).toContain('objeto');
    expect(validateHtmlCssConfig([])[0]).toContain('objeto');
  });

  it('exige la solución modelo y que su HTML no esté vacío', () => {
    const noModel = valid();
    delete noModel['modelSolution'];
    expect(validateHtmlCssConfig(noModel).join(' ')).toContain('solución modelo');
    const emptyModel = valid();
    emptyModel['modelSolution'].html = '   ';
    expect(validateHtmlCssConfig(emptyModel).join(' ')).toContain('solución modelo');
  });

  it('exige starterHtml y starterCss como texto (pueden estar vacíos) y con tope', () => {
    const missing = valid();
    delete missing['starterCss'];
    expect(validateHtmlCssConfig(missing).join(' ')).toContain('starterCss');
    const big = valid();
    big['starterHtml'] = 'a'.repeat(50_001);
    expect(validateHtmlCssConfig(big).join(' ')).toContain('50000');
  });

  it('exige entre 1 y 30 reglas', () => {
    const none = valid();
    none['rules'] = [];
    expect(validateHtmlCssConfig(none).join(' ')).toContain('entre 1 y 30');
    const many = valid();
    many['rules'] = Array.from({ length: 31 }, (_, i) => ({ id: `r${i}`, label: 'x', isPublic: true, weight: 1, check: { kind: 'element_exists', selector: 'h1' } }));
    expect(validateHtmlCssConfig(many).join(' ')).toContain('entre 1 y 30');
  });

  it('exige al menos una regla pública', () => {
    const config = valid();
    config['rules'] = config['rules'].map((r: any) => ({ ...r, isPublic: false }));
    expect(validateHtmlCssConfig(config).join(' ')).toContain('al menos una regla pública');
  });

  it('rechaza ids repetidos o con formato inválido', () => {
    expect(validateHtmlCssConfig(withRule({ id: 'titulo' })).join(' ')).toContain('repetido');
    expect(validateHtmlCssConfig(withRule({ id: 'Con Espacios' })).join(' ')).toContain('el id debe usar');
    expect(validateHtmlCssConfig(withRule({ id: '' })).join(' ')).toContain('el id debe usar');
  });

  it('valida etiqueta, pista, isPublic y peso', () => {
    expect(validateHtmlCssConfig(withRule({ label: '' })).join(' ')).toContain('etiqueta');
    expect(validateHtmlCssConfig(withRule({ label: 'x'.repeat(161) })).join(' ')).toContain('etiqueta');
    expect(validateHtmlCssConfig(withRule({ hint: 'x'.repeat(241) })).join(' ')).toContain('pista');
    expect(validateHtmlCssConfig(withRule({ isPublic: 'si' })).join(' ')).toContain('isPublic');
    for (const weight of [0, 101, 1.5, '10', -1]) {
      expect(validateHtmlCssConfig(withRule({ weight })).join(' ')).toContain('el peso');
    }
  });

  it('rechaza selectores inválidos y nombra la regla', () => {
    const errors = validateHtmlCssConfig(withRule({ id: 'mala', check: { kind: 'element_exists', selector: 'div >' } }));
    expect(errors.join(' ')).toContain('La regla "mala"');
    expect(errors.join(' ')).toContain('no es válido');
    expect(validateHtmlCssConfig(withRule({ check: { kind: 'element_exists', selector: 'a'.repeat(201) } })).join(' ')).toContain('máximo 200');
  });

  it('valida cada tipo de regla', () => {
    const cases: Array<[Record<string, any>, string]> = [
      [{ kind: 'nueva' }, 'desconocido'],
      [{ kind: 'element_exists', selector: 'h1', min: 0 }, '«min»'],
      [{ kind: 'element_count', selector: 'h1' }, 'equals'],
      [{ kind: 'element_count', selector: 'h1', min: 5, max: 2 }, 'mayor'],
      [{ kind: 'text', selector: 'h1', mode: 'regex', value: 'a' }, 'mode'],
      [{ kind: 'text', selector: 'h1', mode: 'equals' }, 'texto esperado'],
      [{ kind: 'attribute', selector: 'a', name: '1mal', mode: 'exists' }, 'nombre del atributo'],
      [{ kind: 'attribute', selector: 'a', name: 'href', mode: 'equals' }, 'valor esperado'],
      [{ kind: 'css_property', selector: 'h1', property: 'Background-Color', oneOf: ['red'] }, 'minúsculas'],
      [{ kind: 'css_property', selector: 'h1', property: 'color', oneOf: [] }, 'oneOf'],
      [{ kind: 'css_property', selector: 'h1', property: 'color', oneOf: Array(11).fill('red') }, 'oneOf'],
      [{ kind: 'a11y', check: 'contraste' }, 'accesibilidad'],
    ];
    for (const [check, expected] of cases) {
      expect(validateHtmlCssConfig(withRule({ check })).join(' ')).toContain(expected);
    }
    expect(validateHtmlCssConfig(withRule({ check: 'nada' })).join(' ')).toContain('falta el criterio');
  });

  it('la solución modelo debe cumplir TODAS las reglas y el error nombra la regla', () => {
    const config = valid();
    config['rules'].push({ id: 'imposible', label: 'Hay una tabla', isPublic: true, weight: 10, check: { kind: 'element_exists', selector: 'table' } });
    const errors = validateHtmlCssConfig(config);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('La solución modelo no cumple la regla "imposible"');
  });

  it('la solución modelo se comprueba también en las reglas OCULTAS', () => {
    const config = valid();
    config['rules'].push({ id: 'oculta-imposible', label: 'x', isPublic: false, weight: 10, check: { kind: 'element_exists', selector: 'footer' } });
    expect(validateHtmlCssConfig(config).join(' ')).toContain('"oculta-imposible"');
  });

  it('devuelve como máximo 5 motivos', () => {
    const config = valid();
    config['rules'] = Array.from({ length: 10 }, (_, i) => ({ id: 'MAL ' + i, label: '', isPublic: true, weight: 0, check: {} }));
    expect(validateHtmlCssConfig(config).length).toBeLessThanOrEqual(5);
  });
});
