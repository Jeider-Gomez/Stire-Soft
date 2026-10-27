import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Bloque A del plan para llevar la evaluación heurística a 5 (docs/calidad/EVALUACION_HEURISTICA_PLAN_A_5.md), con el
// público de grado 10 a tercer semestre: lo que se mejora antes de que evalúe el equipo, sin esperar la remodelación.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

describe('Ítem 4: las palabras técnicas se explican donde aparecen', () => {
  // Cada pantalla del estudiante que habla de «dominio» lo explica ahí mismo, también en el celular (sin «title»).
  it.each([
    ['pages/estudiante/unidad/[id].vue'],
    ['pages/estudiante/index.vue'],
    ['pages/estudiante/progreso.vue'],
    ['components/estudiante/TuAvance.vue'],
    ['components/estudiante/MetaDeLaLeccion.vue'],
    ['components/exercise/SinIntentos.vue'],
  ])('%s explica «dominio» con el glosario', (archivo) => {
    expect(leer(archivo)).toMatch(/<Termino palabra="Dominio"/);
  });

  it('la pestaña de casos de prueba dice qué son, a la vista y sin jerga', () => {
    const pagina = leer('pages', 'estudiante', 'evaluacion', '[activityId].vue');
    expect(pagina).toContain("{{ definicion('Casos de prueba') }}");
    expect(pagina).not.toContain('Casos públicos de verificación');
    expect(pagina).not.toContain('[▶ Probar código]');
  });
});

type D = { tipo: string; mensaje: string; linea?: number } | null;
const { diagnosticarSalida } = cargar<{ diagnosticarSalida: (e: string, o: string, i?: string) => D }>('diagnosticoSalida');

describe('Ítems 3 y 28: los errores frecuentes de JavaScript en palabras de estudiante', () => {
  it.each([
    ['TypeError: total.toFixd is not a function (línea 4)', '«total.toFixd»', 'is not a function'],
    ["ReferenceError: Cannot access 'suma' before initialization (línea 2)", 'más arriba', 'before initialization'],
    ['RangeError: Maximum call stack size exceeded', 'sin parar', 'call stack'],
    ['TypeError: numero is not iterable (línea 6)', 'no es una lista', 'iterable'],
  ])('%s', (obtenida, explica, jerga) => {
    const d = diagnosticarSalida('12', obtenida);
    expect(d?.mensaje).toContain(explica);
    expect(d?.mensaje).not.toContain(jerga);
  });

  it('un error raro avisa que el detalle viene en inglés, con la línea', () => {
    const d = diagnosticarSalida('12', 'RangeError: Invalid array length (línea 2)');
    expect(d?.mensaje).toContain('en la línea 2');
    expect(d?.mensaje).toContain('JavaScript lo dice en inglés');
  });
});
