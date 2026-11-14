// Mi progreso v3 (Fase D, paso 4; cuadros «E-Progreso», «E-Progreso-Reflexion», «E-Progreso-Oscuro» y «E-Cel-Progreso»).
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

type L = { id: number; title: string; status: string; empezada?: boolean; masteryPercentage: number };
type M = { id: number; title: string; units: L[]; topics: Array<{ id: number; title: string; units: L[] }> };
const P = cargar<{
  estadoTarjeta: (l: L) => string;
  resumenCurso: (m: M[]) => { total: number; terminadas: number; empezadas: number; sinEmpezar: number; porcentaje: number };
  moduloActual: (m: M[]) => M | null;
  portadaProgreso: (m: M[]) => { titulo: string; sigue: string | null; sigueId: number | null };
  arcosAnillo: (c: { terminadas: number; empezadas: number; total: number }, r?: number) => { largo: number };
  reflexionDeLaSemana: (d: { repasosHoy: number; empezada: string | null }) => { texto: string; destacado: string | null; pregunta: string };
}>('progresoV3');

const l = (id: number, title: string, status: string, empezada = false, m = 0): L => ({ id, title, status, empezada, masteryPercentage: m });
const mod = (id: number, units: L[]): M => ({ id, title: `M${id}`, units, topics: [{ id, title: 'T', units }] });

describe('el estado de cada lección y el resumen del curso', () => {
  it('terminada es dominada; empezada, trabajada sin dominar; el resto, sin empezar', () => {
    expect(P.estadoTarjeta(l(1, 'a', 'dominado', true, 90))).toBe('terminada');
    expect(P.estadoTarjeta(l(1, 'a', 'en_progreso', true, 40))).toBe('empezada');
    expect(P.estadoTarjeta(l(1, 'a', 'disponible'))).toBe('sin-empezar');
  });
  it('cuenta las tres y el porcentaje del curso terminado', () => {
    const r = P.resumenCurso([mod(1, [l(1, 'a', 'dominado', true), l(2, 'b', 'x', true), l(3, 'c', 'x'), l(4, 'd', 'x')])]);
    expect(r).toEqual({ total: 4, terminadas: 1, empezadas: 1, sinEmpezar: 2, porcentaje: 25 });
  });
  it('el módulo abierto es el que tiene algo empezado', () => {
    const m1 = mod(1, [l(1, 'a', 'dominado', true)]);
    const m2 = mod(2, [l(2, 'b', 'x', true)]);
    expect(P.moduloActual([m1, m2])?.id).toBe(2);
  });
  it('el anillo tiene el largo de su circunferencia', () => {
    expect(P.arcosAnillo({ terminadas: 1, empezadas: 1, total: 4 }, 10).largo).toBeCloseTo(62.83, 1);
  });
});

describe('la portada no inventa fechas', () => {
  it('«Ya dominas» la última dominada antes de la siguiente, y con cuál sigue', () => {
    const p = P.portadaProgreso([mod(1, [l(1, 'Variables', 'dominado', true), l(2, 'Operadores', 'x', true), l(3, 'Ciclos', 'x')])]);
    expect(p).toEqual({ titulo: '¡Ya dominas «Variables»!', sigue: 'Operadores', sigueId: 2 });
    expect(p.titulo).not.toMatch(/hoy|semana/i);
  });
  it('sin nada dominado dice dónde va, sin repetirlo', () => {
    expect(P.portadaProgreso([mod(1, [l(1, 'Variables', 'x', true)])])).toEqual({ titulo: 'Vas en «Variables»', sigue: null, sigueId: 1 });
    expect(P.portadaProgreso([mod(1, [l(1, 'Variables', 'dominado', true)])]).titulo).toBe('¡Terminaste todo el curso!');
  });
});

describe('las pestañas y la reflexión', () => {
  const p = leer('pages', 'estudiante', 'progreso.vue');
  it('Dominio, Logros y Cómo estudio, como pestañas accesibles y en la dirección', () => {
    expect(p).toContain('role="tablist"');
    expect(p).toContain(':aria-selected="pestana === p.id"');
    expect(p).toContain('@keydown="moverConFlechas"');
    expect(p).toContain("ver: id === 'dominio' ? undefined : id");
    expect(p).toContain('<EstudianteProgresoMapaCurso data-recorrido="mapa" />');
    expect(p).toContain('Nada se compara con tus compañeros.');
  });
  it('la reflexión sale de lo que tiene pendiente', () => {
    expect(P.reflexionDeLaSemana({ repasosHoy: 3, empezada: null })).toEqual(expect.objectContaining({ destacado: '3 repasos pendientes', pregunta: '¿En qué momento de hoy puedes dedicarles 15 minutos?' }));
    expect(P.reflexionDeLaSemana({ repasosHoy: 0, empezada: 'Ciclos' }).destacado).toBe('«Ciclos»');
    expect(P.reflexionDeLaSemana({ repasosHoy: 0, empezada: null }).destacado).toBeNull();
  });
  it('cada estado del mapa se dice con texto, no solo con color', () => {
    const m = leer('components', 'estudiante', 'progreso', 'MapaCurso.vue');
    expect(m).toContain("const ROTULO = { terminada: '✓ Terminada', empezada: 'Empezada', 'sin-empezar': 'Sin empezar' } as const");
  });
});
