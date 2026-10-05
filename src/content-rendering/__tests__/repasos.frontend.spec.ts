import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Repasos (crítica de diseño del 05/10): un punto de partida, el tiempo calculado y sin rojo de alarma.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}
const r = cargar<{
  ordenarRepasos: <T extends { urgency: string }>(l: T[]) => T[];
  tiempoTotal: (l: Array<{ estimatedTimeMin: number }>) => string;
  ESTILO_URGENCIA: Record<string, string>;
}>('repasos');

describe('repasos de hoy', () => {
  it('primero lo atrasado, luego lo de hoy, luego mañana', () => {
    const l = [{ id: 1, urgency: 'manana' }, { id: 2, urgency: 'vencido' }, { id: 3, urgency: 'critico' }, { id: 4, urgency: 'vencido' }];
    expect(r.ordenarRepasos(l).map((x) => x.id)).toEqual([3, 2, 4, 1]);
  });

  it('el tiempo se calcula (antes decía «~13 minutos» siempre)', () => {
    expect(r.tiempoTotal(Array(6).fill({ estimatedTimeMin: 5 }))).toBe('Unos 30 minutos');
    expect(r.tiempoTotal(Array(14).fill({ estimatedTimeMin: 5 }))).toBe('Unas 1 hora y 10 minutos');
    expect(leer('pages', 'estudiante', 'repasos.vue')).not.toContain('~13 minutos');
  });

  it('nada en rojo de error: repasar no es una falla', () => {
    for (const estilo of Object.values(r.ESTILO_URGENCIA)) expect(estilo).not.toMatch(/semantico-falla|red-/);
    expect(leer('pages', 'estudiante', 'repasos.vue')).not.toMatch(/semantico-falla/);
  });

  it('un solo botón principal y el resto en lista; sin jerga («factor de estabilidad», «SM-2»)', () => {
    const p = leer('pages', 'estudiante', 'repasos.vue');
    expect((p.match(/Repasar ahora/g) ?? []).length).toBe(1);
    expect(p).not.toMatch(/factor de estabilidad|SM-2|Iniciar refuerzo/);
    expect(leer('stores', 'student.ts')).not.toContain('Crítico — Repasar hoy');
  });
});
