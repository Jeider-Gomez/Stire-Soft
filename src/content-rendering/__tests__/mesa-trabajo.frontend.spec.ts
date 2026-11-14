// La mesa de trabajo del ejercicio (14/11, Jeider: «un poquito más de espacio en la parte del código… mover la disposición como si
// fueran ventanas… plegar y desplegar lo de los lados… reglas por cumplir o casos por cumplir a la izquierda»).
import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', 'require', js)(mod, mod.exports, () => ({}));
  return mod.exports as T;
}

type Lado = 'izquierda' | 'derecha';
type Id = 'clasica' | 'reglas' | 'codigo' | 'solo';
const M = cargar<{
  MEDIDAS: Record<'izquierda' | 'previa', { clave: string; inicial: number; min: number; max: number }>;
  acotarMedida: (v: number, min: number, max: number) => number;
  medidaDesdePuntero: (x: number, fila: { left: number; width: number }, lado: Lado) => number;
  medidaConTecla: (tecla: string, actual: number, m: { min: number; max: number }, lado: Lado, grande?: boolean) => number | null;
  VISTAS_WEB: Array<{ id: Id; nombre: string; ayuda: string; panelPlegado: boolean; previaPlegada: boolean; reglasIzquierda: boolean }>;
  vistaWebActual: (panel: boolean, previa: boolean, reglas: boolean) => Id | null;
  vistaWebDe: (id: Id) => { panelPlegado: boolean; previaPlegada: boolean; reglasIzquierda: boolean };
}>('mesaEjercicio');

describe('los divisores: el estudiante acomoda el ancho de cada panel', () => {
  it('el enunciado empieza más angosto que antes (40 %), para dar espacio al código', () => {
    expect(M.MEDIDAS.izquierda.inicial).toBeLessThan(40);
    for (const m of Object.values(M.MEDIDAS)) {
      expect(m.min).toBeLessThan(m.inicial);
      expect(m.inicial).toBeLessThan(m.max);
    }
  });
  it('el ancho sigue al puntero; el panel de la derecha crece al arrastrar hacia la izquierda', () => {
    const fila = { left: 100, width: 1000 };
    expect(M.medidaDesdePuntero(400, fila, 'izquierda')).toBe(30);
    expect(M.medidaDesdePuntero(400, fila, 'derecha')).toBe(70);
  });
  it('nunca deja un panel inservible: se acota a sus límites', () => {
    expect(M.acotarMedida(5, 20, 55)).toBe(20);
    expect(M.acotarMedida(90, 20, 55)).toBe(55);
    expect(M.acotarMedida(Number.NaN, 20, 55)).toBe(20);
  });
  it('también con el teclado: flechas de a 2 %, con Mayús de a 10 %, Inicio y Fin a los límites', () => {
    const m = { min: 20, max: 55 };
    expect(M.medidaConTecla('ArrowRight', 30, m, 'izquierda')).toBe(32);
    expect(M.medidaConTecla('ArrowLeft', 30, m, 'derecha')).toBe(32);
    expect(M.medidaConTecla('ArrowRight', 30, m, 'izquierda', true)).toBe(40);
    expect(M.medidaConTecla('Home', 30, m, 'izquierda')).toBe(20);
    expect(M.medidaConTecla('End', 30, m, 'izquierda')).toBe(55);
    expect(M.medidaConTecla('a', 30, m, 'izquierda')).toBeNull();
  });
  it('el divisor es accesible y no pierde el puntero sobre la vista previa', () => {
    const d = leer('components', 'exercise', 'Divisor.vue');
    expect(d).toContain('role="separator"');
    expect(d).toContain(':aria-valuenow="Math.round(modelValue)"');
    expect(d).toContain('tabindex="0"');
    expect(d).toContain('setPointerCapture');
    expect(d).toContain('body.arrastrando-divisor iframe { pointer-events: none; }');
  });
  it('el ancho se recuerda en este navegador, con try/catch', () => {
    const c = leer('composables', 'useMedidaRecordada.ts');
    expect(c).toContain('localStorage.setItem(clave, String(valor.value))');
    expect(c.match(/try \{/g)?.length).toBe(2);
  });
});

describe('las distribuciones de la página web', () => {
  it('son cuatro, con nombre y ayuda; una pone las reglas a la izquierda', () => {
    expect(M.VISTAS_WEB.map((v) => v.id)).toEqual(['clasica', 'reglas', 'codigo', 'solo']);
    expect(M.vistaWebDe('reglas')).toEqual(expect.objectContaining({ panelPlegado: false, previaPlegada: false, reglasIzquierda: true }));
    expect(M.vistaWebDe('solo')).toEqual(expect.objectContaining({ panelPlegado: true, previaPlegada: true }));
  });
  it('reconoce la distribución actual; «Solo código» no depende del lado de las reglas', () => {
    expect(M.vistaWebActual(false, false, false)).toBe('clasica');
    expect(M.vistaWebActual(false, false, true)).toBe('reglas');
    expect(M.vistaWebActual(true, true, true)).toBe('solo');
    expect(M.vistaWebActual(false, true, false)).toBeNull();
  });
  it('si el enunciado se pliega, las reglas vuelven bajo la vista previa: nunca quedan sin verse', () => {
    const h = leer('components', 'exercise', 'HtmlCssExercise.vue');
    expect(h).toContain('const reglasAqui = computed(() => !reglasIzquierda.value || enunciadoPlegado.value)');
    expect(h).toContain('<ExerciseReglasHtmlCss v-if="reglasAqui"');
    const p = leer('pages', 'estudiante', 'evaluacion', '[activityId].vue');
    expect(p).toContain(`<ExerciseReglasHtmlCss v-else-if="leftTab === 'reglas' && isHtmlCssActivity && reglasIzquierda"`);
  });
  it('la vista previa se pliega a una franja solo en pantalla grande (en el celular no habría cómo abrirla)', () => {
    const h = leer('components', 'exercise', 'HtmlCssExercise.vue');
    expect(h).toContain(`:class="{ 'lg:hidden': previaPlegada }"`);
    expect(h).toContain('texto="Ver la vista previa" lado="derecha"');
  });
  it('el enunciado tiene su divisor, y el selector de distribución va en la barra del editor', () => {
    expect(leer('pages', 'estudiante', 'evaluacion', '[activityId].vue')).toContain('etiqueta="Ancho del enunciado" lado="izquierda"');
    expect(leer('components', 'exercise', 'HtmlCssExercise.vue')).toContain('<ExerciseSelectorVistaWeb');
    expect(leer('components', 'exercise', 'SelectorVistaWeb.vue')).toContain(':aria-pressed="actual === v.id"');
  });
});
