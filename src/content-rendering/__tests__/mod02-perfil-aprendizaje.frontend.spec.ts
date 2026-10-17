import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// MOD-02 (Pedro, 16/10): perfil de aprendizaje visible para el estudiante y su docente.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

type F = { visual: number; verbal: number; pctVisual: number | null; etiqueta: 'visual' | 'verbal' | 'equilibrado' | null };
type O = { enOrden: number; saltos: number; pctEnOrden: number | null; etiqueta: 'secuencial' | 'global' | 'equilibrado' | null };
const p = cargar<{
  fraseFormatos: (f: F, tu?: boolean) => string | null;
  fraseOrden: (o: O, tu?: boolean) => string | null;
  partesDominio: (d: { dominadas: number; enProceso: number; sinEmpezar: number; total: number }) => { dominado: number; proceso: number; pendiente: number };
}>('perfilAprendizaje');

describe('MOD-02: el perfil dice cómo estudia, con sus datos', () => {
  it('Visual / Verbal y Secuencial / Global en palabras, para el estudiante y para el docente', () => {
    expect(p.fraseFormatos({ visual: 7, verbal: 3, pctVisual: 70, etiqueta: 'visual' })).toBe('Más visual (70 %): eliges sobre todo el diagrama, el video o el ejemplo en vivo.');
    expect(p.fraseFormatos({ visual: 7, verbal: 3, pctVisual: 70, etiqueta: 'visual' }, false)).toMatch(/^Más visual \(70 %\): elige/);
    expect(p.fraseOrden({ enOrden: 4, saltos: 1, pctEnOrden: 80, etiqueta: 'secuencial' })).toBe('Secuencial (80 %): sigues las lecciones en el orden del plan.');
    expect(p.fraseOrden({ enOrden: 1, saltos: 4, pctEnOrden: 20, etiqueta: 'global' })).toBe('Global (80 %): saltas entre lecciones para ver el panorama.');
    expect(p.fraseOrden({ enOrden: 0, saltos: 1, pctEnOrden: null, etiqueta: null })).toBeNull();
  });

  it('el temario en verde, ámbar y gris suma 100', () => {
    expect(p.partesDominio({ dominadas: 2, enProceso: 1, sinEmpezar: 1, total: 4 })).toEqual({ dominado: 50, proceso: 25, pendiente: 25 });
    expect(p.partesDominio({ dominadas: 0, enProceso: 0, sinEmpezar: 0, total: 0 })).toEqual({ dominado: 0, proceso: 0, pendiente: 100 });
  });

  it('la tarjeta está en «Mi progreso» y en la ficha del docente, y los formatos elegidos se registran', () => {
    expect(leer('pages', 'estudiante', 'progreso.vue')).toContain('<EstudiantePerfilAprendizaje v-if="authStore.user?.id" :student-id="authStore.user.id" />');
    expect(leer('pages', 'docente', 'estudiante', '[studentId].vue')).toContain('<EstudiantePerfilAprendizaje :student-id="dashboard.studentId" docente />');
    const c = leer('components', 'estudiante', 'PerfilAprendizaje.vue');
    expect(c).toContain('Errores que se repiten');
    expect(c).toContain('Descuidos de escritura');
    expect(leer('components', 'AlgoritmoMultiformato.vue')).toContain('if (f !== formato.value) registrar(COMO_FORMATO[f])');
    expect(leer('components', 'EscucharLeccion.vue')).toContain("registrarFormato('escuchar')");
    expect(leer('composables', 'useUsoFormatos.ts')).toContain("if (auth.currentRole !== 'estudiante') return");
  });
});
