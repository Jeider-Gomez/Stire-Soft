import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// 31/10, Jeider en «Saludo personalizado»: «un arreglo que no sé ni qué es». Los ejercicios básicos ya no traen las dos
// líneas con `lineas` y `require('fs')`: piden el dato con leerTexto() o leerNumero() (el juez las define en
// src/judge-engine/sandbox-lectura.ts). Lo que la pantalla le cuenta al estudiante tiene que decir lo mismo.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

type Paso = { titulo: string; detalle: string; codigo?: string; datos?: Array<{ posicion: string; valor: string }> };
type Ejemplo = { input: string; expectedOutput: string };
const { pasosCodigo } = cargar<{ pasosCodigo: (e: { codigo: string; ejemplo?: Ejemplo | null }) => Paso[] }>('pasosCodigo');
const { conceptosDelEjercicio } = cargar<{
  conceptosDelEjercicio: (e: { enunciado: string; plantilla: string; ejemplo?: Ejemplo | null }) => Array<{ clave: string; idea: string; ejemplo: string }>;
}>('conceptosEjercicio');

describe('Los ejercicios piden el dato con leerTexto() y leerNumero()', () => {
  const saludo = { input: 'Ana', expectedOutput: 'Hola, Ana. Bienvenido a Algoritmia.' };
  const medidas = { input: '3\n4', expectedOutput: '12\n14' };

  it('el paso «Lo que recibe tu programa» explica leerTexto() sin hablar de posiciones', () => {
    const paso = pasosCodigo({ codigo: 'const nombre = leerTexto();', ejemplo: saludo }).find((p) => p.titulo === 'Lo que recibe tu programa');
    expect(paso?.detalle).toContain('leerTexto()');
    expect(paso?.detalle).not.toContain('lineas');
    expect(paso?.datos).toEqual([{ posicion: '1.ª vez', valor: 'Ana' }]);
    expect(paso?.codigo).toContain('leerTexto()');
  });

  it('con datos numéricos recomienda leerNumero() y muestra una vez por cada línea que entra', () => {
    const paso = pasosCodigo({ codigo: 'const base = leerNumero();\nconst altura = leerNumero();', ejemplo: medidas }).find((p) => p.titulo === 'Lo que recibe tu programa');
    expect(paso?.detalle).toContain('usa `leerNumero()`');
    expect(paso?.datos).toEqual([{ posicion: '1.ª vez', valor: '3' }, { posicion: '2.ª vez', valor: '4' }]);
  });

  it('el código que todavía usa `lineas` conserva su explicación de posiciones', () => {
    const plantilla = "const lineas = require('fs').readFileSync(0, 'utf8').trim().split('\\n');\nconst a = Number(lineas[0]);";
    const paso = pasosCodigo({ codigo: plantilla, ejemplo: { input: '3', expectedOutput: '6' } }).find((p) => p.titulo === 'Lo que recibe tu programa');
    expect(paso?.datos?.[0].posicion).toBe('lineas[0]');
  });

  it('el concepto «Leer lo que entra» sale con leerTexto/leerNumero y habla de la siguiente línea', () => {
    const c = conceptosDelEjercicio({ enunciado: 'Saluda.', plantilla: 'const nombre = leerTexto();', ejemplo: saludo });
    const leerEntrada = c.find((x) => x.clave === 'leer-entrada');
    expect(leerEntrada?.idea).toContain('leerTexto()');
    expect(leerEntrada?.idea).toContain('siguiente línea');
    expect(leerEntrada?.ejemplo).not.toContain('lineas');
  });

  it('con leerNumero() ya no se explica «convertir texto en número»: el dato llega como número', () => {
    const c = conceptosDelEjercicio({ enunciado: 'Calcula el área.', plantilla: 'const base = leerNumero();', ejemplo: medidas });
    expect(c.map((x) => x.clave)).not.toContain('convertir-numero');
  });

  it('con `lineas` sigue explicándose la conversión con Number(...)', () => {
    const c = conceptosDelEjercicio({ enunciado: 'Calcula el área.', plantilla: 'const base = Number(lineas[0]);', ejemplo: medidas });
    expect(c.map((x) => x.clave)).toContain('convertir-numero');
  });

  it('el diagnóstico de NaN y undefined orienta a pedir cada dato en orden, sin dejar de explicar `lineas`', () => {
    const diag = leer('utils', 'diagnosticoSalida.ts');
    expect(diag).toContain('pide cada dato en orden con leerTexto() o leerNumero()');
    expect(diag).toContain('la primera línea que entra es lineas[0]');
  });
});
