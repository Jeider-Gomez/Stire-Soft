import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// P48, 31/10: Jeider, en «Saludo personalizado», pulsaba «Probar código» y no sabía dónde se veía el resultado; el enunciado
// quedaba debajo del aviso de «ya completaste». Ahora hay un panel «Salida» bajo el editor y el enunciado va primero.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

interface Caso { id: number; input: string; expectedOutput: string; actualOutput?: string; passed?: boolean }
interface Resumen { estado: string; caso: Caso | null; coinciden: number; total: number }
const { resumenDeSalida, siguientePaso } = cargar<{
  resumenDeSalida: (c: Caso[], ejecutando: boolean) => Resumen;
  siguientePaso: (r: Resumen) => string;
}>('salidaPrograma');

const ana: Caso = { id: 1, input: 'Ana', expectedOutput: 'Hola, Ana.' };

describe('Lo que muestra el panel «Salida»', () => {
  it('antes de probar dice que probar no gasta intentos, sin mostrar ningún caso', () => {
    const r = resumenDeSalida([ana], false);
    expect(r.estado).toBe('sin-probar');
    expect(r.caso).toBeNull();
    expect(siguientePaso(r)).toContain('no gasta intentos');
  });

  it('mientras se ejecuta lo dice', () => {
    expect(resumenDeSalida([ana], true).estado).toBe('ejecutando');
    expect(siguientePaso(resumenDeSalida([ana], true))).toContain('Ejecutando');
  });

  it('si el programa mostró lo esperado, dice que ya puede entregar y que entregar usa un intento', () => {
    const r = resumenDeSalida([{ ...ana, actualOutput: 'Hola, Ana.', passed: true }], false);
    expect(r.estado).toBe('coincide');
    expect(siguientePaso(r)).toContain('Entregar solución');
    expect(siguientePaso(r)).toContain('usa un intento');
    expect(siguientePaso(r)).toContain('también los que no ves');
  });

  it('si no coincide, muestra el primer caso que falla con lo que mostró y cuántos coinciden', () => {
    const ok: Caso = { id: 1, input: 'Ana', expectedOutput: 'Hola, Ana.', actualOutput: 'Hola, Ana.', passed: true };
    const mal: Caso = { id: 2, input: 'Luis', expectedOutput: 'Hola, Luis.', actualOutput: 'Hola,Luis.', passed: false };
    const r = resumenDeSalida([ok, mal], false);
    expect(r.estado).toBe('no-coincide');
    expect(r.caso).toBe(mal);
    expect(r.coinciden).toBe(1);
    expect(r.total).toBe(2);
    expect(siguientePaso(r)).toContain('no gasta intentos');
  });

  it('con varios ejemplos que coinciden, dice cuántos', () => {
    const casos: Caso[] = [1, 2, 3].map((id) => ({ id, input: String(id), expectedOutput: 'x', actualOutput: 'x', passed: true }));
    expect(siguientePaso(resumenDeSalida(casos, false))).toContain('Coinciden los 3 ejemplos');
  });

  it('sin casos públicos no falla', () => {
    expect(resumenDeSalida([], false)).toEqual({ estado: 'sin-probar', caso: null, coinciden: 0, total: 0 });
  });
});

describe('La pantalla del ejercicio de programar', () => {
  const pagina = leer('pages', 'estudiante', 'evaluacion', '[activityId].vue');
  const panel = leer('components', 'exercise', 'SalidaPrograma.vue');

  it('muestra el panel «Salida» bajo el editor, antes de la barra de estado, y abre el detalle de los casos', () => {
    const iPanel = pagina.indexOf('<ExerciseSalidaPrograma');
    expect(iPanel).toBeGreaterThan(pagina.indexOf('<CodeEditor'));
    expect(iPanel).toBeLessThan(pagina.indexOf('Barra de Estado Inferior del Editor'));
    expect(pagina).toContain(":casos=\"workspaceStore.publicTestCases\" :ejecutando=\"workspaceStore.isRunning\"");
    expect(pagina).toContain("@ver-casos=\"plegarPanel(false); leftTab = 'casos'\"");
  });

  it('en el panel del enunciado, el enunciado va antes que el aviso de «ya completaste» o «sin intentos»', () => {
    const enunciado = pagina.indexOf('<div class="prose prose-xs" v-html="formatMarkdown(workspaceStore.currentExercise.description)">');
    const aviso = pagina.indexOf('<ExerciseSinIntentos v-if="avisoEjercicio"');
    expect(enunciado).toBeGreaterThan(-1);
    expect(aviso).toBeGreaterThan(enunciado);
  });

  it('el panel avisa a los lectores de pantalla, dice qué gasta un intento y no depende solo del color', () => {
    expect(panel).toContain('role="status"');
    expect(panel).toContain('aria-live="polite"');
    expect(panel).toContain('Probar no gasta intentos · Entregar sí');
    expect(panel).toContain('Tu programa mostró');
    expect(panel).toContain('Se esperaba');
    expect(panel).toContain("$emit('ver-casos')");
  });
});
