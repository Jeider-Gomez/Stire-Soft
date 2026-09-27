import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
// frontend-nuxt/utils/plural.ts, la función REAL que usan las pantallas. Jest no compila frontend-nuxt/, así que se
// transpila aquí igual que en code-segments.consistency.spec.ts.
type Plural = (count: number, singular: string, pluralForm: string) => string;

function loadPlural(): Plural {
  const file = path.join(__dirname, '..', '..', '..', 'frontend-nuxt', 'utils', 'plural.ts');
  const js = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
  }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports['plural'] as Plural;
}

const plural = loadPlural();

// Las pantallas mostraban «1 días» (racha del estudiante) y «1 administradores» (estado del sistema).
describe('plural (frontend-nuxt/utils/plural.ts)', () => {
  it('usa el singular solo con 1', () => {
    expect(plural(1, 'día', 'días')).toBe('1 día');
    expect(plural(1, 'administrador', 'administradores')).toBe('1 administrador');
  });

  it('usa el plural con 0 y con más de 1', () => {
    expect(plural(0, 'día', 'días')).toBe('0 días');
    expect(plural(3, 'día', 'días')).toBe('3 días');
  });
});
