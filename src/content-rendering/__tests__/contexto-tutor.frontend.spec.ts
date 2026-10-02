import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const js = ts.transpileModule(readFileSync(path.join(raiz, 'utils', 'contextoTutor.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const mod = { exports: {} as Record<string, unknown> };
new Function('module', 'exports', js)(mod, mod.exports);
type Ej = { activityId: number; title: string; learningUnitId?: number; questionType: string };
const { contextoSegunPantalla } = mod.exports as { contextoSegunPantalla: (r: string, e: Ej | null, c: { js: string; html: string; css: string }) => Record<string, unknown> };
const codigo = { js: 'console.log(1)', html: '<h1>a</h1>', css: 'h1{}' };
const ultimoEjercicio: Ej = { activityId: 20, title: 'Saludo personalizado', learningUnitId: 5, questionType: 'coding' };

// Jeider probó el Tutor (02/10/2026) y no sabía en qué lección estaba: se mandaba la unidad recomendada y el último
// ejercicio visitado aunque ya se hubiera salido de él.
describe('Contexto que la pantalla le manda al Tutor', () => {
  it('leyendo una lección: la unidad de ESA lección, sin el último ejercicio ni su código', () => {
    expect(contextoSegunPantalla('/estudiante/unidad/31', ultimoEjercicio, codigo)).toEqual({ currentRoute: '/estudiante/unidad/31', learningUnitId: 31 });
  });

  it('en un ejercicio: ese ejercicio, su unidad y su código', () => {
    expect(contextoSegunPantalla('/estudiante/evaluacion/20', ultimoEjercicio, codigo)).toEqual({
      currentRoute: '/estudiante/evaluacion/20', learningUnitId: 5, activityId: 20, activityTitle: 'Saludo personalizado', currentCode: 'console.log(1)',
    });
  });

  it('un ejercicio de HTML y CSS manda los dos archivos como html', () => {
    const c = contextoSegunPantalla('/estudiante/evaluacion/40', { ...ultimoEjercicio, activityId: 40, questionType: 'html_css' }, codigo);
    expect(c.codeLanguage).toBe('html');
    expect(c.currentCode).toContain('<h1>a</h1>');
    expect(c.currentCode).toContain('h1{}');
  });

  it('si el ejercicio cargado es otro (todavía cargando), no se manda el viejo', () => {
    expect(contextoSegunPantalla('/estudiante/evaluacion/99', ultimoEjercicio, codigo)).toEqual({ currentRoute: '/estudiante/evaluacion/99' });
  });

  it('en el inicio, progreso o repasos: solo dónde está, sin inventar lección ni ejercicio', () => {
    for (const r of ['/estudiante', '/estudiante/progreso', '/estudiante/repasos']) expect(contextoSegunPantalla(r, ultimoEjercicio, codigo)).toEqual({ currentRoute: r });
  });

  it('el store del Tutor usa esta función y ya no la «unidad recomendada»', () => {
    const store = readFileSync(path.join(raiz, 'stores', 'tutor.ts'), 'utf8');
    expect(store).toContain('contextoSegunPantalla(route.path');
    expect(store).not.toContain('studentStore.activeUnit');
  });
});
