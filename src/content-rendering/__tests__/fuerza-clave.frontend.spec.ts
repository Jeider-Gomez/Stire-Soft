import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { PASSWORD_COMPLEXITY_REGEX } from '../../common/validators/password-complexity';

// JEIDER-S08-12 (09/10): «la clave del registro era más dinámica antes (colores y una barra que se llenaba); ahora solo
// marca listo». Barra con color Y texto, con los colores de STIRE, sin quitar la lista de reglas.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
const js = ts.transpileModule(leer('utils', 'fuerzaClave.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const mod = { exports: {} as Record<string, unknown> };
new Function('module', 'exports', js)(mod, mod.exports);
const { fuerzaDeClave, reglasDeClave } = mod.exports as {
  fuerzaDeClave: (c: string) => { nivel: number; texto: string; consejo: string };
  reglasDeClave: (c: string) => Array<{ texto: string; cumple: boolean }>;
};

describe('fuerza de la clave al registrarse', () => {
  it('sube de débil a fuerte con lo que la hace difícil de adivinar', () => {
    expect(fuerzaDeClave('').nivel).toBe(0);
    expect(fuerzaDeClave('abc')).toMatchObject({ nivel: 1, texto: 'Débil', consejo: 'Le faltan 3 reglas.' });
    expect(fuerzaDeClave('Abcdef')).toMatchObject({ nivel: 1, consejo: 'Le falta 1 regla.' });
    expect(fuerzaDeClave('Abcde1')).toMatchObject({ nivel: 2, texto: 'Aceptable' });
    expect(fuerzaDeClave('Abcdefghi1')).toMatchObject({ nivel: 3, texto: 'Buena' });
    expect(fuerzaDeClave('Abcde1!')).toMatchObject({ nivel: 3, texto: 'Buena' });
    expect(fuerzaDeClave('Abcdefgh1!')).toMatchObject({ nivel: 4, texto: 'Fuerte' });
  });

  it('«Débil» es exactamente lo que el servidor rechaza: desde «Aceptable», el servidor la acepta', () => {
    for (const c of ['abc', 'Abcdef', 'abcde1', 'ABCDE1', 'Abcde1', 'Abcdefghi1', 'Abcdefgh1!', 'Ab1!xy']) {
      expect(fuerzaDeClave(c).nivel >= 2).toBe(PASSWORD_COMPLEXITY_REGEX.test(c));
      expect(reglasDeClave(c).every((r) => r.cumple)).toBe(PASSWORD_COMPLEXITY_REGEX.test(c));
    }
  });

  it('la barra usa los tokens de STIRE (fuerte: el degradado de la marca), dice el nivel en palabras y deja las reglas', () => {
    const v = leer('components', 'auth', 'FuerzaClave.vue');
    expect(v).toContain("4: 'bg-gradient-to-r from-stire-blue to-stire-purple'");
    expect(v).toContain('{{ fuerza.texto }}');
    expect(v).toContain('v-for="regla in reglas"');
    expect(v).not.toMatch(/#[0-9a-fA-F]{3,6}/);
    expect(leer('pages', 'auth', 'register.vue')).toContain('<AuthFuerzaClave id="reglas-clave" :clave="password" :falta="!!faltan.password" />');
  });
});
