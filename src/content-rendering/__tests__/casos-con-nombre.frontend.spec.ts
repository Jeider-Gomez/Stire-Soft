import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { JSDOM } from 'jsdom';
import createDOMPurify = require('dompurify');

// P54 y P55, 31/10: Jeider, viendo freeCodeCamp y MDN: «la pista me va diciendo qué me falta» y «las cajitas indican el lenguaje».
// Cada caso de un ejercicio lleva el nombre de lo que comprueba, y cada bloque de código dice en qué lenguaje está.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

// formatMarkdown pasa por sanitizeRenderedHtml (DOMPurify): se carga como en code-segments.consistency.spec.ts, con DOMPurify ligado a jsdom,
// para que la prueba vea el HTML que de verdad llega a la pantalla (con lo que el saneado quita incluido).
function cargarFormateador(): { formatMarkdown: (raw: string, o?: { escapeHtml?: boolean }) => string; ETIQUETAS_DE_LENGUAJE: Record<string, string> } {
  const purifier = createDOMPurify(new JSDOM('').window);
  const cache: Record<string, { exports: Record<string, unknown> }> = {};
  const load = (name: string): Record<string, unknown> => {
    if (cache[name]) return cache[name].exports;
    const js = ts.transpileModule(leer('utils', `${name}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 } }).outputText;
    const mod = { exports: {} as Record<string, unknown> };
    cache[name] = mod;
    const localRequire = (id: string): unknown => {
      if (id === 'dompurify') return { __esModule: true, default: purifier };
      if (id.startsWith('./')) return load(id.slice(2));
      throw new Error(`módulo no previsto en la prueba: ${id}`);
    };
    new Function('module', 'exports', 'require', js)(mod, mod.exports, localRequire);
    return mod.exports;
  };
  const m = load('formatMarkdown');
  return { formatMarkdown: m['formatMarkdown'] as never, ETIQUETAS_DE_LENGUAJE: m['ETIQUETAS_DE_LENGUAJE'] as never };
}

const { formatMarkdown, ETIQUETAS_DE_LENGUAJE } = cargarFormateador();
const BT = String.fromCharCode(96).repeat(3);
const LF = String.fromCharCode(10);
const bloque = (lang: string, codigo: string) => [BT + lang, codigo, BT].join(LF);

describe('Etiqueta del lenguaje en los bloques de código (P55)', () => {
  const textoDelCodigo = (html: string) => new JSDOM(html).window.document.querySelector('pre code')?.textContent ?? '';
  const etiquetaDe = (html: string) => new JSDOM(html).window.document.querySelector('pre > span')?.textContent ?? null;

  it('un bloque de JavaScript lleva la etiqueta «JavaScript» y sobrevive al saneado del navegador', () => {
    const html = formatMarkdown(bloque('js', 'console.log(1)'));
    expect(etiquetaDe(html)).toBe('JavaScript');
    expect(textoDelCodigo(html)).toBe('console.log(1)');
  });

  it('html y css también, y «javascript» es lo mismo que «js»', () => {
    expect(etiquetaDe(formatMarkdown(bloque('html', '<h1>x</h1>')))).toBe('HTML');
    expect(etiquetaDe(formatMarkdown(bloque('css', 'h1 { color: red }')))).toBe('CSS');
    expect(etiquetaDe(formatMarkdown(bloque('javascript', 'let a = 1')))).toBe('JavaScript');
  });

  it('un bloque sin lenguaje (una salida de ejemplo) no lleva etiqueta ni espacio de más', () => {
    const html = formatMarkdown(bloque('', 'Hola, Ana.'));
    expect(etiquetaDe(html)).toBeNull();
    expect(html).not.toContain('pt-6');
    expect(textoDelCodigo(html)).toBe('Hola, Ana.');
  });

  it('un lenguaje desconocido tampoco lleva etiqueta', () => {
    expect(etiquetaDe(formatMarkdown(bloque('cobol', 'DISPLAY 1')))).toBeNull();
  });

  it('no usa atributos que el saneado quitaría ni que la lista blanca no permite', () => {
    const html = formatMarkdown(bloque('js', 'let x = 1'));
    expect(html).not.toContain('data-');
    expect(html).not.toContain('aria-label');
  });

  it('el código se escapa igual que antes', () => {
    const html = formatMarkdown(bloque('html', '<script>alert(1)</script>'));
    expect(html).not.toContain('<script>alert');
    expect(textoDelCodigo(html)).toBe('<script>alert(1)</script>');
  });

  it('la lectura en voz alta de la lección toma solo el <code>, sin la etiqueta', () => {
    expect(leer('utils', 'escucharLeccion.ts')).toContain("pre.querySelector('code')?.textContent");
  });

  it('las etiquetas conocidas están todas con nombre legible', () => {
    for (const nombre of Object.values(ETIQUETAS_DE_LENGUAJE)) expect(nombre.length).toBeGreaterThan(1);
  });
});

describe('Los casos se muestran con su nombre (P54)', () => {
  const tarjeta = leer('components', 'exercise', 'CasoPrueba.vue');
  const store = leer('stores', 'workspace.ts');
  const panel = leer('components', 'exercise', 'SalidaPrograma.vue');

  it('la tarjeta del caso usa su nombre y, sin él, «Caso n»', () => {
    expect(tarjeta).toContain('tc.nombre || `Caso #${tc.id}`');
  });

  it('la pantalla guarda el nombre al cargar el ejercicio y lo conserva después de probar', () => {
    expect(store).toContain("nombre: typeof tc.label === 'string' && tc.label ? tc.label : undefined");
    expect(store).toContain("nombre: (r.label && r.label !== 'Caso público' ? r.label : undefined) ?? nombres[index]");
  });

  it('el panel «Salida» dice qué caso muestra', () => {
    expect(panel).toContain('v-if="resumen.caso.nombre"');
    expect(panel).toContain('{{ resumen.caso.nombre }}');
  });
});
