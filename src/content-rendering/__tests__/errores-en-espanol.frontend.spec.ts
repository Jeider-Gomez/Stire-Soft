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

describe('El panel «Salida» explica lo que pasó', () => {
  const panel = leer('components', 'exercise', 'SalidaPrograma.vue');

  it('al probar los ejemplos, dice qué revisar, sin dar la solución', () => {
    expect(panel).toContain('v-if="queRevisar"');
    expect(panel).toContain("resumen.value.estado === 'no-coincide' ? diagnosticarSalida(");
  });

  it('con «Probar con mis datos», explica el error del programa', () => {
    expect(panel).toContain('v-if="errorExplicado"');
    expect(panel).toContain("r.status === 'error' ? diagnosticarError(");
  });
});
