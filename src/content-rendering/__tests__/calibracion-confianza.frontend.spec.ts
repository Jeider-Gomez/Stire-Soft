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
  it('en Mi progreso, dentro de «Cómo avanzas»; y en la ficha del estudiante del docente', () => {
    const progreso = leer('pages', 'estudiante', 'progreso.vue');
    expect(progreso).toContain('<EstudianteComoAvanzas />');
    expect(progreso).not.toContain('<EstudianteMiCalibracion />');
    // lo importante primero: el dominio por lección va antes que «Cómo avanzas» y los logros
    expect(progreso.indexOf('Cómo vas en cada lección')).toBeLessThan(progreso.indexOf('<EstudianteComoAvanzas />'));
    expect(progreso.indexOf('<EstudianteComoAvanzas />')).toBeLessThan(progreso.indexOf('<EstudianteResumenLogros />'));
    expect(leer('pages', 'docente', 'estudiante', '[studentId].vue')).toContain('<EstudianteMiCalibracion :student-id="Number(route.params.studentId)" docente />');
  });

  it('el componente pide la calibración al endpoint y las barras son accesibles', () => {
    const v = leer('components', 'estudiante', 'MiCalibracion.vue');
    expect(v).toContain('/analytics/student/${id}/calibracion');
    expect(v).toContain('role="progressbar"');
    expect(v).toContain(':aria-label=');
  });
});

// Pedido del dueño (04/10): «como Anki con sus escalas, pero lo determina el ejercicio» y que el estudiante sepa cómo
// funciona STIRE. utils/escalaResultados.ts sigue la misma regla que el servidor (spaced-repetition.ts, calidadDeRepaso).
describe('cada resultado contado como en Anki', () => {
  const e = cargar<{
    calidadDelResultado: (r: { aprobado: boolean; primerIntento: boolean; seguro: boolean }) => string;
    ORDEN_CALIDADES: string[];
  }>('escalaResultados');

  it('falló → Otra vez; varios intentos → Difícil; a la primera → Bien; a la primera y seguro → Fácil', () => {
    expect(e.calidadDelResultado({ aprobado: false, primerIntento: true, seguro: true })).toBe('otra-vez');
    expect(e.calidadDelResultado({ aprobado: true, primerIntento: false, seguro: true })).toBe('dificil');
    expect(e.calidadDelResultado({ aprobado: true, primerIntento: true, seguro: false })).toBe('bien');
    expect(e.calidadDelResultado({ aprobado: true, primerIntento: true, seguro: true })).toBe('facil');
    expect(e.ORDEN_CALIDADES).toEqual(['otra-vez', 'dificil', 'bien', 'facil']);
  });

  it('las claves son las mismas que cuenta el servidor', () => {
    const servidor = readFileSync(path.join(__dirname, '..', '..', 'common', 'utils', 'spaced-repetition.ts'), 'utf8');
    for (const c of e.ORDEN_CALIDADES) expect(servidor).toContain(`'${c}'`);
  });

  it('al calificar, el ejercicio dice cómo quedó para sus repasos; «Cómo avanzas» cuenta los de 30 días y explica el reto', () => {
    const ejercicio = leer('pages', 'estudiante', 'evaluacion', '[activityId].vue');
    expect(ejercicio).toContain('Para tus repasos: {{ CALIDADES[calidad].texto }}.');
    expect(ejercicio).toContain("seguro: workspaceStore.juicioConfianza === 'seguro' || route.query.reto === '1'");
    const como = leer('components', 'estudiante', 'ComoAvanzas.vue');
    expect(como).toContain('datos?.escala?.[c]');
    expect(como).toContain('¿Te sientes seguro? Toma un reto');
    expect(como).toContain('Cuando dijiste «Estoy seguro», acertaste');
  });
});
