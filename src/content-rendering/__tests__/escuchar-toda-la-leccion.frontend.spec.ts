import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { JSDOM } from 'jsdom';
import createDOMPurify = require('dompurify');
import { ContentRenderingService } from '../content-rendering.service';
import { cursoFundamentos203413 } from '../../seeds/cursos/fundamentos-203413';
import { cursoPensamientoAlgoritmico } from '../../seeds/cursos/pensamiento-algoritmico';

// 07/10, Jeider: «el lector no lee todo el contenido de una lección, sino algunas partes». Causa: los párrafos se pintaban
// como texto suelto entre <br><br> (sin <p>), y «Escuchar» solo leía títulos, listas y tablas. Esta prueba pinta TODAS las
// lecciones reales de los dos cursos como las ve el estudiante y exige que cada texto visible tenga su lectura.
const DOM = new JSDOM('<!doctype html><body></body>');
const doc = DOM.window.document;
const purifier = createDOMPurify(DOM.window);
const dir = path.join(__dirname, '..', '..', '..', 'frontend-nuxt', 'utils');
const cache: Record<string, { exports: Record<string, unknown> }> = {};
function load(name: string): Record<string, unknown> {
  if (cache[name]) return cache[name].exports;
  const js = ts.transpileModule(readFileSync(path.join(dir, `${name}.ts`), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
  }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  cache[name] = mod;
  new Function('module', 'exports', 'require', js)(mod, mod.exports, (id: string) => {
    if (id === 'dompurify') return { __esModule: true, default: purifier };
    if (id.startsWith('./')) return load(id.slice(2));
    throw new Error(`módulo no previsto en la prueba: ${id}`);
  });
  return mod.exports;
}

type Segmento = { tipo: string; markdown?: string; alt?: string; url?: string };
type Lectura = { el: Element; frase: { texto: string } };
const formatMarkdown = load('formatMarkdown').formatMarkdown as (raw: string) => string;
const partirContenido = load('contenidoLeccion').partirContenido as (t: string) => Segmento[];
const { lecturasDeLeccion, MAX_LINEAS_CODIGO } = load('escucharLeccion') as {
  lecturasDeLeccion: (raiz: Element | null, antes?: Array<Element | null>) => Lectura[];
  MAX_LINEAS_CODIGO: number;
};
const servidor = new ContentRenderingService();

/** La lección como la pinta pages/estudiante/unidad/[id].vue con ContenidoLeccion.vue (los componentes, con su aviso). */
function pintar(titulo: string, cuerpo: string): HTMLElement {
  const article = doc.createElement('article');
  const seccion = doc.createElement('section');
  seccion.innerHTML = `<h2>${titulo}</h2>`;
  for (const s of partirContenido(servidor.sanitizeRichText(cuerpo))) {
    const div = doc.createElement('div');
    if (s.tipo === 'texto') div.innerHTML = formatMarkdown(s.markdown ?? '');
    else if (s.tipo === 'imagen') div.innerHTML = `<img alt="${(s.alt ?? '').replace(/"/g, '&quot;')}" src="${s.url}">`;
    else div.innerHTML = `<figure data-leer-aviso="Aquí hay algo para ver en la pantalla."><pre>código</pre></figure>`;
    seccion.appendChild(div);
  }
  article.appendChild(seccion);
  return article;
}

/** Los textos visibles que nadie leería: ni están dentro de una lectura ni de un aviso, ni en un código largo anunciado. */
function sinLeer(raiz: Element, lecturas: Lectura[]): string[] {
  const out: string[] = [];
  const recorrido = doc.createTreeWalker(raiz, DOM.window.NodeFilter.SHOW_TEXT);
  for (let n = recorrido.nextNode(); n; n = recorrido.nextNode()) {
    const texto = (n.textContent ?? '').trim();
    if (!texto) continue;
    if (lecturas.some((l) => l.el.contains(n))) continue;
    out.push(texto.slice(0, 60));
  }
  return out;
}

const lecciones = [cursoFundamentos203413, cursoPensamientoAlgoritmico].flatMap((c) =>
  c.secciones.flatMap((s) => s.temas.flatMap((t) => t.unidades.map((u) => ({ curso: c.codigo, ...u.leccion })))),
);

describe('«Escuchar» lee toda la lección (07/10)', () => {
  it('hay lecciones reales que probar', () => {
    expect(lecciones.length).toBeGreaterThan(20);
  });

  it.each(lecciones.map((l) => [`${l.curso} · ${l.titulo}`, l] as const))('%s: ningún texto visible queda sin leer', (_n, l) => {
    const article = pintar(l.titulo, l.cuerpo);
    expect(sinLeer(article, lecturasDeLeccion(article))).toEqual([]);
  });

  it('los párrafos salen como <p> (antes eran texto suelto entre <br><br>)', () => {
    const html = formatMarkdown(servidor.sanitizeRichText('Primer párrafo con **negrita**.\n\nSegundo párrafo.\n\n## Título\n\nTercero.'));
    const d = new JSDOM(`<body>${html}</body>`).window.document;
    expect(Array.from(d.querySelectorAll('p')).map((p) => p.textContent)).toEqual(['Primer párrafo con negrita.', 'Segundo párrafo.', 'Tercero.']);
    expect(d.querySelectorAll('br').length).toBe(0);
  });

  it('lee el título y la descripción primero, las tablas fila por fila y el código corto línea por línea', () => {
    const h1 = doc.createElement('h1');
    h1.textContent = 'Variables';
    const desc = doc.createElement('p');
    desc.textContent = 'Qué es una variable.';
    const article = pintar('La idea', 'Una tabla:\n\n| Figura | Significado |\n|---|---|\n| Óvalo | Inicio |\n\n```\nx <- 5\nEscribir x\n```');
    const textos = lecturasDeLeccion(article, [h1, desc, null]).map((l) => l.frase.texto);
    expect(textos.slice(0, 2)).toEqual(['Variables', 'Qué es una variable.']);
    expect(textos).toEqual(expect.arrayContaining(['Columnas: Figura, Significado.', 'Óvalo; Inicio.', 'Código:', 'x <- 5', 'Escribir x']));
  });

  it('un código largo se anuncia en vez de leerse línea por línea', () => {
    const largo = Array.from({ length: MAX_LINEAS_CODIGO + 1 }, (_, i) => `linea ${i}`).join('\n');
    const textos = lecturasDeLeccion(pintar('Código', '```\n' + largo + '\n```')).map((l) => l.frase.texto);
    expect(textos).toContain(`Hay un fragmento de código de ${MAX_LINEAS_CODIGO + 1} líneas en la pantalla.`);
  });
});
