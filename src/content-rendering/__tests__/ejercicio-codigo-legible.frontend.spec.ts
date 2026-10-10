import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// 10/10, Jeider en «Área y perímetro» (entrada 3 y 4, salida 12 y 14): escribió lineas[3] y lineas[4] porque la base
// era 3; copió de los pasos `const resultado = /* tu cálculo */;`, que no es JavaScript válido; la pista ante el
// SyntaxError decía «la primera diferencia está en la línea 1»; «12» y «14» se veían «12 14»; tras probar, el caso
// decía «Ejemplo 1» en vez de la entrada; y el Tutor le dijo «¡Exacto!» sin ver que el programa no funcionaba.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

type D = { tipo: string; mensaje: string; linea?: number } | null;
const { diagnosticarSalida } = cargar<{ diagnosticarSalida: (e: string, o: string, i?: string) => D }>('diagnosticoSalida');
type Paso = { titulo: string; detalle: string; codigo?: string; datos?: Array<{ posicion: string; valor: string }>; metas?: Array<{ linea: number; esperado: string; ok?: boolean }> };
type Ejemplo = { input: string; expectedOutput: string; actualOutput?: string; passed?: boolean };
const { pasosCodigo } = cargar<{ pasosCodigo: (e: { codigo: string; ejemplo?: Ejemplo | null }) => Paso[] }>('pasosCodigo');
const PLANTILLA = "const lineas = require('fs').readFileSync(0, 'utf8').trim().split('\\n');\nconst base = Number(lineas[0]);\n";

describe('la pista ante un error de JavaScript', () => {
  it('un SyntaxError dice su línea y qué revisar, no «la primera diferencia está en la línea 1»', () => {
    const d = diagnosticarSalida('12\n14', "SyntaxError: Unexpected token ';' (línea 8)", '3\n4');
    expect(d?.tipo).toBe('sintaxis');
    expect(d?.linea).toBe(8);
    expect(d?.mensaje).toContain('en la línea 8');
    expect(d?.mensaje).toContain('/* … */ no cuenta como valor');
    expect(d?.mensaje).not.toContain('primera diferencia');
  });

  it('sin línea (servidor anterior) sigue explicando el error', () => {
    expect(diagnosticarSalida('12', "SyntaxError: Unexpected token ';'")?.mensaje).toContain('en tu código');
  });

  it.each([
    ['ReferenceError: perimetro is not defined (línea 9)', 'no-existe', '«perimetro»'],
    ["TypeError: Cannot read properties of undefined (reading 'trim') (línea 3)", 'indefinido', 'lineas[0]'],
    ['TypeError: Assignment to constant variable. (línea 5)', 'error', 'let'],
    ['RangeError: Invalid array length (línea 2)', 'error', 'Invalid array length'],
  ])('%s → %s', (obtenida, tipo, contiene) => {
    const d = diagnosticarSalida('12', obtenida);
    expect(d?.tipo).toBe(tipo);
    expect(d?.mensaje).toContain(contiene);
  });

  it('NaN por leer la posición equivocada: dice que la primera línea es lineas[0]', () => {
    const d = diagnosticarSalida('12\n14', 'NaN\nNaN', '3\n4');
    expect(d?.tipo).toBe('nan');
    expect(d?.mensaje).toContain('POSICIÓN, no el valor');
  });

  it('nunca trae la solución', () => {
    expect(diagnosticarSalida('12\n14', 'NaN\nNaN', '3\n4')?.mensaje).not.toMatch(/base \* altura|12|14/);
  });
});

