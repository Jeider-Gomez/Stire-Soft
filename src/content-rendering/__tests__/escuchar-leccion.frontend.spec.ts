import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// UI-01 · la lección también se escucha (docs/DISENO_FORMATOS_LECCION.md). Rediseño del 04/10: un botón junto al
// título y un reproductor pequeño que resalta la frase que suena, en vez de una franja grande arriba de la lección.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', 'require', js)(mod, mod.exports, (r: string) => cargar(r.replace(/^\.\//, '')));
  return mod.exports as T;
}

type Frase = { texto: string; inicio: number; fin: number };
type Voz = { lang: string; name?: string; voiceURI?: string };
const e = cargar<{
  frasesConPosicion: (t: string, max?: number) => Frase[];
  partirEnFrases: (t: string, max?: number) => string[];
  textoParaVoz: (t: string) => string;
  elegirVoz: <V extends Voz>(v: V[], preferida?: string | null) => V | null;
  vocesEnEspanol: <V extends Voz>(v: V[]) => V[];
  nombreVoz: (v: Voz) => string;
  formatosDeLeccion: (b: Array<{ title?: string | null; body?: string | null }>) => Record<string, boolean>;
  textoFormatos: (f: Record<string, boolean>) => string;
  leerPreferenciasVoz: (crudo: string | null) => { velocidad: number; voz: string | null };
}>('escucharLeccion');

describe('frases con su posición (para resaltar la que suena)', () => {
  it('cada frase apunta a su lugar exacto en el párrafo', () => {
    const t = 'Un algoritmo es una receta.  ¿Por qué?\nPorque sigue pasos «en orden.» Fin';
    const f = e.frasesConPosicion(t);
    expect(f.map((x) => x.texto)).toEqual(['Un algoritmo es una receta.', '¿Por qué?', 'Porque sigue pasos «en orden.»', 'Fin']);
    f.forEach((x) => expect(t.slice(x.inicio, x.fin).replace(/\s+/g, ' ')).toBe(x.texto));
  });

  it('ninguna parte pasa del máximo y no se pierde texto (Chrome corta las lecturas largas)', () => {
    const texto = 'Primera frase corta. Segunda frase, también corta. ' + 'Una frase muy larga que sigue y sigue, '.repeat(12) + 'y termina.';
    const partes = e.partirEnFrases(texto, 120);
    partes.forEach((p) => expect(p.length).toBeLessThanOrEqual(120));
    expect(partes.join(' ').replace(/\s+/g, ' ')).toBe(texto.replace(/\s+/g, ' ').trim());
  });
});

describe('lo que la voz diría mal', () => {
  it('la asignación y las comparaciones del pseudocódigo se dicen en palabras', () => {
    expect(e.textoParaVoz('suma <- a + b')).toBe('suma recibe a + b');
    expect(e.textoParaVoz('Si edad >= 18 y x != 0')).toBe('Si edad mayor o igual que 18 y x distinto de 0');
  });
});

describe('la voz', () => {
  it('prefiere las voces naturales y, entre iguales, Colombia y luego Latinoamérica; sin español, ninguna', () => {
    const v = (lang: string, name = 'Voz') => ({ lang, name, voiceURI: `${name}-${lang}` });
    expect(e.elegirVoz([v('en-US'), v('es-ES'), v('es-MX'), v('es-CO')])?.lang).toBe('es-CO');
    expect(e.elegirVoz([v('en-US'), v('es-ES'), v('es-MX')])?.lang).toBe('es-MX');
    expect(e.elegirVoz([v('es-CO', 'Microsoft Gonzalo'), v('es-MX', 'Microsoft Dalia Online (Natural)')])?.lang).toBe('es-MX');
    expect(e.elegirVoz([v('en-US'), v('fr-FR')])).toBeNull();
  });

  it('respeta la voz que eligió el estudiante si sigue disponible', () => {
    const voces = [{ lang: 'es-CO', name: 'A', voiceURI: 'a' }, { lang: 'es-ES', name: 'B', voiceURI: 'b' }];
    expect(e.elegirVoz(voces, 'b')?.voiceURI).toBe('b');
    expect(e.elegirVoz(voces, 'ya-no-existe')?.voiceURI).toBe('a');
  });

  it('nombres cortos en el selector', () => {
    expect(e.nombreVoz({ lang: 'es-CO', name: 'Microsoft Salome Online (Natural) - Spanish (Colombia)' })).toBe('Salome (Colombia)');
  });

  it('la velocidad y la voz se recuerdan; un valor dañado vuelve a lo normal', () => {
    expect(e.leerPreferenciasVoz('{"velocidad":1.25,"voz":"x"}')).toEqual({ velocidad: 1.25, voz: 'x' });
    expect(e.leerPreferenciasVoz('{"velocidad":9}')).toEqual({ velocidad: 1, voz: null });
    expect(e.leerPreferenciasVoz('no es json')).toEqual({ velocidad: 1, voz: null });
  });
});

