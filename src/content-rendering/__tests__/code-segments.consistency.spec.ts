import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { JSDOM } from 'jsdom';
import createDOMPurify = require('dompurify');
import { ContentRenderingService } from '../content-rendering.service';
// Las funciones REALES que pintan las lecciones y los enunciados en el navegador (frontend-nuxt/utils/formatMarkdown.ts y su defensa final
// sanitizeRenderedHtml.ts). Jest no compila los archivos de frontend-nuxt/ (tienen su propia configuración de módulos), así que se leen
// los ARCHIVOS REALES y se transpilan aquí, con DOMPurify ligado a jsdom en lugar del de un navegador. Si alguien cambia sus expresiones
// regulares y no las de code-segments.ts, esta prueba lo detecta.
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

// Invariante de seguridad de A7: para CUALQUIER entrada, formatMarkdown(sanitizeRichText(entrada)) produce solo etiquetas y atributos de la
// lista blanca (la de RICH_CONFIG más lo que el propio formatMarkdown genera), sin scripts, sin manejadores on…, sin javascript: y con
// iframes solo hacia los hosts permitidos. Si el servidor protegiera (dejara sin sanear) algo que el frontend trata como texto, esta
// prueba fallaría con la entrada exacta.

const ALLOWED_TAGS = new Set([
  // RICH_CONFIG
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr', 'strong', 'em', 'b', 'i', 'u', 's', 'blockquote', 'ul', 'ol', 'li',
  'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img', 'a', 'pre', 'code', 'span', 'div', 'iframe',
]);
const ALLOWED_ATTRS = new Set([
  'href', 'src', 'alt', 'title', 'class', 'colspan', 'rowspan', 'target', 'rel', 'width', 'height', 'allow', 'allowfullscreen', 'frameborder',
]);
const ALLOWED_IFRAME_HOSTS = ['www.youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com'];

// Un solo documento para todas las entradas (crear uno por entrada agota la memoria de Jest) y un <template>, que analiza el HTML sin
// ejecutar nada ni cargar recursos.
const PARSER = new JSDOM('<!doctype html><body></body>');

function violations(html: string): string[] {
  const found: string[] = [];
  const template = PARSER.window.document.createElement('template');
  template.innerHTML = html;
  for (const el of Array.from(template.content.querySelectorAll('*'))) {
    const tag = el.tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) found.push(`etiqueta no permitida <${tag}>`);
    for (const attr of Array.from(el.attributes)) {
      if (!ALLOWED_ATTRS.has(attr.name)) found.push(`atributo no permitido ${attr.name} en <${tag}>`);
      if (/^on/i.test(attr.name)) found.push(`manejador ${attr.name}`);
      if ((attr.name === 'href' || attr.name === 'src') && /^\s*(javascript|vbscript|data):/i.test(attr.value)) found.push(`URL peligrosa ${attr.name}=${attr.value.slice(0, 30)}`);
    }
    if (tag === 'iframe') {
      let host = '';
      try {
        host = new URL(el.getAttribute('src') ?? '', 'https://invalid.local').hostname;
      } catch {
        host = '';
      }
      if (!ALLOWED_IFRAME_HOSTS.includes(host)) found.push(`iframe hacia ${host}`);
    }
  }
  return found;
}

describe('A7 — consistencia entre el saneado del servidor y formatMarkdown del frontend', () => {
  const service = new ContentRenderingService();
  const render = (input: string) => formatMarkdown(service.sanitizeRichText(input));

  const ADVERSARIAL: string[] = [
    '`<img src=x onerror=alert(1)>`',
    '```html\n<script>alert(1)</script>\n```',
    '`` `<img src=x onerror=1>`',
    '`foo `<img src=x onerror=1>` bar',
    '<b title="`">`<img src=x onerror=1>`',
    '<b title="``">x</b>`<img src=x onerror=1>`\n',
    '`<b\n>``<img src=x onerror=1>``\n```\n`<img src=x onerror=1>`',
    '```\n`<b>`\n``` `<img src=x onerror=1>` ```',
    'a ` b `<img src=x onerror=1>` c ``` d',
    '```js\nx\n``` <img src=x onerror=1> ```js\ny\n```',
    '`a ```<img src=x onerror=1>``` b`',
    '<a href="javascript:alert(1)">`x`</a> `<a href="javascript:alert(1)">x</a>`',
    '<svg onload=alert(1)>`</svg>`<svg onload=alert(1)>',
    '<iframe src="https://evil.example.com"></iframe>`<iframe src="https://evil.example.com"></iframe>`',
    '<iframe src="https://www.youtube.com/embed/x"></iframe> `<iframe src="https://evil.example.com">`',
    '``\n`<img src=x onerror=1>`\n``',
    '````\n<img src=x onerror=1>\n````',
    '`\u0000<img src=x onerror=1>\u0000`',
    '\u00000\u0000 <img src=x onerror=1> `x`',
    '```\n```<img src=x onerror=1>```\n```',
    '**`<img src=x onerror=1>`**',
    '# `<img src=x onerror=1>`\n- `<script>1</script>`',
    '<b>`</b><img src=x onerror=1><b>`</b>',
    '`<b title="`>` <img src=x onerror=1> `">`',
  ];

  it.each(ADVERSARIAL.map((input, i) => [i, input] as const))('entrada adversarial #%i no produce HTML fuera de la lista blanca', (_i, input) => {
    expect(violations(render(input))).toEqual([]);
  });

  it('miles de entradas aleatorias (semilla fija) no producen HTML fuera de la lista blanca', () => {
    // PRNG determinista (mulberry32) para que un fallo se pueda reproducir con la misma semilla.
    let state = 0x5f3759df;
    const random = () => {
      state = (state + 0x6d2b79f5) | 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const TOKENS = [
      '`', '`', '```', '``', '\n', '\n\n', ' ', 'a', 'texto', '**', '*', '# ', '- ', '&', '&lt;', '<', '>', '"', "'",
      '<img src=x onerror=1>', '<script>alert(1)</script>', '<b title="', '">', '<b>', '</b>', '<i onclick=1>', '</i>',
      '<a href="javascript:1">x</a>', '<svg onload=1>', '<iframe src="https://evil.example.com"></iframe>',
      '`<img src=x onerror=1>`', '```html\n<script>1</script>\n```', '<style>*{}</style>', '<form action=x><input></form>', '\u0000',
    ];
    const failures: Array<{ input: string; problems: string[] }> = [];
    const N = 4000;
    for (let n = 0; n < N; n++) {
      const length = 2 + Math.floor(random() * 14);
      let input = '';
      for (let i = 0; i < length; i++) input += TOKENS[Math.floor(random() * TOKENS.length)];
      const problems = violations(render(input));
      if (problems.length > 0 && failures.length < 3) failures.push({ input, problems });
    }
    expect(failures).toEqual([]);
  }, 120000);

  it('el ejemplo de HTML de una lección llega intacto y como texto (no se ejecuta ni se pierde)', () => {
    const body = 'Un botón:\n\n```html\n<button onclick="x()">Clic</button>\n<script>console.log(1)</script>\n```\n\nY en línea: `<div class="a">`.';
    const html = render(body);
    const dom = new JSDOM(`<body>${html}</body>`);
    const codeTexts = Array.from(dom.window.document.querySelectorAll('code')).map((c) => c.textContent);
    expect(codeTexts).toContain('<button onclick="x()">Clic</button>\n<script>console.log(1)</script>');
    expect(codeTexts).toContain('<div class="a">');
    expect(dom.window.document.querySelector('script')).toBeNull();
    expect(dom.window.document.querySelector('button')).toBeNull();
  });
});
