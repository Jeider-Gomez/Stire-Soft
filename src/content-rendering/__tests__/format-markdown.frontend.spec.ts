import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { JSDOM } from 'jsdom';
import createDOMPurify = require('dompurify');
import { ContentRenderingService } from '../content-rendering.service';
// frontend-nuxt/utils/formatMarkdown.ts pinta las lecciones y los enunciados. Un docente escribe tablas («| Figura | Significado |») y
// listas numeradas («1. Leer el enunciado»); antes se veían como texto con barras y como un párrafo corrido. Jest no compila
// frontend-nuxt/, así que se transpilan los archivos reales (igual que en code-segments.consistency.spec.ts).
type FormatMarkdown = (raw: string, options?: { escapeHtml?: boolean }) => string;
type LoadedModule = { exports: Record<string, unknown> };

function loadFrontendFormatMarkdown(): FormatMarkdown {
  const dir = path.join(__dirname, '..', '..', '..', 'frontend-nuxt', 'utils');
  const purifier = createDOMPurify(new JSDOM('').window);
  const cache: Record<string, LoadedModule> = {};
  const load = (name: string): Record<string, unknown> => {
    if (cache[name]) return cache[name].exports;
    const js = ts.transpileModule(readFileSync(path.join(dir, `${name}.ts`), 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
    }).outputText;
    const mod: LoadedModule = { exports: {} };
    cache[name] = mod;
    const localRequire = (id: string): unknown => {
      if (id === 'dompurify') return { __esModule: true, default: purifier };
      if (id.startsWith('./')) return load(id.slice(2));
      throw new Error(`módulo no previsto en la prueba: ${id}`);
    };
    new Function('module', 'exports', 'require', js)(mod, mod.exports, localRequire);
    return mod.exports;
  };
  return load('formatMarkdown')['formatMarkdown'] as FormatMarkdown;
}

const formatMarkdown = loadFrontendFormatMarkdown();
const servidor = new ContentRenderingService();
/** Como lo ve el estudiante: el servidor sanea al guardar y el navegador pinta lo guardado. */
const comoEstudiante = (md: string) => formatMarkdown(servidor.sanitizeRichText(md));

function dom(html: string): Document {
  return new JSDOM(`<body>${html}</body>`).window.document;
}

describe('formatMarkdown (frontend-nuxt/utils/formatMarkdown.ts): tablas y listas numeradas', () => {
  const TABLA = `| Figura | Significado |
|---|---|
| Óvalo | Inicio o fin |
| Rombo | Decisión (\`¿x > 3?\`) |`;

  it('una tabla con fila separadora se pinta como <table> con encabezado y filas', () => {
    const doc = dom(comoEstudiante(TABLA));
    expect(Array.from(doc.querySelectorAll('th')).map((th) => th.textContent)).toEqual(['Figura', 'Significado']);
    expect(Array.from(doc.querySelectorAll('tbody tr')).map((tr) => Array.from(tr.children).map((td) => td.textContent))).toEqual([
      ['Óvalo', 'Inicio o fin'],
      ['Rombo', 'Decisión (¿x > 3?)'],
    ]);
  });

  it('el código dentro de una celda se muestra literal y sus barras no parten la celda', () => {
    const doc = dom(comoEstudiante('| Operador | Qué hace |\n|---|---|\n| `&& || !` | Y, o, no |'));
    expect(Array.from(doc.querySelectorAll('td')).map((td) => td.textContent)).toEqual(['&& || !', 'Y, o, no']);
  });

  it('fuera del código, \\| es una barra literal dentro de la celda', () => {
    const doc = dom(comoEstudiante('| a | b |\n|---|---|\n| x \\| y | z |'));
    expect(Array.from(doc.querySelectorAll('td')).map((td) => td.textContent)).toEqual(['x | y', 'z']);
  });

  it('sin fila separadora no hay tabla: el texto con barras queda como texto', () => {
    const doc = dom(comoEstudiante('| esto | no es una tabla |'));
    expect(doc.querySelector('table')).toBeNull();
  });

  it('las filas pueden tener menos celdas que el encabezado sin romper la tabla', () => {
    const doc = dom(comoEstudiante('| a | b |\n|---|---|\n| solo una |'));
    expect(Array.from(doc.querySelectorAll('tbody td')).map((td) => td.textContent)).toEqual(['solo una', '']);
  });

  it('un intento de inyectar HTML en una celda queda neutralizado', () => {
    const html = comoEstudiante('| a | b |\n|---|---|\n| <img src=x onerror=alert(1)> | <script>alert(1)</script> |');
    const doc = dom(html);
    expect(doc.querySelector('script')).toBeNull();
    expect(Array.from(doc.querySelectorAll('*')).some((el) => el.hasAttribute('onerror'))).toBe(false);
  });

  it('en la vista previa del docente (escapeHtml) la tabla también se pinta y el HTML de la celda se ve como texto', () => {
    const doc = dom(formatMarkdown('| a |\n|---|\n| <b>x</b> |', { escapeHtml: true }));
    expect(doc.querySelector('td')?.textContent).toBe('<b>x</b>');
  });

  it('las líneas «1. … 2. …» se pintan como lista numerada, separada de las viñetas', () => {
    const doc = dom(comoEstudiante('Pasos:\n\n1. Leer el enunciado.\n2. Identificar **entradas** y salidas.\n3. Diseñar.\n\n- una viñeta'));
    expect(Array.from(doc.querySelectorAll('ol > li')).map((li) => li.textContent)).toEqual([
      'Leer el enunciado.',
      'Identificar entradas y salidas.',
      'Diseñar.',
    ]);
    expect(doc.querySelector('ol strong')?.textContent).toBe('entradas');
    expect(Array.from(doc.querySelectorAll('ul > li')).map((li) => li.textContent)).toEqual(['una viñeta']);
  });

  it('no deja saltos vacíos pegados a títulos, tablas, listas ni bloques de código, pero sí entre párrafos', () => {
    const html = comoEstudiante('## La idea\n\nPrimer párrafo.\n\nSegundo párrafo.\n\n```\ncodigo\n```\n\n| a |\n|---|\n| b |\n\n1. uno\n\n## Error común\n\nFin.');
    const vecinos = (tag: string) => {
      const doc = dom(html);
      return Array.from(doc.querySelectorAll(tag)).flatMap((el) => [el.previousSibling?.nodeName, el.nextSibling?.nodeName]);
    };
    for (const tag of ['h3', 'pre', 'div', 'ol']) expect({ tag, br: vecinos(tag).includes('BR') }).toEqual({ tag, br: false });
    expect(html).toContain('Primer párrafo.<br><br>Segundo párrafo.');
  });

  it('un número con punto en medio de una frase no crea una lista', () => {
    expect(dom(comoEstudiante('La nota mínima es 3. Con menos se reprueba.')).querySelector('ol')).toBeNull();
  });
});

describe('títulos de la lección en orden (WCAG 1.3.1)', () => {
  it('«##» es h3 y «###» h4: la sección ya es h2, sin saltar de h2 a h4', () => {
    const html = comoEstudiante('## La idea\n\n### Pruébalo\n\nTexto.');
    expect(html).toMatch(/<h3[^>]*>La idea<\/h3>/);
    expect(html).toMatch(/<h4[^>]*>Pruébalo<\/h4>/);
  });
});