describe('formatos de la lección, en una línea', () => {
  it('detecta diagrama, imágenes, recursos y ejemplos en vivo, y lo dice en una frase', () => {
    const f = e.formatosDeLeccion([{ body: '```\nAlgoritmo A\nEscribir 1\nFinAlgoritmo\n```\n\n@[Video](https://youtu.be/x)' }]);
    expect(f).toEqual({ diagrama: true, imagenes: false, recursos: true, enVivo: false });
    expect(e.textoFormatos(f)).toBe('Incluye el algoritmo en diagrama y paso a paso y videos o recursos.');
    expect(e.textoFormatos({ diagrama: false, imagenes: false, recursos: false, enVivo: false })).toBe('');
  });
});

describe('el reproductor', () => {
  const c = leer('components', 'EscucharLeccion.vue');

  it('va junto al título de la lección, no como franja aparte', () => {
    const pagina = leer('pages', 'estudiante', 'unidad', '[id].vue');
    const cabecera = pagina.slice(pagina.indexOf('<header'), pagina.indexOf('</header>'));
    expect(cabecera).toContain('<EscucharLeccion v-if="unitContent.length > 0" :bloques="bloquesDeTexto" />');
    expect(c).not.toContain('También en esta lección');
  });

  it('lee lo que está en pantalla y resalta la frase que suena', () => {
    expect(c).toContain("objetivo: '#explicacion'");
    expect(c).toContain('CSS.highlights.set(RESALTADO, new Highlight(rango))');
    expect(c).toContain('::highlight(stire-leyendo)');
    // lo que solo se puede ver se anuncia
    expect(leer('components', 'AlgoritmoMultiformato.vue')).toContain('data-leer-aviso=');
    expect(leer('components', 'EjemploEnVivo.vue')).toContain('data-leer-aviso=');
    expect(leer('components', 'LessonResource.vue')).toContain('data-leer-aviso=');
  });

  it('sin servicios externos (la voz del navegador) y con controles de 44 px y nombre accesible', () => {
    expect(c).toContain('window.speechSynthesis');
    expect(c).not.toMatch(/fetch\(|api\.(get|post)/);
    expect(c).toContain('min-width: 44px; min-height: 44px;');
    for (const nombre of ['Frase anterior', 'Frase siguiente', 'Velocidad y voz', 'Dejar de escuchar']) expect(c).toContain(`aria-label="${nombre}"`);
  });

  it('errores corregidos: la locución no se pierde, la pausa funciona en Android y no se anuncia cada frase', () => {
    expect(c).toContain('vivas.add(u)');
    expect(c).toContain('if (mio === turno && estado.value === \'leyendo\') leer(i + 1)');
    expect(c).not.toContain('speechSynthesis.pause()');
    expect(c).not.toMatch(/aria-live="polite">Parte/);
  });
});

describe('UI-04 · con «No me sirvió», otra vía de la misma lección', () => {
  it('la valoración lleva al botón «Escuchar»', () => {
    expect(leer('components', 'ValorarLeccion.vue')).toContain('<a href="#escuchar-leccion"');
    expect(leer('components', 'EscucharLeccion.vue')).toContain('id="escuchar-leccion"');
  });
});
