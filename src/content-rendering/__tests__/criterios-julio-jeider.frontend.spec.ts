import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Revisión de Jeider de los criterios de Julio (17/10): MOD-01 (plan lateral y lecciones sin empezar) y MOD-03 (el
// resultado de una entrega, más breve).
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', 'require', js)(mod, mod.exports, () => ({}));
  return mod.exports as T;
}

type Modulo = { id: number; title: string; units: Array<{ id: number; title: string; status: string; empezada?: boolean }> };
const plan = cargar<{
  moduloInicial: (m: Modulo[], actual: number | null) => number | null;
  conteoModulo: (m: Modulo) => { dominadas: number; total: number };
  leccionDeLaRuta: (r: string) => number | null;
  sinEmpezarPorModulo: (m: Modulo[]) => Array<{ id: number; lecciones: Array<{ id: number }> }>;
}>('planLateral');

const modulos: Modulo[] = [
  { id: 7, title: 'Unidad 1', units: [{ id: 1, title: 'A', status: 'dominado', empezada: true }, { id: 2, title: 'B', status: 'dominado', empezada: true }] },
  { id: 8, title: 'Unidad 2', units: [{ id: 3, title: 'C', status: 'en-progreso', empezada: true }, { id: 4, title: 'D', status: 'por-iniciar' }] },
  { id: 9, title: 'Unidad 3', units: [{ id: 5, title: 'E', status: 'por-iniciar' }] },
];

describe('MOD-01: el plan del curso en la barra lateral', () => {
  it('abre solo el módulo de la lección actual; fuera de una lección, el primero con algo sin dominar', () => {
    expect(plan.moduloInicial(modulos, 5)).toBe(9);
    expect(plan.moduloInicial(modulos, null)).toBe(8);
    expect(plan.moduloInicial([], null)).toBeNull();
    expect(plan.leccionDeLaRuta('/estudiante/unidad/42')).toBe(42);
    expect(plan.leccionDeLaRuta('/estudiante/progreso')).toBeNull();
  });

  it('cuenta las lecciones dominadas de cada módulo', () => {
    expect(plan.conteoModulo(modulos[0])).toEqual({ dominadas: 2, total: 2 });
    expect(plan.conteoModulo(modulos[1])).toEqual({ dominadas: 0, total: 2 });
  });

  it('va debajo de la navegación, en su componente, con nombres en dos líneas y sin los ids fijos de antes', () => {
    const menu = leer('components', 'layout', 'SidebarNav.vue');
    expect(menu.indexOf('<span>Mensajes</span>')).toBeLessThan(menu.indexOf('<LayoutPlanDelCurso />'));
    expect(menu).not.toContain('openModules');
    const p = leer('components', 'layout', 'PlanDelCurso.vue');
    expect(p).toContain('<span class="line-clamp-2" :title="mod.title">{{ mod.title }}</span>');
    expect(p).toContain(':aria-expanded="moduloAbierto === mod.id"');
    expect(p).not.toContain("split(':')[0] }}\n");
  });
});

describe('MOD-01: «Mi progreso» también dice lo que falta empezar', () => {
  it('agrupa por módulo las lecciones sin empezar', () => {
    expect(plan.sinEmpezarPorModulo(modulos).map((g) => [g.id, g.lecciones.map((l) => l.id)])).toEqual([[8, [4]], [9, [5]]]);
  });

  it('las muestra plegadas, para no llenar la pantalla', () => {
    const p = leer('pages', 'estudiante', 'progreso.vue');
    expect(p).toMatch(/<details v-if="sinEmpezar\.length"[\s\S]*?Te faltan por empezar \{\{ totalSinEmpezar \}\}/);
  });
});

describe('MOD-03: el resultado de una entrega, breve y claro', () => {
  const r = cargar<{ dominioCorto: (a: number | null, d: number | null) => string }>('resultadoEntrega');

  it('el dominio va en una línea junto al puntaje', () => {
    expect(r.dominioCorto(62, 70)).toBe('Dominio 62 % → 70 % (+8)');
    expect(r.dominioCorto(70, 66)).toBe('Dominio 70 % → 66 % (−4)');
    expect(r.dominioCorto(70, 70)).toBe('Dominio 70 %, igual');
    expect(r.dominioCorto(null, 70)).toBe('');
  });

  it('arriba lo que enseña y el siguiente paso; los detalles quedan plegados', () => {
    const v = leer('components', 'exercise', 'ResultadoEntrega.vue');
    const detalles = v.indexOf('<details v-if="hayDetalles"');
    expect(detalles).toBeGreaterThan(v.indexOf('@click="hacer(paso.primaria)"'));
    expect(v.indexOf('{{ CUANDO_VUELVE[calidad] }}')).toBeGreaterThan(detalles);
    expect(v.indexOf('<EstudianteMetaDeLaLeccion')).toBeGreaterThan(detalles);
    expect(v.indexOf('{{ calibracion.texto }}')).toBeLessThan(detalles);
    expect(v.indexOf('{{ x.texto }}')).toBeLessThan(detalles);
  });
});
