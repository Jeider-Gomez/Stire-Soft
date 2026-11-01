import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// 01/11, abriendo «Tu primer console.log» como Santiago: decía «Entra: Muestra el mensaje exacto» (el nombre del caso), pedía
// «Decidir con if» por la palabra «paréntesis» y guiaba con `"Recibí: " + dato`, una variable que ese programa no tiene.
const raiz = path.join(__dirname, '..', '..', '..');
const front = (...p: string[]) => readFileSync(path.join(raiz, 'frontend-nuxt', ...p), 'utf8');

function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(front('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

const { conceptosDelEjercicio } = cargar<{
  conceptosDelEjercicio: (e: { enunciado: string; plantilla: string; ejemplo?: { input: string; expectedOutput: string } | null; unidad?: string }) => Array<{ clave: string }>;
}>('conceptosEjercicio');
const { pasosCodigo } = cargar<{
  pasosCodigo: (e: { codigo: string; ejemplo?: { input: string; expectedOutput: string } | null }) => Array<{ titulo: string; detalle: string; codigo?: string }>;
}>('pasosCodigo');

const claves = (enunciado: string) =>
  conceptosDelEjercicio({ enunciado, plantilla: '', ejemplo: { input: '', expectedOutput: '42' } }).map((c) => c.clave);

describe('Lo que vas a usar: solo lo que el ejercicio pide', () => {
  it('«paréntesis» no pide decidir con if; «par» e «impar» sí', () => {
    expect(claves('Dentro de los paréntesis pon el mensaje.')).not.toContain('decisiones');
    expect(claves('Dime si el número es par.')).toContain('decisiones');
    expect(claves('Muestra si es impar.')).toContain('decisiones');
  });

  it('las negritas de Markdown no cuentan como multiplicación; el signo × y la palabra sí', () => {
    expect(claves('Tu primer programa **muestra un mensaje**.')).not.toContain('operaciones');
    expect(claves('Calcula 3 × 4.')).toContain('operaciones');
    expect(claves('Haz la suma.')).toContain('operaciones');
  });
});

describe('Paso a paso de un programa que no recibe datos', () => {
  const pasos = pasosCodigo({ codigo: '// Escribe aquí', ejemplo: { input: '', expectedOutput: '¡Hola, STIRE!' } });
  const todo = JSON.stringify(pasos);

  it('dice que no entra nada y qué debe salir', () => {
    expect(pasos[0].detalle).toContain('Si no entra nada');
    expect(pasos[0].detalle).toContain('¡Hola, STIRE!');
  });

  it('no usa variables que el programa no tiene', () => {
    expect(todo).not.toContain('dato');
    expect(todo).not.toContain('console.log(mensaje)');
    expect(todo).toContain('console.log(\\"Buenos días\\")');
  });

  it('con datos que entran conserva la guía de siempre', () => {
    const conDatos = JSON.stringify(pasosCodigo({ codigo: 'const a = leerTexto();', ejemplo: { input: 'Ana', expectedOutput: 'Hola, Ana.' } }));
    expect(conDatos).toContain('Haz el cálculo o arma el texto');
    expect(conDatos).toContain('console.log(mensaje)');
  });
});

describe('El caso que no recibe datos', () => {
  const store = front('stores', 'workspace.ts');

  it('no muestra el nombre del caso como si fuera la entrada, ni al cargar ni después de probar', () => {
    expect(store).not.toContain('input: tc.input || tc.label');
    expect(store).not.toContain('entradas[index] || r.label');
    expect(store).toContain("input: typeof tc.input === 'string' ? tc.input : ''");
  });

  it('el panel de salida no pide «lo que entra» a un programa que no recibe nada', () => {
    const panel = front('components', 'exercise', 'SalidaPrograma.vue');
    expect(panel).toContain('v-if="recibeDatos"');
  });
});

describe('El orden de los ejercicios en la carga del curso', () => {
  const script = readFileSync(path.join(raiz, 'scripts', 'cursos', 'crear-cursos.ts'), 'utf8');

  it('se envía la posición al crear y al actualizar, para que uno agregado después quede en su sitio', () => {
    expect(script).toContain('order: orden,');
    expect(script).toContain('{ description: e.enunciado, order: orden }');
    expect(script).toContain('u.ejercicios.entries()');
  });
});
