import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// UI-01 · la lección también se escucha (docs/DISENO_FORMATOS_LECCION.md).
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', 'require', js)(mod, mod.exports, (r: string) => cargar(r.replace(/^\.\//, '')));
  return mod.exports as T;
}

const e = cargar<{
  markdownParaVoz: (md: string) => string;
  textoParaEscuchar: (b: Array<{ title?: string | null; body?: string | null }>) => string;
  partirEnFrases: (t: string, max?: number) => string[];
  elegirVoz: <V extends { lang: string }>(v: V[]) => V | null;
  formatosDeLeccion: (b: Array<{ title?: string | null; body?: string | null }>) => Record<string, boolean>;
}>('escucharLeccion');

describe('lo que se dice en voz alta', () => {
  it('quita los símbolos de Markdown y deja los enlaces por su texto', () => {
    const t = e.markdownParaVoz('## Variables\n\nUna **variable** guarda un `valor`. Mira [la guía](https://x.co).\n\n- primero\n- segundo');
    expect(t).toBe('Variables.\nUna variable guarda un valor. Mira la guía.\nprimero\nsegundo');
  });

  it('el código no se lee símbolo por símbolo: se anuncia', () => {
    expect(e.markdownParaVoz('Antes\n```js\nlet x = 1;\n```\nDespués')).toMatch(/Hay un fragmento de código en la pantalla/);
    expect(e.markdownParaVoz('Antes\n```js\nlet x = 1;\n```\nDespués')).not.toContain('let x');
  });

  it('dice el título de cada bloque y avisa lo que solo se puede ver (imagen, ejemplo en vivo, algoritmo)', () => {
    const t = e.textoParaEscuchar([
      { title: 'Qué es un algoritmo', body: 'Una receta.\n\n![Diagrama de una receta](https://x.co/a.png)\n\n```vivo\n<p>hola</p>\n```' },
      { title: null, body: '```\nAlgoritmo Suma\n  Leer a\n  Escribir a\nFinAlgoritmo\n```' },
    ]);
    expect(t).toContain('Qué es un algoritmo.');
    expect(t).toContain('Imagen: Diagrama de una receta.');
    expect(t).toContain('ejemplo en vivo');
    expect(t).toContain('míralo como diagrama de flujo');
  });
});

describe('partir en frases (el navegador corta las lecturas largas)', () => {
  it('ninguna parte pasa del máximo y no se pierde texto', () => {
    const texto = 'Primera frase corta. Segunda frase, también corta. ' + 'Una frase muy larga que sigue y sigue, '.repeat(12) + 'y termina.';
    const partes = e.partirEnFrases(texto, 120);
    partes.forEach((p) => expect(p.length).toBeLessThanOrEqual(120));
    expect(partes.join(' ').replace(/\s+/g, ' ')).toBe(texto.replace(/\s+/g, ' ').trim());
  });

  it('junta frases cortas en una misma parte', () => {
    expect(e.partirEnFrases('Hola. ¿Cómo vas? Bien.', 220)).toEqual(['Hola. ¿Cómo vas? Bien.']);
  });
});

describe('la voz', () => {
  it('prefiere español de Colombia, luego de Latinoamérica, luego cualquier español; sin español, ninguna', () => {
    const v = (lang: string) => ({ lang });
    expect(e.elegirVoz([v('en-US'), v('es-ES'), v('es-MX'), v('es-CO')])?.lang).toBe('es-CO');
    expect(e.elegirVoz([v('en-US'), v('es-ES'), v('es-MX')])?.lang).toBe('es-MX');
    expect(e.elegirVoz([v('en-US'), v('es_ES')])?.lang).toBe('es_ES');
    expect(e.elegirVoz([v('en-US'), v('fr-FR')])).toBeNull();
  });
});

describe('formatos de la lección y dónde se ofrece', () => {
  it('detecta diagrama, imágenes, recursos y ejemplos en vivo', () => {
    expect(e.formatosDeLeccion([{ body: '```\nAlgoritmo A\nEscribir 1\nFinAlgoritmo\n```\n\n@[Video](https://youtu.be/x)' }])).toEqual({ diagrama: true, imagenes: false, recursos: true, enVivo: false });
  });

  it('se ofrece arriba de la explicación, con botones de 44 px, sin servicios externos (voz del navegador)', () => {
    const c = leer('components', 'EscucharLeccion.vue');
    expect(c).toContain('window.speechSynthesis');
    expect(c).not.toMatch(/fetch\(|api\.(get|post)/);
    expect(c).toContain('min-h-[44px] inline-flex items-center gap-2 px-4');
    // si el navegador no tiene voz en español, no hay botón que no funcione
    expect(c).toContain('disponible.value = !!voz && frases.value.length > 0');
    expect(leer('pages', 'estudiante', 'unidad', '[id].vue')).toContain('<EscucharLeccion v-if="unitContent.length > 0" :bloques="bloquesDeTexto" />');
  });

  it('al cancelar no sigue leyendo la frase siguiente (turno por lectura)', () => {
    expect(leer('components', 'EscucharLeccion.vue')).toContain('if (mio === turno && estado.value === \'leyendo\') leer(i + 1)');
  });
});
