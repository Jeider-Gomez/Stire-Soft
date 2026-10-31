import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const js = ts.transpileModule(readFileSync(path.join(raiz, 'utils', 'contextoTutor.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const mod = { exports: {} as Record<string, unknown> };
new Function('module', 'exports', js)(mod, mod.exports);
type Ej = { activityId: number; title: string; learningUnitId?: number; questionType: string };
const { contextoSegunPantalla, plantillaConRespuestas } = mod.exports as {
  contextoSegunPantalla: (r: string, e: Ej | null, c: { js: string; html: string; css: string; completar?: string }) => Record<string, unknown>;
  plantillaConRespuestas: (p: string, r?: Record<string, string> | null) => string;
};
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

  // Jeider (29/10): en «Completa la presentación» el Tutor habló de leer la entrada con lineas[0], porque no veía la
  // plantilla y se inventó el programa (el búfer de código de otro ejercicio no es de este).
  it('un ejercicio de completar manda su plantilla con lo que ya escribió, y lo marca como completar', () => {
    const plantilla = '___a___ nombre = "Luisa";\nlet edad = ___b___;';
    const c = contextoSegunPantalla('/estudiante/evaluacion/30', { ...ultimoEjercicio, activityId: 30, questionType: 'fill_code' }, { ...codigo, completar: plantillaConRespuestas(plantilla, { a: 'const' }) });
    expect(c.currentCode).toBe('⟦const⟧ nombre = "Luisa";\nlet edad = ___b___;');
    expect(c.tipoEjercicio).toBe('completar');
    expect(c.currentCode).not.toContain('console.log(1)');
  });

  it('en los demás tipos (opción múltiple, ordenar…) no se manda el código de relleno de otro ejercicio', () => {
    const c = contextoSegunPantalla('/estudiante/evaluacion/31', { ...ultimoEjercicio, activityId: 31, questionType: 'mcq' }, codigo);
    expect(c).not.toHaveProperty('currentCode');
    expect(c).not.toHaveProperty('tipoEjercicio');
  });

  // Jeider (29/10): puso `let` en el primer hueco, el segundo seguía vacío y el Tutor dijo «perfecto» sin ver nada: la respuesta
  // solo llegaba al store con TODOS los huecos llenos.
  it('el Tutor ve lo que lleva escrito en los huecos aunque falten otros', () => {
    const lee = (...r: string[]) => readFileSync(path.join(raiz, ...r), 'utf8');
    expect(lee('components', 'exercise', 'FillCodeExercise.vue')).toContain('workspaceStore.huecosEscritos = { ...blankAnswers }');
    expect(lee('stores', 'tutor.ts')).toContain('workspaceStore.huecosEscritos');
    expect(lee('stores', 'tutor.ts')).not.toContain('workspaceStore.pendingAnswer?.blanks');
    expect(plantillaConRespuestas('___a___ n = ___b___;', { a: 'let', b: '' })).toBe('⟦let⟧ n = ___b___;');
  });

  it('los huecos vacíos o con espacios quedan como ___id___', () => {
    expect(plantillaConRespuestas('x = ___a___ + ___b___', { a: '  ', b: '2' })).toBe('x = ___a___ + ⟦2⟧');
    expect(plantillaConRespuestas('x = ___a___', null)).toBe('x = ___a___');
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

describe('Saludo del Tutor (02/10)', () => {
  it('dentro de un ejercicio el Tutor no saluda con repasos pendientes (29/10)', () => {
    const store = require('fs').readFileSync(require('path').join(__dirname, '..', '..', '..', 'frontend-nuxt', 'stores', 'tutor.ts'), 'utf8');
    expect(store).toContain(String.raw`if (opciones.conPregunta || /^\/estudiante\/evaluacion\/\d+/.test(route.path)) hasGreeted.value = true`);
  });

  it('cuando el servidor reemplaza el saludo anterior, la pantalla quita el viejo antes de mostrar el nuevo', () => {
    const store = require('fs').readFileSync(require('path').join(__dirname, '..', '..', '..', 'frontend-nuxt', 'stores', 'tutor.ts'), 'utf8');
    expect(store).toContain("if (res?.reemplazaAnterior && ultimo?.sender === 'tutor' && /^¡Buen(os días|as tardes|as noches)!/.test(ultimo.text)) messages.value.pop()");
  });
});
