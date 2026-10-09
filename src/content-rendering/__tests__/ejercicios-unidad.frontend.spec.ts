import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Ejercicios de una lección dividido (PAT-01 y PAT-04; 05/10): el panel organiza la lista, useEjerciciosUnidad habla
// con la API y editar, archivar y «Mi banco» son ventanas sobre la base común (antes 852 líneas, sin atrapar el foco).
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  const requerir = (r: string) => cargar(r.replace(/^\.\//, ''));
  new Function('module', 'exports', 'require', js)(mod, mod.exports, requerir);
  return mod.exports as T;
}
type DelBanco = { activityId: number; title: string; difficulty: string; questionType: string | null };
const e = cargar<{
  nombreNivel: (d?: string | null) => string;
  nombreTipo: (t?: string | null) => string;
  casillasConPocosEjercicios: (b: DelBanco[]) => Array<{ level: string; typeName: string; activityId: number; title: string; tiene: number; recomendados: number }>;
  consultaBanco: (f: { type: string; difficulty: string; q: string }) => string;
  sinFiltros: (f: { type: string; difficulty: string; q: string }) => boolean;
}>('ejerciciosUnidad');

describe('reglas de los ejercicios de una lección', () => {
  it('nivel y tipo en palabras; sin tipo es «Práctica»', () => {
    expect(e.nombreNivel('avanzado')).toBe('Avanzado');
    expect(e.nombreNivel(undefined)).toBe('Básico');
    expect(e.nombreTipo(null)).toBe('Práctica');
    expect(e.nombreTipo('mcq')).not.toBe('mcq');
  });

  it('avisa las combinaciones tipo + nivel con menos parecidos de los recomendados: 3 en opción múltiple, 2 en el resto (BT-41)', () => {
    const b: DelBanco[] = [
      { activityId: 1, title: 'A', difficulty: 'basico', questionType: 'mcq' },
      { activityId: 2, title: 'B', difficulty: 'basico', questionType: 'mcq' },
      { activityId: 3, title: 'C', difficulty: 'avanzado', questionType: 'mcq' },
      { activityId: 4, title: 'D', difficulty: 'avanzado', questionType: 'mcq' },
      { activityId: 5, title: 'E', difficulty: 'avanzado', questionType: 'mcq' },
      { activityId: 6, title: 'F', difficulty: 'basico', questionType: 'ordering' },
      { activityId: 7, title: 'G', difficulty: 'basico', questionType: 'ordering' },
      { activityId: 8, title: 'H', difficulty: 'basico', questionType: 'coding' },
    ];
    expect(e.casillasConPocosEjercicios(b)).toEqual([
      { level: 'básico', typeName: e.nombreTipo('mcq'), activityId: 1, title: 'A', tiene: 2, recomendados: 3 },
      { level: 'básico', typeName: e.nombreTipo('coding'), activityId: 8, title: 'H', tiene: 1, recomendados: 2 },
    ]);
    expect(e.casillasConPocosEjercicios([])).toEqual([]);
  });

  it('la búsqueda del banco lleva solo los filtros puestos', () => {
    expect(e.consultaBanco({ type: '', difficulty: '', q: '  ' })).toBe('');
    expect(e.consultaBanco({ type: 'mcq', difficulty: '', q: ' bucle ' })).toBe('?type=mcq&q=bucle');
    expect(e.sinFiltros({ type: '', difficulty: '', q: ' ' })).toBe(true);
  });
});

describe('el panel organiza; el composable habla con la API; una ventana por componente', () => {
  const panel = leer('components', 'docente', 'UnitExercisesPanel.vue');
  const ventanas = ['VentanaEditarEjercicio', 'VentanaArchivarEjercicio', 'VentanaBancoEjercicios'];

  it('el panel no llama a la API y ya no tiene las ventanas dentro (antes 852 líneas)', () => {
    expect(panel).not.toMatch(/api\.(get|post|patch|put|del)\(/);
    expect(panel).toContain('provide(CLAVE_EJERCICIOS_UNIDAD, estado)');
    expect(panel).not.toContain('<Teleport');
    expect(panel.split('\n').length).toBeLessThan(200);
  });

  it('cada ventana usa la base común, que ahora admite ventanas anchas', () => {
    for (const v of ventanas) {
      expect(panel).toContain(`<DocenteEjercicios${v}`);
      expect(leer('components', 'docente', 'ejercicios', `${v}.vue`)).toContain('<AdminDialogo');
    }
    const base = leer('components', 'admin', 'AdminDialogo.vue');
    expect(base).toContain("const ANCHOS = { md: 'max-w-md', '2xl': 'max-w-2xl', '3xl': 'max-w-3xl' } as const");
    expect(leer('components', 'docente', 'ejercicios', 'VentanaEditarEjercicio.vue')).toContain('ancho="2xl"');
    expect(leer('components', 'docente', 'ejercicios', 'VentanaBancoEjercicios.vue')).toContain('ancho="3xl"');
  });

  it('al cerrar, el foco vuelve al botón que abrió la ventana; tras archivar, al título «Ejercicios»', () => {
    expect(panel).toContain(':id="`editar-ejercicio-${act.id}`"');
    expect(panel).toContain(':id="`archivar-ejercicio-${act.id}`"');
    expect(panel).toContain(':id="`abrir-banco-${unitId}`"');
    expect(leer('components', 'docente', 'ejercicios', 'VentanaEditarEjercicio.vue')).toContain(':devolver-foco="`editar-ejercicio-${ejercicio.id}`"');
    expect(leer('components', 'docente', 'ejercicios', 'VentanaArchivarEjercicio.vue')).toContain(':devolver-foco="`archivar-ejercicio-${ejercicio.id}`"');
    expect(leer('components', 'docente', 'ejercicios', 'VentanaBancoEjercicios.vue')).toContain(':devolver-foco="`abrir-banco-${unidadId}`"');
    expect(panel).toContain('nextTick(() => titulo.value?.focus())');
    // Archivar empieza en «Cancelar», lo seguro.
    expect(leer('components', 'docente', 'ejercicios', 'VentanaArchivarEjercicio.vue')).toMatch(/data-foco-inicial[^>]*>Cancelar/);
  });

  it('el editor de respuestas sigue validando antes de guardar y avisa si la variante quedó igual', () => {
    const editar = leer('components', 'docente', 'ejercicios', 'VentanaEditarEjercicio.vue');
    expect(editar).toContain('Se valida el editor de respuestas ANTES de guardar nada');
    expect(editar).toContain('La variante quedó igual al original');
  });

  it('una búsqueda que llega tarde no pisa la última en «Mi banco»', () => {
    expect(leer('components', 'docente', 'ejercicios', 'VentanaBancoEjercicios.vue')).toContain('if (este !== pedido) return');
  });

  it('sin «any»', () => {
    expect(leer('composables', 'useEjerciciosUnidad.ts')).not.toMatch(/:\s*any\b/);
    for (const v of ventanas) expect(leer('components', 'docente', 'ejercicios', `${v}.vue`)).not.toMatch(/:\s*any\b/);
  });
});