describe('los pasos de un ejercicio con dos salidas', () => {
  const ejemplo: Ejemplo = { input: '3\n4', expectedOutput: '12\n14' };

  it('muestran qué hay en cada posición de lineas', () => {
    const recibe = pasosCodigo({ codigo: PLANTILLA, ejemplo }).find((p) => p.titulo === 'Lo que recibe tu programa');
    expect(recibe?.datos).toEqual([{ posicion: 'lineas[0]', valor: '3' }, { posicion: 'lineas[1]', valor: '4' }]);
    expect(recibe?.detalle).toContain('no es el valor');
  });

  it('parten la salida en una meta por línea, con su marca tras probar', () => {
    const antes = pasosCodigo({ codigo: PLANTILLA, ejemplo }).find((p) => p.metas);
    expect(antes?.titulo).toBe('Muestra 2 líneas, en este orden');
    expect(antes?.metas).toEqual([{ linea: 1, esperado: '12', ok: undefined }, { linea: 2, esperado: '14', ok: undefined }]);
    const despues = pasosCodigo({ codigo: PLANTILLA, ejemplo: { ...ejemplo, actualOutput: '12\n24', passed: false } }).find((p) => p.metas);
    expect(despues?.metas?.map((m) => m.ok)).toEqual([true, false]);
  });

  it('todo el código de ejemplo es JavaScript válido (se puede pegar sin un SyntaxError)', () => {
    for (const e of [ejemplo, { input: 'Ana', expectedOutput: 'Hola, Ana.' }]) {
      const codigos = pasosCodigo({ codigo: PLANTILLA, ejemplo: e }).map((p) => p.codigo).filter((c): c is string => !!c);
      expect(codigos.length).toBeGreaterThan(0);
      for (const c of codigos) expect(() => new Function(c)).not.toThrow();
    }
  });

  it('nunca dan la solución', () => {
    const todo = pasosCodigo({ codigo: PLANTILLA, ejemplo }).map((p) => `${p.detalle} ${p.codigo ?? ''}`).join('\n');
    expect(todo).not.toMatch(/base \* altura|2 \* \(/);
  });

  it('la pantalla dibuja los datos y las metas', () => {
    const vue = leer('components', 'exercise', 'PasosCodigo.vue');
    expect(vue).toContain('v-for="d in p.datos"');
    expect(vue).toContain('v-for="m in p.metas"');
  });
});

describe('la tarjeta del caso de prueba', () => {
  const vue = leer('components', 'exercise', 'CasoPrueba.vue');

  it('muestra la entrada y respeta los saltos de línea de cada salida', () => {
    expect(vue).toContain('Entra:');
    expect(vue).toContain("{{ tc.input || '(nada)' }}");
    expect(vue.match(/whitespace-pre-wrap/g)?.length).toBeGreaterThanOrEqual(3);
  });

  it('tras «Probar código» la entrada no se cambia por el título del caso', () => {
    expect(leer('stores', 'workspace.ts')).toContain('input: r.input || entradas[index] || r.label');
  });

  it('la página la usa con el diagnóstico solo cuando el caso falla', () => {
    expect(leer('pages', 'estudiante', 'evaluacion', '[activityId].vue')).toContain(':diagnostico="tc.passed === false ? diagnostico(tc) : null"');
  });
});

describe('lo que el Tutor recibe del último «Probar código»', () => {
  type Caso = { input: string; expectedOutput: string; actualOutput?: string; passed?: boolean };
  const { ultimaPruebaDe, contextoSegunPantalla } = cargar<{
    ultimaPruebaDe: (c: Caso[]) => unknown;
    contextoSegunPantalla: (r: string, e: unknown, c: unknown, s?: unknown, u?: unknown) => Record<string, unknown>;
  }>('contextoTutor');

  it('el primer caso que no coincide; sin probar o todo bien, nada', () => {
    expect(ultimaPruebaDe([{ input: '3\n4', expectedOutput: '12\n14', actualOutput: 'NaN', passed: false }])).toEqual({ entrada: '3\n4', esperada: '12\n14', obtenida: 'NaN' });
    expect(ultimaPruebaDe([{ input: '3', expectedOutput: '9' }])).toBeNull();
    expect(ultimaPruebaDe([{ input: '3', expectedOutput: '9', actualOutput: '9', passed: true }])).toBeNull();
  });

  it('viaja solo dentro de un ejercicio abierto', () => {
    const prueba = { entrada: '3', esperada: '9', obtenida: 'NaN' };
    const ej = { activityId: 23, title: 'Área', learningUnitId: 5, questionType: 'coding' };
    const codigo = { js: 'x', html: '', css: '' };
    expect(contextoSegunPantalla('/estudiante/evaluacion/23', ej, codigo, undefined, prueba).ultimaPrueba).toEqual(prueba);
    expect(contextoSegunPantalla('/estudiante/unidad/5', ej, codigo, undefined, prueba).ultimaPrueba).toBeUndefined();
    expect(leer('stores', 'tutor.ts')).toContain('ultimaPruebaDe(workspaceStore.publicTestCases)');
  });
});

// 10/10, Jeider: «si hubiera una mejor guía en el ejercicio de cómo hacerlo o qué debería ir a revisar».
describe('«Lo que vas a usar»: los conceptos que pide el ejercicio, con un ejemplo de otro problema', () => {
  type C = { clave: string; titulo: string; idea: string; ejemplo: string };
  const { conceptosDelEjercicio, CONCEPTOS } = cargar<{
    conceptosDelEjercicio: (e: { enunciado: string; plantilla: string; ejemplo?: { input: string; expectedOutput: string } | null; unidad?: string }) => C[];
    CONCEPTOS: Record<string, C>;
  }>('conceptosEjercicio');

  it('Área y perímetro: leer la entrada, convertir a número, operaciones y dos líneas', () => {
    const c = conceptosDelEjercicio({
      enunciado: 'Lee la **base** (primera línea) y la **altura** (segunda línea) de un rectángulo. Escribe en dos líneas: 1. El área (base × altura). 2. El perímetro (2 × (base + altura)).',
      plantilla: PLANTILLA,
      ejemplo: { input: '3\n4', expectedOutput: '12\n14' },
      unidad: 'Operadores y expresiones',
    });
    expect(c.map((x) => x.clave)).toEqual(['leer-entrada', 'convertir-numero', 'operaciones', 'varias-lineas']);
  });

  it('De minutos a horas: división entera y armar un texto', () => {
    const c = conceptosDelEjercicio({
      enunciado: 'Lee una cantidad de **minutos** y escríbela en horas y minutos con el formato `H h M min`. Pista: `Math.floor` y el operador `%`.',
      plantilla: PLANTILLA,
      ejemplo: { input: '135', expectedOutput: '2 h 15 min' },
    }).map((x) => x.clave);
    expect(c).toEqual(expect.arrayContaining(['division-entera', 'texto']));
    expect(c).not.toContain('varias-lineas');
  });

  it('cada ejemplo es JavaScript válido y de otro problema (no trae la solución de un ejercicio del curso)', () => {
    for (const c of Object.values(CONCEPTOS)) {
      expect(() => new Function(c.ejemplo)).not.toThrow();
      expect(c.ejemplo).not.toMatch(/base|altura|minutos/);
    }
  });

  it('la pantalla la muestra en programar, con el enlace a la lección', () => {
    const vue = leer('components', 'exercise', 'ConceptosEjercicio.vue');
    expect(vue).toContain('Lo que vas a usar');
    expect(vue).toContain('Repasar la lección');
    expect(leer('pages', 'estudiante', 'evaluacion', '[activityId].vue')).toContain('<ExerciseConceptosEjercicio v-if="isCodingActivity"');
  });

  it('cada error dice qué repasar, y la tarjeta muestra su ejemplo', () => {
    expect(diagnosticarSalida('12\n14', 'NaN\nNaN', '3\n4')?.repasar).toBe('leer-entrada');
    expect(diagnosticarSalida('8', '53', '5\n3')?.repasar).toBe('convertir-numero');
    expect(diagnosticarSalida('12', "SyntaxError: Unexpected token ';' (línea 8)")?.repasar).toBe('escribir-bien');
    const tarjeta = leer('components', 'exercise', 'CasoPrueba.vue');
    expect(tarjeta).toContain('Repasa: {{ repasar.titulo }}');
    expect(tarjeta).toContain('{{ repasar.ejemplo }}');
  });

  it('el Tutor recibe los mismos conceptos', () => {
    expect(leer('stores', 'tutor.ts')).toContain('conceptos: conceptosParaTutor()');
  });
});
