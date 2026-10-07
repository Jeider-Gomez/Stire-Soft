import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// utils/reglasHtmlCss.ts (07/10, PAT-04): la lógica de las reglas de un ejercicio HTML/CSS salió de
// HtmlCssExerciseBuilder.vue (645 líneas) y por fin tiene prueba propia. Jest no compila frontend-nuxt/: se transpila aquí,
// resolviendo sus importaciones relativas (./exerciseConfig).
const utils = path.join(__dirname, '..', '..', '..', 'frontend-nuxt', 'utils');
function cargar(nombre: string): Record<string, unknown> {
  const js = ts.transpileModule(readFileSync(path.join(utils, `${nombre}.ts`), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  const requerir = (r: string) => cargar(r.replace(/^\.\//, ''));
  new Function('module', 'exports', 'require', js)(mod, mod.exports, requerir);
  return mod.exports;
}

type Regla = Record<string, unknown> & { kind: string; id: string; label: string; weight: number; isPublic: boolean };
const m = cargar('reglasHtmlCss') as {
  defaultRule: () => Regla;
  limpiarSegunTipo: (r: Regla) => void;
  buildCheck: (r: Regla) => Record<string, unknown>;
  ruleFromSaved: (s: Record<string, unknown>) => Regla;
  ejercicioDesdeConfig: (c: unknown) => { rules: Regla[]; modelHtml: string; starterCss: string };
  validarEjercicio: (e: Record<string, unknown>) => { valid: boolean; error?: string; config?: { rules: Array<Record<string, unknown>> } };
};

const regla = (cambios: Record<string, unknown>): Regla => Object.assign(m.defaultRule(), { id: 'r1', label: 'Regla', ...cambios });
const ejercicio = (rules: Regla[], modelHtml = '<h1>Hola</h1>') => ({ starterHtml: '', starterCss: '', modelHtml, modelCss: '', rules });

describe('reglas de un ejercicio HTML/CSS', () => {
  it('cada regla nueva tiene su propia clave para la lista y empieza como element_exists pública de peso 10', () => {
    const a = m.defaultRule();
    const b = m.defaultRule();
    expect(a._key).not.toBe(b._key);
    expect(a).toMatchObject({ kind: 'element_exists', isPublic: true, weight: 10, a11yCheck: 'img_alt' });
  });

  it.each([
    [{ kind: 'element_exists', selector: 'h1', min: 2 }, { kind: 'element_exists', selector: 'h1', min: 2 }],
    [{ kind: 'element_count', selector: 'li', equals: 3 }, { kind: 'element_count', selector: 'li', equals: 3 }],
    [{ kind: 'text', selector: 'h1', mode: 'equals', value: 'Hola', caseSensitive: true }, { kind: 'text', selector: 'h1', mode: 'equals', value: 'Hola', caseSensitive: true }],
    [{ kind: 'attribute', selector: 'img', name: 'alt', attrMode: 'contains', attrValue: ' gato ' }, { kind: 'attribute', selector: 'img', name: 'alt', mode: 'contains', value: 'gato' }],
    [{ kind: 'css_property', selector: '.t', property: 'display', oneOfRaw: 'flex, inline-flex, ' }, { kind: 'css_property', selector: '.t', property: 'display', oneOf: ['flex', 'inline-flex'] }],
    [{ kind: 'a11y', a11yCheck: 'single_h1' }, { kind: 'a11y', check: 'single_h1' }],
  ])('buildCheck(%j) da la comprobación que califica el backend, y ruleFromSaved la recupera', (campos, esperado) => {
    const check = m.buildCheck(regla(campos));
    expect(check).toEqual(esperado);
    const vuelta = m.ruleFromSaved({ id: 'r1', label: 'Regla', weight: 7, isPublic: false, check });
    expect(m.buildCheck(vuelta)).toEqual(esperado);
    expect(vuelta).toMatchObject({ id: 'r1', weight: 7, isPublic: false });
  });

  it('un tipo desconocido guardado no rompe el editor: queda como regla por defecto', () => {
    expect(m.ruleFromSaved({ id: 'x', check: { kind: 'otro' } }).kind).toBe('element_exists');
  });

  it('cambiar de tipo vacía los campos del tipo anterior', () => {
    const r = regla({ kind: 'text', selector: 'h1', value: 'Hola', caseSensitive: true });
    m.limpiarSegunTipo(r);
    expect(r).toMatchObject({ selector: '', value: '', caseSensitive: false, mode: 'contains' });
    expect(r.id).toBe('r1');
  });

  it('validar: dice qué regla falla y por qué', () => {
    expect(m.validarEjercicio(ejercicio([regla({ selector: 'h1' })], '  ')).error).toBe('La solución modelo (HTML) es obligatoria.');
    expect(m.validarEjercicio(ejercicio([])).error).toBe('Debes agregar al menos una regla.');
    expect(m.validarEjercicio(ejercicio([regla({ selector: 'h1', isPublic: false })])).error).toBe('Al menos una regla debe ser publica (visible al estudiante).');
    expect(m.validarEjercicio(ejercicio([regla({ id: 'Mal ID', selector: 'h1' })])).error).toMatch(/^Regla 1: el ID solo puede tener/);
    expect(m.validarEjercicio(ejercicio([regla({ selector: 'h1' }), regla({ selector: 'p' })])).error).toBe('Regla 2: ID duplicado «r1».');
    expect(m.validarEjercicio(ejercicio([regla({ selector: 'h1', weight: 0 })])).error).toBe('Regla 1: el peso debe ser un entero entre 1 y 100.');
    expect(m.validarEjercicio(ejercicio([regla({ kind: 'css_property', selector: '.t', property: 'color', oneOfRaw: ' , ' })])).error).toBe('Regla 1: especifica al menos un valor aceptado.');
    expect(m.validarEjercicio(ejercicio(Array.from({ length: 31 }, (_, i) => regla({ id: `r${i}`, selector: 'h1' })))).error).toBe('Solo se permiten hasta 30 reglas.');
  });

  it('validar bien arma el config que se guarda (con la pista solo si la hay)', () => {
    const r = m.validarEjercicio(ejercicio([regla({ id: ' tiene_h1 ', label: ' Hay un h1 ', selector: 'h1', hint: '  ' })]));
    expect(r.valid).toBe(true);
    expect(r.config).toEqual({
      starterHtml: '', starterCss: '', modelSolution: { html: '<h1>Hola</h1>', css: '' },
      rules: [{ id: 'tiene_h1', label: 'Hay un h1', isPublic: true, weight: 10, check: { kind: 'element_exists', selector: 'h1' } }],
    });
  });

  it('leer un config guardado: sin reglas devuelve la lista vacía (el editor conserva la suya)', () => {
    expect(m.ejercicioDesdeConfig({ starterCss: 'a{}', modelSolution: { html: '<p>x</p>' } })).toMatchObject({ starterCss: 'a{}', modelHtml: '<p>x</p>', rules: [] });
    expect(m.ejercicioDesdeConfig(null).rules).toEqual([]);
  });

  it('el constructor ya no lleva la lógica: usa la utilidad y el editor de cada regla', () => {
    const c = readFileSync(path.join(__dirname, '..', '..', '..', 'frontend-nuxt', 'components', 'docente', 'exercise-builders', 'HtmlCssExerciseBuilder.vue'), 'utf8');
    expect(c).toContain("from '~/utils/reglasHtmlCss'");
    expect(c).toContain('<DocenteExerciseBuildersEditorReglaHtmlCss');
    expect(c).not.toContain('function buildCheck');
    expect(c.split('\n').length).toBeLessThan(300);
  });
});
