import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Pegar la clave de Google en el campo del código de la clase: pasó en la prueba con usuarios finales y volvió a pasar
// en la simulación de un usuario novato en el navegador (20/11). El campo la pasaba a mayúsculas, la cortaba y no decía nada.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
const js = ts.transpileModule(leer('utils', 'codigoClase.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const mod = { exports: {} as Record<string, unknown> };
new Function('module', 'exports', js)(mod, mod.exports);
const { pareceClaveDeGoogle } = mod.exports as { pareceClaveDeGoogle: (t: string) => boolean };

describe('La clave de Google en el campo del código de la clase', () => {
  it('reconoce los dos formatos de clave de Google AI Studio, con espacios alrededor', () => {
    expect(pareceClaveDeGoogle('AIzaSyDummyClaveDePrueba0123456789abcd')).toBe(true);
    expect(pareceClaveDeGoogle('  AQ.Ab8RN6Ixx-yy_zz.0123456789abcdefghij  ')).toBe(true);
  });

  it('no confunde un código de clase real', () => {
    for (const codigo of ['ALGO-203413', 'SIM-1121-A', 'aiza', 'AIZA-2026', 'PENSAR-ALGO', '']) {
      expect(pareceClaveDeGoogle(codigo)).toBe(false);
    }
  });

  it.each([
    ['pages/auth/register.vue'],
    ['pages/auth/login.vue'],
    ['pages/estudiante/clases.vue'],
    ['components/presentacion/CodigoClase.vue'],
  ])('%s revisa lo que se escribe antes de darle forma de código', (archivo) => {
    expect(leer(...archivo.split('/'))).toMatch(/pareceClaveDeGoogle\(/);
  });

  it('en el registro, la clave pegada en el código se pasa al campo de la clave', () => {
    const registro = leer('pages', 'auth', 'register.vue');
    const funcion = registro.slice(registro.indexOf('function alEscribirCodigo'), registro.indexOf('// Pasos del registro'));
    expect(funcion).toMatch(/apiKey\.value = classCode\.value\.trim\(\)/);
    expect(funcion).toMatch(/classCode\.value = ''/);
  });
});
