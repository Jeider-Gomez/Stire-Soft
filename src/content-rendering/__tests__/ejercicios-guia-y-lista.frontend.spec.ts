import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// 08/10, Jeider: (1) en programar «te dejan todo a ti»: pasos para resolver; (2) al volver a un ejercicio ya hecho, que
// avise que repetirlo es práctica; (3) «Ver todos los ejercicios» dice cuáles suben el dominio, nivel, tipo y peso.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

type Paso = { titulo: string; detalle: string; codigo?: string };
const { pasosCodigo } = cargar<{ pasosCodigo: (e: { codigo: string; ejemplo?: { input: string; expectedOutput: string } | null }) => Paso[] }>('pasosCodigo');
const PLANTILLA = "// Lee la entrada\nconst lineas = require('fs').readFileSync(0, 'utf8').trim().split('\\n');\nconst nombre = lineas[0];\n";

describe('los pasos para resolver un ejercicio de programar', () => {
  it('entrada → plantilla → cálculo → console.log → probar, con el ejemplo del ejercicio', () => {
    const p = pasosCodigo({ codigo: PLANTILLA, ejemplo: { input: 'Ana', expectedOutput: 'Hola, Ana.' } });
    expect(p.map((x) => x.titulo)).toEqual([
      'Mira qué entra y qué debe salir',
      'La plantilla ya lee la entrada por ti',
      'Haz el cálculo o arma el texto',
      'Muestra el resultado con console.log',
      'Pulsa «Probar código»',
    ]);
    expect(p[0].detalle).toContain('Si entra `Ana`, debe salir `Hola, Ana.`');
    expect(p[0].detalle.endsWith('`')).toBe(true);
    expect(p[1].detalle).not.toContain('Number');
  });

  it('si entran números, explica que llegan como texto y cómo convertirlos', () => {
    const p = pasosCodigo({ codigo: PLANTILLA, ejemplo: { input: '3\n4', expectedOutput: '7' } });
    expect(p[0].detalle).toContain('Si entran 2 líneas, `3`, `4`, debe salir `7`');
    expect(p[1].detalle).toContain('la segunda `lineas[1]`');
    expect(p[1].detalle).toContain('conviértelas con `Number(...)`');
    expect(p[1].codigo).toBe('const a = Number(lineas[0]);');
  });

  it('nunca da la solución: el cálculo queda para el estudiante', () => {
    const p = pasosCodigo({ codigo: PLANTILLA, ejemplo: { input: 'Ana', expectedOutput: 'Hola, Ana.' } });
    expect(p.map((x) => x.codigo ?? '').join('\n')).not.toContain('Hola');
  });

  it('la pantalla la muestra en programar, con la plantilla del ejercicio, y ofrece al Tutor', () => {
    const pagina = leer('pages', 'estudiante', 'evaluacion', '[activityId].vue');
    expect(pagina).toContain('<ExercisePasosCodigo v-if="isCodingActivity" :codigo="workspaceStore.currentExercise.initialCode"');
    expect(pagina).toContain('@por-pasos="resolverPorPasos"');
    expect(leer('components', 'exercise', 'PasosCodigo.vue')).toContain('Que el Tutor me guíe paso a paso');
  });
});

describe('al volver a un ejercicio ya aprobado', () => {
  it('avisa que repetirlo es práctica, qué pasa si se equivoca, y ofrece otro', () => {
    const v = leer('components', 'exercise', 'SinIntentos.vue');
    expect(v).toContain('<strong>Ya completaste este ejercicio.</strong>');
    expect(v).toContain('la lección vuelve antes a tus repasos');
    const pagina = leer('pages', 'estudiante', 'evaluacion', '[activityId].vue');
    expect(pagina).toContain("return remainingAttempts.value === 0 ? 'sin-intentos' : ej.yaAprobada ? 'completado' : 'revisar'");
    expect(leer('stores', 'workspace.ts')).toContain('yaAprobada: activity.yaAprobada === true');
  });

  it('después de entregar, también lleva al ejercicio que le faltó (antes quedaba «Volver a la lección»)', () => {
    const { pasoSiguiente } = cargar<{ pasoSiguiente: (e: unknown) => { primaria: { tipo: string; texto: string; activityId?: number } } }>('resultadoEntrega');
    const p = pasoSiguiente({ aprobado: true, quedanIntentos: 1, actividadActual: 10, recomendacion: { activityId: 7, title: 'X', reason: 'reintento', reasonMessage: '', allCompleted: false } });
    expect(p.primaria).toMatchObject({ tipo: 'ejercicio', activityId: 7, texto: 'Volver al que te faltó' });
  });
});

describe('«Ver todos los ejercicios» de la lección', () => {
  const v = leer('components', 'exercise', '..', 'estudiante', 'EjerciciosDeLaLeccion.vue');

  it('cada ejercicio dice con ícono, color y TEXTO si sube el dominio; y su tipo, peso e intentos', () => {
    for (const t of ["texto: 'Sube tu dominio'", "texto: 'Hecho'", "texto: 'Ya cuenta un parecido'", "texto: 'Sin intentos'"]) expect(v).toContain(t);
    expect(v).toContain('pesa {{ e.pesoPct }} % de la lección');
    expect(v).toContain('{{ tipoDe(e.tipo) }}');
  });

  it('agrupado por nivel, con el resumen arriba, y la lección lo usa en vez de la lista de nombres', () => {
    expect(v).toContain('Nivel {{ NIVEL[g.nivel] ?? g.nivel }}');
    expect(v).toContain('todavía suben');
    const leccion = leer('pages', 'estudiante', 'unidad', '[id].vue');
    expect(leccion).toContain('<EstudianteEjerciciosDeLaLeccion v-else-if="chooseManually" :unit-id="unitId" />');
    expect(leer('composables', 'useUnidadEstudiante.ts')).toContain('`/learning-progress/unit/${unitId}/mis-ejercicios`');
  });
});
