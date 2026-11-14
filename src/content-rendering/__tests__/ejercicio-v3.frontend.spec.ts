// El ejercicio de programar v3 (Fase D, paso 3; cuadro «E-Ejercicio» v9, aprobado por Jeider el 10/11).
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

type Paso = { clave: string; titulo: string; ayuda: string; estado: string };
type E = { cambio: boolean; ejecuto: boolean; cumple: boolean; entrego: boolean; intentos: number };
const C = cargar<{
  caminoEjercicio: (e: E) => Paso[];
  misionDelEjemplo: (e?: { input: string; expectedOutput: string } | null) => { entra: string[]; sale: string[]; frase: string } | null;
  unirConY: (v: string[]) => string;
}>('caminoEjercicio');

const nada: E = { cambio: false, ejecuto: false, cumple: false, entrego: false, intentos: 3 };
const estados = (e: E) => C.caminoEjercicio(e).map((p) => p.estado);

describe('el camino: Escribe → Ejecuta → Prueba casos → Entrega', () => {
  it('al llegar, lo que sigue es escribir; y dice cuánto cuesta cada paso', () => {
    const c = C.caminoEjercicio(nada);
    expect(c.map((p) => p.titulo)).toEqual(['Escribe', 'Ejecuta', 'Prueba casos', 'Entrega']);
    expect(c.map((p) => p.estado)).toEqual(['actual', 'pendiente', 'pendiente', 'pendiente']);
    expect(c[1].ayuda).toContain('no cuenta');
    expect(c[2].ayuda).toContain('no gasta intentos');
    expect(c[3].ayuda).toBe('se califica · gasta 1 de 3');
  });
  it('es una guía, no un candado: se puede probar los casos sin ejecutar con sus datos', () => {
    expect(estados({ ...nada, cambio: true, cumple: true })).toEqual(['hecho', 'actual', 'hecho', 'pendiente']);
  });
  it('probar los casos y fallar no marca «Prueba casos»: la pregunta es «¿cumples?»', () => {
    expect(estados({ ...nada, cambio: true, ejecuto: true })).toEqual(['hecho', 'hecho', 'actual', 'pendiente']);
  });
  it('en la página web: Escribe → Mira → Probar (las reglas) → Entrega', () => {
    const w = (C.caminoEjercicio as unknown as (e: E, t: string) => Paso[])({ ...nada, cambio: true, ejecuto: true }, 'web');
    expect(w.map((p) => p.titulo)).toEqual(['Escribe', 'Mira', 'Probar', 'Entrega']);
    expect(w.map((p) => p.estado)).toEqual(['hecho', 'hecho', 'actual', 'pendiente']);
    expect(w[2].ayuda).toBe('revisa las reglas · no gasta intentos');
  });
  it('va bajo la cabecera del ejercicio de programar, y «Ejecuta» lo marca «Probar con mis datos»', () => {
    expect(leer('layouts', 'workspace.vue')).toContain(`<ExerciseCaminoEjercicio v-if="isCodingActivity || isHtmlCssActivity" :tipo="isHtmlCssActivity ? 'web' : 'codigo'" />`);
    expect(leer('composables', 'useProbarConMisDatos.ts')).toContain("useState<number | null>('ejecuto-con-mis-datos', () => null).value = ws.currentExercise.activityId");
    expect(leer('components', 'exercise', 'CaminoEjercicio.vue')).toContain(":aria-current=\"p.estado === 'actual' ? 'step' : undefined\"");
  });
});

describe('«Tu misión»: lo que recibe y lo que muestra, con el ejemplo del docente', () => {
  it('parte el ejemplo en líneas y lo dice en una frase', () => {
    expect(C.misionDelEjemplo({ input: '3\n4\n', expectedOutput: '12\n14' })).toEqual({
      entra: ['3', '4'], sale: ['12', '14'], frase: 'Ejemplo: si entran «3» y «4», debe mostrar «12» y «14».',
    });
  });
  it('sin datos de entrada lo dice; sin ejemplo, no inventa nada', () => {
    expect(C.misionDelEjemplo({ input: '', expectedOutput: 'Hola' })?.frase).toBe('Ejemplo: sin datos de entrada, debe mostrar «Hola».');
    expect(C.misionDelEjemplo(null)).toBeNull();
    expect(C.unirConY(['a', 'b', 'c'])).toBe('a, b y c');
  });
  it('va primero en «Lo que pide el profe», y no repite el ejemplo si el profe ya lo escribió', () => {
    const p = leer('pages', 'estudiante', 'evaluacion', '[activityId].vue');
    expect(p).toContain('Lo que pide el profe</span>');
    expect(p).toContain('Prueba de casos</span>');
    expect(p.indexOf('<ExerciseMisionEjercicio')).toBeLessThan(p.indexOf('<ExerciseConceptosEjercicio'));
    expect(leer('components', 'exercise', 'MisionEjercicio.vue')).toContain('v-if="!/ejemplo/i.test(enunciado)"');
  });
});

describe('«Lo que necesitas saber» y «Hazlo en N pasos» (segunda parte del v9)', () => {
  const K = cargar<{ conceptosDelEjercicio: (e: { enunciado: string; plantilla: string; ejemplo?: { input: string; expectedOutput: string } | null }) => Array<{ clave: string; codigo: string }> }>('conceptosEjercicio');

  it('cada concepto dice lo que se escribe; para leer, lo mismo que usa la plantilla', () => {
    const c = K.conceptosDelEjercicio({ enunciado: 'Calcula el área', plantilla: 'const base = leerNumero();', ejemplo: { input: '3\n4', expectedOutput: '12\n14' } });
    expect(c.find((x) => x.clave === 'leer-entrada')?.codigo).toBe('leerNumero()');
    expect(c.every((x) => x.codigo.length > 0)).toBe(true);
    expect(K.conceptosDelEjercicio({ enunciado: 'Saluda', plantilla: 'const n = leerTexto();', ejemplo: { input: 'Ana', expectedOutput: 'Hola, Ana.' } })[0].codigo).toBe('leerTexto()');
  });

  it('los pasos van antes que lo que necesitas saber, y el Tutor queda como último recurso', () => {
    const p = leer('pages', 'estudiante', 'evaluacion', '[activityId].vue');
    expect(p.indexOf('<ExercisePasosCodigo')).toBeLessThan(p.indexOf('<ExerciseConceptosEjercicio'));
    const pasos = leer('components', 'exercise', 'PasosCodigo.vue');
    expect(pasos).toContain('Hazlo en {{ pasos.length }} pasos');
    expect(pasos).toContain('¿Sigues sin saber por dónde empezar?');
    expect(leer('components', 'exercise', 'ConceptosEjercicio.vue')).toContain('`/estudiante/unidad/${learningUnitId}#explicacion`');
  });
});

describe('los demás tipos, en una columna (cuadros E-Tipo-*)', () => {
  it('«Pedir una pista» va junto a «Entregar respuesta», antes de gastar un intento', () => {
    const p = leer('pages', 'estudiante', 'evaluacion', '[activityId].vue');
    const pista = p.indexOf('@click="pedirAyudaAlTutor"><TutorMascota expresion="contento" :tamano="22" aria-hidden="true" />Pedir una pista</button>');
    expect(pista).toBeGreaterThan(0);
    expect(pista).toBeLessThan(p.indexOf("'Entregar respuesta'"));
    expect(p).toContain('class="fondo-tipo flex-1');
  });
});
