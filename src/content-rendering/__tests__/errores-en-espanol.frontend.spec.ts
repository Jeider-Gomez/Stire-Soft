import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// 01/11, en «Tu primer console.log»: el panel «Salida» mostraba solo «SyntaxError: missing ) after argument list (línea 1)»,
// en inglés, a quien escribe su primer programa. La explicación ya existía, pero solo en la pestaña «Casos de prueba».
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');

const js = ts.transpileModule(leer('utils', 'diagnosticoSalida.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const mod = { exports: {} as Record<string, unknown> };
new Function('module', 'exports', js)(mod, mod.exports);
const { diagnosticarError, diagnosticarSalida } = mod.exports as {
  diagnosticarError: (o: string) => { tipo: string; mensaje: string; linea?: number } | null;
  diagnosticarSalida: (e: string, o: string, entrada?: string) => { tipo: string; mensaje: string } | null;
};

describe('Los errores de sintaxis más comunes, en palabras de estudiante', () => {
  it('«missing )»: paréntesis sin cerrar o texto sin comillas, con su línea', () => {
    const d = diagnosticarError('SyntaxError: missing ) after argument list (línea 1)');
    expect(d?.linea).toBe(1);
    expect(d?.mensaje).toContain('en la línea 1');
    expect(d?.mensaje).toContain('sin comillas');
    expect(d?.mensaje).not.toContain('missing');
  });

  it('una comilla sin cerrar', () => {
    expect(diagnosticarError('SyntaxError: Invalid or unexpected token (línea 2)')?.mensaje).toContain('comilla');
  });

  it('un paréntesis o una llave sin cerrar al final del código', () => {
    expect(diagnosticarError('SyntaxError: Unexpected end of input')?.mensaje).toContain('falta cerrarla');
  });

  it('los demás errores de sintaxis conservan la explicación general', () => {
    expect(diagnosticarError("SyntaxError: Unexpected token ';' (línea 3)")?.mensaje).toContain('no entiende cómo está escrito');
  });

  it('lo que no es un error no se explica como error', () => {
    expect(diagnosticarError('Ana vive en Montería')).toBeNull();
  });

  it('una salida casi igual dice qué revisar', () => {
    expect(diagnosticarSalida('Ana vive en Montería.', 'Ana vive en Montería')?.tipo).toBe('puntuacion');
  });
});

describe('Dónde se explica lo que pasó', () => {
  const panel = leer('components', 'exercise', 'SalidaPrograma.vue');

  it('al probar los ejemplos, dice qué revisar en «Casos de prueba», no en la consola', () => {
    expect(panel).not.toContain('diagnosticarSalida');
    expect(leer('components', 'exercise', 'CasoPrueba.vue')).toContain('{{ diagnostico.mensaje }}');
  });

  it('con «Probar con mis datos», explica el error del programa', () => {
    expect(panel).toContain('v-if="errorExplicado"');
    expect(panel).toContain("r.status === 'error' ? diagnosticarError(");
  });
});

describe('Un nombre conocido escrito con otras mayúsculas (simulación de un usuario novato, 20/11)', () => {
  it('«Console.log» dice cómo se escribe, con su línea', () => {
    const d = diagnosticarError('ReferenceError: Console is not defined (línea 5)');
    expect(d?.mensaje).toContain('se escribe «console»');
    expect(d?.mensaje).toContain('en la línea 5');
  });

  it('«console.Log» y «Leernumero» también', () => {
    expect(diagnosticarError('TypeError: console.Log is not a function (línea 2)')?.mensaje).toContain('se escribe «console.log»');
    expect(diagnosticarError('ReferenceError: Leernumero is not defined (línea 1)')?.mensaje).toContain('se escribe «leerNumero»');
  });

  it('una variable propia que no existe sigue con la pregunta general, sin inventar el nombre', () => {
    const d = diagnosticarError('ReferenceError: totl is not defined (línea 3)');
    expect(d?.mensaje).toContain('¿La creaste antes con const o let?');
    expect(d?.mensaje).not.toContain('se escribe');
  });
});

describe('Varias diferencias pequeñas a la vez (simulación de un usuario novato, 20/11)', () => {
  it('faltan un espacio y el punto: «las palabras están bien»', () => {
    expect(diagnosticarSalida('Vivo en Montería.', 'Vivo enMontería')?.mensaje).toContain('las palabras están bien');
  });

  it('una palabra distinta sigue diciendo dónde está la diferencia', () => {
    expect(diagnosticarSalida('Vivo en Montería.', 'Vivo en Cereté.')?.mensaje).toContain('primera diferencia');
  });
});
