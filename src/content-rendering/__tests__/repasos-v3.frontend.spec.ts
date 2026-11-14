// Repasos v3 (Fase D, paso 4; cuadros «E-Repasos», «E-Repasos-Oculto», «E-Repasos-Oscuro» y «E-Cel-Repasos»).
import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', 'require', js)(mod, mod.exports, () => ({}));
  return mod.exports as T;
}

type R = { diasHasta?: number; estimatedTimeMin: number; id?: number };
const V = cargar<{
  agruparRepasos: (l: R[]) => Record<'hoy' | 'semana' | 'adelante', R[]>;
  firmeza: (n: number | undefined) => number;
  cuandoToca: (d: number | undefined, dia?: string) => string;
  resumenNombres: (n: string[], max?: number) => string;
  portadaRepasos: (g: Record<'hoy' | 'semana' | 'adelante', R[]>) => { titulo: string; frase: string; destacado: string | null };
  enLaCola: (c: number[], a: number) => { posicion: number; total: number; siguiente: number | null } | null;
}>('repasosV3');
const A = cargar<{ diasEntreDias: (a: string, b: string) => number }>('avanceReciente');

describe('la agenda de repasos', () => {
  it('hoy incluye lo que ya tocaba; la semana va de mañana a 6 días; lo demás, más adelante', () => {
    const g = V.agruparRepasos([{ id: 1, diasHasta: 3, estimatedTimeMin: 5 }, { id: 2, diasHasta: -4, estimatedTimeMin: 5 }, { id: 3, diasHasta: 0, estimatedTimeMin: 5 }, { id: 4, diasHasta: 9, estimatedTimeMin: 5 }]);
    expect(g.hoy.map((r) => r.id)).toEqual([2, 3]);
    expect(g.semana.map((r) => r.id)).toEqual([1]);
    expect(g.adelante.map((r) => r.id)).toEqual([4]);
  });
  it('los días se cuentan en días de Colombia, no en horas', () => {
    expect(A.diasEntreDias('2026-11-14', '2026-11-15')).toBe(1);
    expect(A.diasEntreDias('2026-11-14', '2026-11-02')).toBe(-12);
    expect(leer('stores', 'student.ts')).toContain('diasHasta: diasEntreDias(diaColombia(new Date()), diaColombia(new Date(r.nextReviewDate)))');
  });
  it('cuándo toca, en palabras y sin alarma (nunca «Atrasado»)', () => {
    expect(V.cuandoToca(0)).toBe('Vence hoy');
    expect(V.cuandoToca(-2, '2026-11-09')).toBe('Tocaba el lunes');
    expect(V.cuandoToca(-12, '2026-11-02')).toBe('Tocaba hace 12 días');
    expect(V.cuandoToca(1)).toBe('Mañana');
    expect(V.cuandoToca(4, '2026-11-19')).toBe('El jueves');
    expect(V.cuandoToca(15)).toBe('En 15 días');
    for (const d of [-30, -1, 0, 1, 5, 40]) expect(V.cuandoToca(d)).not.toMatch(/Atrasad|Crític/);
  });
  it('las casillas: cada repaso bien hecho suma una, hasta cuatro', () => {
    expect([undefined, 0, 2, 4, 9].map((n) => V.firmeza(n))).toEqual([0, 0, 2, 4, 4]);
    expect(leer('components', 'estudiante', 'repasos', 'FilaRepaso.vue')).toContain(':aria-label="`Recuerdo ${llenas} de ${CASILLAS}`"');
  });
  it('un grupo recogido nombra dos temas y cuántos más', () => {
    expect(V.resumenNombres(['Variables', 'Leer datos', 'Ciclos', 'Funciones'])).toBe('Variables · Leer datos · 2 más');
    expect(V.resumenNombres(['Variables'])).toBe('Variables');
  });
});

describe('la portada no inventa nada', () => {
  const r = (n: number, d: number) => Array.from({ length: n }, () => ({ diasHasta: d, estimatedTimeMin: 5 }));
  it('cuenta los temas de la semana y empieza por los de hoy, con su tiempo', () => {
    const p = V.portadaRepasos({ hoy: r(3, 0), semana: r(9, 2), adelante: r(24, 20) });
    expect(p.titulo).toBe('12 temas vuelven esta semana');
    expect(p.destacado).toBe('los 3 que estás por olvidar');
    expect(p.frase).toBe(': unos 15 minutos.');
  });
  it('sin nada para hoy no apura; sin repasos explica cuándo llegarán', () => {
    expect(V.portadaRepasos({ hoy: [], semana: r(2, 3), adelante: [] }).destacado).toBeNull();
    expect(V.portadaRepasos({ hoy: [], semana: [], adelante: [] }).titulo).toBe('Todavía no tienes repasos');
  });
  it('sin rachas ni rojo en la página nueva', () => {
    const p = leer('pages', 'estudiante', 'repasos.vue');
    expect(p).toContain('sin rachas, a tu ritmo');
    expect(p).not.toMatch(/semantico-falla|racha de/i);
  });
});

describe('«Repasar los N seguidos» y «Así funcionan los repasos»', () => {
  it('la lección dice en qué repaso vas y lleva al siguiente', () => {
    expect(V.enLaCola([3, 8, 5], 8)).toEqual({ posicion: 2, total: 3, siguiente: 5 });
    expect(V.enLaCola([3, 8, 5], 5)).toEqual({ posicion: 3, total: 3, siguiente: null });
    expect(V.enLaCola([3, 8, 5], 7)).toBeNull();
    expect(leer('pages', 'estudiante', 'unidad', '[id].vue')).toContain('<EstudianteColaRepasos :learning-unit-id="unitId" />');
    expect(leer('components', 'estudiante', 'ColaRepasos.vue')).toContain('Salir de los repasos seguidos');
  });
  it('la explicación se recoge hacia el lado, se recuerda y respeta «reducir movimiento»', () => {
    const a = leer('components', 'estudiante', 'repasos', 'AsiFuncionan.vue');
    expect(a).toContain("usePanelPlegable('stire.repasos.explicacionRecogida')");
    expect(a).toContain('prefers-reduced-motion: reduce');
    expect(a).toContain('¿Por qué funciona?');
  });
});
