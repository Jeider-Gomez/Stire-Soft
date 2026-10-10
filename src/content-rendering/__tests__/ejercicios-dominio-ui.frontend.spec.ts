import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// 09/10, Jeider: «tengo un ejercicio y no puedo seguir subiendo mi dominio»; «métele más UX y UI a eso de los ejercicios».
// Con el motor del dominio del servidor (4c4c04d): cada ejercicio dice cuánto sube, cada grupo cuánto lleva, y un ejercicio
// sin intentos se reabre a las 24 horas.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', 'require', js)(mod, mod.exports, () => ({}));
  return mod.exports as T;
}
type Ej = { id: number; titulo: string; nivel: string; tipo: string | null; estado: string; subeDominio: boolean; ganancia?: number; casillaPct?: number; reabreEn?: string | null; intentosUsados: number; intentosPermitidos: number };
const g = cargar<{
  etiquetaDe: (e: Ej, r: (i: string | null | undefined) => string | null) => { tipo: string; texto: string };
  agruparEjercicios: (e: Ej[]) => Array<{ nivel: string; grupos: Array<{ tipo: string | null; casillaPct: number; ejercicios: Ej[] }> }>;
  recomendado: (e: Ej[]) => Ej | null;
  resumenEjercicios: (e: Ej[], r: (i: string | null | undefined) => string | null) => string;
}>('ejerciciosPorGrupo');
const r = cargar<{
  intentosQueQuedan: (e: { maxAttempts?: number; usedAttempts?: number; intentoDisponible?: boolean }) => number;
  textoReabre: (iso: string | null | undefined) => string | null;
}>('resultadoEntrega');

const ej = (id: number, extra: Partial<Ej> = {}): Ej => ({ id, titulo: `E${id}`, nivel: 'basico', tipo: 'mcq', estado: 'por-hacer', subeDominio: true, ganancia: 10, casillaPct: 0, reabreEn: null, intentosUsados: 0, intentosPermitidos: 1, ...extra });
const reabre = () => 'el viernes a las 3:00 p. m.';

describe('«Ver todos los ejercicios» con el motor del dominio', () => {
  it('cada ejercicio dice qué pasa si lo hace ahora: cuánto sube, repasar, hecho, grupo completo o cuándo se reabre', () => {
    expect(g.etiquetaDe(ej(1, { ganancia: 12 }), reabre)).toEqual({ tipo: 'sube', texto: '+12 %' });
    expect(g.etiquetaDe(ej(1, { estado: 'hecho', ganancia: 3 }), reabre)).toEqual({ tipo: 'repaso', texto: 'Repasar · +3 %' });
    expect(g.etiquetaDe(ej(1, { estado: 'hecho', subeDominio: false, ganancia: 0 }), reabre)).toEqual({ tipo: 'hecho', texto: 'Hecho' });
    expect(g.etiquetaDe(ej(1, { estado: 'cuenta-otro', subeDominio: false, ganancia: 0 }), reabre)).toEqual({ tipo: 'completo', texto: 'Grupo completo' });
    expect(g.etiquetaDe(ej(1, { estado: 'sin-intentos', subeDominio: false, reabreEn: '2026-10-16T20:00:00Z' }), reabre)).toEqual({ tipo: 'reabre', texto: 'Se reabre el viernes a las 3:00 p. m.' });
  });

  it('agrupa por nivel y por grupo de parecidos, con cuánto lleva cada grupo', () => {
    const n = g.agruparEjercicios([ej(1, { casillaPct: 60 }), ej(2, { casillaPct: 60 }), ej(3, { tipo: 'ordering' }), ej(4, { nivel: 'intermedio' })]);
    expect(n.map((x) => x.nivel)).toEqual(['basico', 'intermedio']);
    expect(n[0].grupos.map((x) => [x.tipo, x.casillaPct, x.ejercicios.length])).toEqual([['mcq', 60, 2], ['ordering', 0, 1]]);
  });

  it('recomienda el que más sube; el resumen dice cuántos suman, o cuándo se reabre si ninguno', () => {
    expect(g.recomendado([ej(1, { ganancia: 5 }), ej(2, { ganancia: 9 }), ej(3, { ganancia: 9 })])!.id).toBe(2);
    expect(g.recomendado([ej(1, { subeDominio: false })])).toBeNull();
    expect(g.resumenEjercicios([ej(1), ej(2)], reabre)).toBe('2 ejercicios todavía suben tu dominio.');
    expect(g.resumenEjercicios([ej(1, { estado: 'sin-intentos', subeDominio: false, reabreEn: '2026-10-16T20:00:00Z' })], reabre)).toBe('Por ahora ninguno suma: se reabre un intento el viernes a las 3:00 p. m.');
    expect(g.resumenEjercicios([ej(1, { estado: 'hecho', subeDominio: false })], reabre)).toContain('Llegaste al máximo');
  });
});

describe('intentos que se reabren (la pantalla del ejercicio)', () => {
  it('con el límite usado, si el servidor reabrió uno, queda 1; si no, 0', () => {
    expect(r.intentosQueQuedan({ maxAttempts: 3, usedAttempts: 1 })).toBe(2);
    expect(r.intentosQueQuedan({ maxAttempts: 1, usedAttempts: 1, intentoDisponible: true })).toBe(1);
    expect(r.intentosQueQuedan({ maxAttempts: 1, usedAttempts: 1, intentoDisponible: false })).toBe(0);
  });

  it('dice cuándo se reabre en hora de Colombia', () => {
    expect(r.textoReabre('2026-10-16T20:00:00Z')).toMatch(/^el viernes a las 3:00/);
    expect(r.textoReabre(null)).toBeNull();
  });

  it('la pantalla y la ventana del resultado usan los intentos que se reabren; el aviso dice cuándo', () => {
    expect(leer('pages', 'estudiante', 'evaluacion', '[activityId].vue')).toContain('const remainingAttempts = computed(() => intentosQueQuedan(workspaceStore.currentExercise))');
    expect(leer('components', 'exercise', 'ResultadoEntrega.vue')).toContain('const quedanIntentos = computed(() => intentosQueQuedan(ej.value))');
    expect(leer('components', 'exercise', 'SinIntentos.vue')).toContain("Se reabre uno {{ reabre ?? 'mañana' }}");
    expect(leer('stores', 'workspace.ts')).toContain('intentoDisponible: activity.intentoDisponible === true');
  });
});

describe('la cabecera del ejercicio no dice «3 / 3» como si no quedara nada (10/10)', () => {
  it('con el límite usado y un intento reabierto (o de un refuerzo), dice «1 más disponible»', () => {
    const w = leer('layouts', 'workspace.vue');
    expect(w).toContain('workspaceStore.currentExercise.usedAttempts >= workspaceStore.currentExercise.maxAttempts && workspaceStore.currentExercise.intentoDisponible');
    expect(w).toContain('1 más disponible');
  });
});
