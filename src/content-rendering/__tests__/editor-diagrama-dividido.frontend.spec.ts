import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Editor de diagramas dividido (05/10): la geometría en utils/geometriaDiagrama.ts, la paleta y el panel en
// components/proyectos/diagrama/, y los colores del tema en vez de hex fijos (en modo oscuro el texto quedaba blanco
// sobre las figuras blancas).
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', 'require', js)(mod, mod.exports, (r: string) => cargar(r.replace(/^\.\//, '')));
  return mod.exports as T;
}
type Fig = { id: string; tipo: 'inicio' | 'fin' | 'entrada' | 'proceso' | 'decision' | 'salida'; texto: string; x: number; y: number; siguiente: string | null; si: string | null; no: string | null };
const g = cargar<{
  lineasTexto: (f: Fig) => string[];
  geometriaFigura: (f: Fig) => { w: number; h: number };
  puntoDeSalida: (f: Fig, s: 'siguiente' | 'si' | 'no') => { x: number; y: number };
  calcularRuta: (o: Fig, s: 'siguiente' | 'si' | 'no', d: Fig) => { path: string; labelX: number; labelY: number };
  listaDeFlechas: (f: Fig[]) => Array<{ origenId: string; destinoId: string; salida: string; etiqueta?: string }>;
  dimensionesLienzo: (f: Fig[]) => { ancho: number; alto: number };
  nuevoId: (t: Fig['tipo'], f: Fig[]) => string;
  lugarLibre: (f: Fig[]) => { x: number; y: number };
  quitarReferencias: (f: Fig[], id: string) => void;
  nombreFigura: (f: Fig) => string;
}>('geometriaDiagrama');
const fig = (id: string, tipo: Fig['tipo'], texto: string, x: number, y: number, extra: Partial<Fig> = {}): Fig => ({ id, tipo, texto, x, y, siguiente: null, si: null, no: null, ...extra });

describe('geometría del diagrama', () => {
  it('parte el texto por palabras (16 en un rombo, 20 en el resto) y deja hasta 5 líneas', () => {
    expect(g.lineasTexto(fig('a', 'proceso', 'total <- precio * cantidad', 0, 0))).toEqual(['total <- precio *', 'cantidad']);
    expect(g.lineasTexto(fig('a', 'decision', 'edad >= 18 y tiene permiso', 0, 0))).toEqual(['edad >= 18 y', 'tiene permiso']);
    expect(g.lineasTexto(fig('a', 'proceso', '  ', 0, 0))).toEqual(['…']);
    expect(g.lineasTexto(fig('a', 'proceso', 'a\nb\nc\nd\ne\nf', 0, 0))).toHaveLength(5);
  });

  it('«No» sale por la derecha; «Sí» y la salida normal, por abajo', () => {
    const d = fig('d', 'decision', 'x > 0', 100, 100);
    const { w, h } = g.geometriaFigura(d);
    expect(g.puntoDeSalida(d, 'no')).toEqual({ x: 100 + w, y: 100 + h / 2 });
    expect(g.puntoDeSalida(d, 'si')).toEqual({ x: 100 + w / 2, y: 100 + h });
  });

  it('una flecha recta si el destino está justo debajo; un rodeo por el lado si sube (bucle)', () => {
    const a = fig('a', 'inicio', '', 100, 0);
    const b = fig('b', 'fin', '', 100, 200);
    expect(g.calcularRuta(a, 'siguiente', b).path).toMatch(/^M [\d.]+ [\d.]+ L /);
    expect(g.calcularRuta(b, 'siguiente', a).path).toContain(' C ');
  });

  it('dibuja solo las flechas que llegan a una figura que existe, con «Sí»/«No» en las decisiones', () => {
    const figuras = [
      fig('inicio', 'inicio', '', 0, 0, { siguiente: 'd' }),
      fig('d', 'decision', 'x > 0', 0, 100, { si: 'fin', no: 'borrada' }),
      fig('fin', 'fin', '', 0, 300),
    ];
    expect(g.listaDeFlechas(figuras).map((f) => [f.origenId, f.salida, f.etiqueta ?? null])).toEqual([['inicio', 'siguiente', null], ['d', 'si', 'Sí']]);
  });

  it('el lienzo mide al menos 750 × 550 y crece con el diagrama', () => {
    expect(g.dimensionesLienzo([])).toEqual({ ancho: 750, alto: 550 });
    expect(g.dimensionesLienzo([fig('a', 'inicio', '', 900, 600)]).ancho).toBe(900 + 140 + 120);
  });

  it('ids: «inicio» y «fin» la primera vez, después f1, f2…; la figura nueva cae debajo de la más baja', () => {
    expect(g.nuevoId('inicio', [])).toBe('inicio');
    expect(g.nuevoId('fin', [fig('fin', 'fin', '', 0, 0)])).toBe('f1');
    expect(g.nuevoId('proceso', [fig('f1', 'proceso', '', 0, 0)])).toBe('f2');
    expect(g.lugarLibre([])).toEqual({ x: 160, y: 30 });
    expect(g.lugarLibre([fig('a', 'inicio', '', 40, 300), fig('b', 'proceso', '', 60, 100)])).toEqual({ x: 60, y: 400 });
  });

  it('al borrar una figura, las flechas que llegaban a ella desaparecen', () => {
    const figuras = [fig('a', 'proceso', '', 0, 0, { siguiente: 'b' }), fig('d', 'decision', '', 0, 0, { si: 'b', no: 'c' })];
    g.quitarReferencias(figuras, 'b');
    expect([figuras[0].siguiente, figuras[1].si, figuras[1].no]).toEqual([null, null, 'c']);
  });

  it('nombra la figura por lo que dice, no por su identificador interno', () => {
    expect(g.nombreFigura(fig('f3', 'proceso', 'x <- 1\ny <- 2', 0, 0))).toBe('Proceso: x <- 1');
    expect(g.nombreFigura(fig('inicio', 'inicio', 'Inicio', 0, 0))).toBe('Inicio');
    expect(g.nombreFigura(fig('f4', 'salida', '', 0, 0))).toBe('Salida sin texto');
  });
});

describe('el editor usa la geometría, la paleta y el panel, con los colores del tema', () => {
  const editor = leer('components', 'proyectos', 'EditorDiagrama.vue');
  const panel = leer('components', 'proyectos', 'diagrama', 'PanelEdicionDiagrama.vue');

  it('sin colores hex fijos en el lienzo (en modo oscuro el texto quedaba blanco sobre blanco)', () => {
    const plantilla = editor.slice(0, editor.indexOf('<script'));
    expect(plantilla.match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g)).toBeNull();
    expect(editor).toContain("'fill-base-blanco'");
  });

  it('la geometría ya no está copiada en el componente', () => {
    expect(editor).not.toContain('function calcularRuta(');
    expect(editor).not.toContain('function lineasTexto(');
    expect(editor).toContain("from '~/utils/geometriaDiagrama'");
    expect(editor).toContain('<ProyectosDiagramaPaletaFiguras');
    expect(editor).toContain('<ProyectosDiagramaPanelEdicionDiagrama');
    expect(editor.split('\n').length).toBeLessThan(820);
  });

  it('el panel dice «Proceso: x <- 1», no «(f3)», y su botón de cerrar mide 44 px en el celular', () => {
    expect(panel).not.toContain('figuraSeleccionada.id');
    expect(panel).toContain('nombreFigura(figura)');
    expect(panel).toMatch(/min-h-\[44px\] min-w-\[44px\][^"]*"\s*\n?\s*aria-label="Cerrar el panel de la flecha"/);
  });
});
