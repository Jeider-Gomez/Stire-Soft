import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Moverse entre lecciones desde cualquier lugar (26/10, Jeider; referentes: Ctrl+K de Cursor y «Clase 1 de 55» de Platzi):
// el buscador «Ir a una lección» y, en computador, anterior · «Lección n de N» · siguiente arriba de la lección.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

type Estado = 'dominado' | 'en-progreso' | 'por-iniciar' | 'bloqueado';
interface Leccion { id: number; titulo: string; dominio: number; estado: Estado; actual: boolean }
interface Modulo { id: number; titulo: string; abierto: boolean; requiere: string | null; lecciones: Leccion[] }
const n = cargar<{
  buscarLecciones: (m: Modulo[], t: string) => Array<{ id: number; titulo: string; modulo: string; actual: boolean; abierta: boolean }>;
  posicionEnCurso: (m: Modulo[], id: number) => { n: number; total: number } | null;
}>('navegacionLeccion');

const l = (id: number, titulo: string, actual = false): Leccion => ({ id, titulo, dominio: 0, estado: 'por-iniciar', actual });
const modulos: Modulo[] = [
  { id: 1, titulo: 'Introducción a la algoritmia', abierto: true, requiere: null, lecciones: [l(10, 'Qué es un algoritmo'), l(11, 'Variables y tipos', true)] },
  { id: 2, titulo: 'Ciclos', abierto: false, requiere: 'Se abre con 60 %', lecciones: [l(20, 'El ciclo mientras'), l(21, 'El ciclo para')] },
];

describe('«Ir a una lección»', () => {
  it('sin texto, todas las lecciones del curso en orden, con su módulo', () => {
    expect(n.buscarLecciones(modulos, '').map((x) => x.id)).toEqual([10, 11, 20, 21]);
    expect(n.buscarLecciones(modulos, '')[0].modulo).toBe('Introducción a la algoritmia');
  });
  it('busca sin acentos ni mayúsculas, en la lección o en su módulo', () => {
    expect(n.buscarLecciones(modulos, 'ALGORITMO').map((x) => x.id)).toEqual([10]);
    expect(n.buscarLecciones(modulos, 'introduccion').map((x) => x.id)).toEqual([10, 11]);
    expect(n.buscarLecciones(modulos, 'ciclo').map((x) => x.id)).toEqual([20, 21]);
  });
  it('marca dónde está el estudiante y las de módulos cerrados (se ven, con candado)', () => {
    const r = n.buscarLecciones(modulos, '');
    expect(r.find((x) => x.actual)?.id).toBe(11);
    expect(r.filter((x) => !x.abierta).map((x) => x.id)).toEqual([20, 21]);
  });
  it('la posición es en todo el curso: «Lección 2 de 4»', () => {
    expect(n.posicionEnCurso(modulos, 11)).toEqual({ n: 2, total: 4 });
    expect(n.posicionEnCurso(modulos, 99)).toBeNull();
  });
});

describe('se llega desde cualquier lugar', () => {
  it('Ctrl+K (⌘K en Mac) lo abre en cualquier pantalla del estudiante; también el botón del plan y el número de la lección', () => {
    const p = leer('components', 'estudiante', 'IrALeccion.vue');
    expect(p).toContain("(e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'");
    expect(p).toContain('role="combobox"');
    expect(p).toContain("e.key === 'Enter'");
    expect(leer('layouts', 'student.vue')).toContain('<EstudianteIrALeccion />');
    expect(leer('components', 'layout', 'PlanDelCurso.vue')).toContain('@click="irALeccion = true"');
    expect(leer('components', 'estudiante', 'SaltosLeccion.vue')).toContain("useState('ir-a-leccion'");
  });
  it('en computador, anterior · «Lección n de N» · siguiente quedan fijos arriba de la lección', () => {
    const s = leer('components', 'estudiante', 'SaltosLeccion.vue');
    expect(s).toContain('sticky top-[4.5rem]');
    expect(s).toContain('`Lección ${posicion.n} de ${posicion.total}`');
    expect(leer('pages', 'estudiante', 'unidad', '[id].vue')).toContain('<EstudianteSaltosLeccion :unit-id="unitId"');
  });
});
