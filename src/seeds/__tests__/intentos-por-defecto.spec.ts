import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { intentosPorDefecto } from '../cursos/tipos';

// 09/10, decisión de Jeider (BT-41): «en selección múltiple solo un intento, porque no hay nada formativo en dar más;
// mejor otro ejercicio hermano si lo quiere intentar de nuevo». El docente lo puede cambiar al crear el ejercicio.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
const js = ts.transpileModule(leer('utils', 'exerciseTypes.ts'), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText;
const mod = { exports: {} as Record<string, unknown> };
new Function('module', 'exports', js)(mod, mod.exports);
const delFormulario = (
  mod.exports as { intentosPorDefecto: (t: string) => number }
).intentosPorDefecto;

describe('intentos por defecto de un ejercicio', () => {
  it('opción múltiple, 1; programar y HTML/CSS, 5; el resto, 3', () => {
    expect(intentosPorDefecto('mcq')).toBe(1);
    expect(intentosPorDefecto('coding')).toBe(5);
    expect(intentosPorDefecto('html_css')).toBe(5);
    expect(intentosPorDefecto('ordering')).toBe(3);
  });

  it('los cursos y el formulario del docente usan el mismo valor', () => {
    for (const t of [
      'mcq',
      'coding',
      'html_css',
      'fill_code',
      'drag_drop',
      'matching',
      'ordering',
    ] as const) {
      expect(delFormulario(t)).toBe(intentosPorDefecto(t));
    }
    expect(
      readFileSync(
        path.join(
          __dirname,
          '..',
          '..',
          '..',
          'scripts',
          'cursos',
          'crear-cursos.ts',
        ),
        'utf8',
      ),
    ).toContain('attemptsAllowed: e.intentos ?? intentosPorDefecto(e.tipo)');
    // Al elegir el tipo, el formulario pone su valor por defecto; el docente lo puede cambiar después.
    expect(leer('pages', 'docente', 'ejercicios', 'crear.vue')).toContain(
      'form.attemptsAllowed = intentosPorDefecto(id)',
    );
  });
});
