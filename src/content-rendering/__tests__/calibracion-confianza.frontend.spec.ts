import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// META-02 mejorado (docs/DISENO_CONFIANZA.md): el juicio de confianza se guarda con la entrega y el estudiante ve su
// calibración con el tiempo; el docente la ve en la ficha del estudiante.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

type Lectura = (s: string) => { titulo: string; consejo: string };
const c = cargar<{ lecturaCalibracion: Lectura; lecturaParaDocente: Lectura }>('confianza');
const SESGOS = ['pocos-datos', 'sobreconfianza', 'subconfianza', 'calibrado'];

describe('la entrega guarda el juicio de confianza', () => {
  it('solo el de la primera entrega del ejercicio, y solo si respondió (omitir no manda nada)', () => {
    const ws = leer('stores', 'workspace.ts');
    expect(ws).toContain('...(juicioConfianza.value && currentExercise.value.usedAttempts === 0 ? { confianza: juicioConfianza.value } : {})');
  });
});

describe('la lectura de la calibración', () => {
  it('cada sesgo tiene una lectura distinta y una acción concreta, para el estudiante y para el docente', () => {
    for (const lectura of [c.lecturaCalibracion, c.lecturaParaDocente]) {
      const titulos = SESGOS.map((s) => lectura(s).titulo);
      expect(new Set(titulos).size).toBe(4);
      SESGOS.forEach((s) => expect(lectura(s).consejo.length).toBeGreaterThan(20));
    }
  });

  it('a la sobreconfianza le propone predecir la salida antes de entregar, no «estudia más»', () => {
    expect(c.lecturaCalibracion('sobreconfianza').consejo).toMatch(/predice qué debe mostrar/);
    expect(c.lecturaParaDocente('sobreconfianza').consejo).toMatch(/prediga la salida/);
  });

  it('con pocos datos explica cómo se llena (5 juicios), no muestra un juicio sin base', () => {
    expect(c.lecturaCalibracion('pocos-datos').consejo).toMatch(/Después de 5/);
  });
});

describe('dónde se ve', () => {
  it('en Mi progreso del estudiante y en la ficha del estudiante del docente', () => {
    expect(leer('pages', 'estudiante', 'progreso.vue')).toContain('<EstudianteMiCalibracion />');
    expect(leer('pages', 'docente', 'estudiante', '[studentId].vue')).toContain('<EstudianteMiCalibracion :student-id="Number(route.params.studentId)" docente />');
  });

  it('el componente pide la calibración al endpoint y las barras son accesibles', () => {
    const v = leer('components', 'estudiante', 'MiCalibracion.vue');
    expect(v).toContain('/analytics/student/${id}/calibracion');
    expect(v).toContain('role="progressbar"');
    expect(v).toContain(':aria-label=');
  });
});
