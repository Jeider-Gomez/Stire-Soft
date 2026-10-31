import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// 31/10, Jeider en «Saludo personalizado»: «se desplegó y no pude quitarla», «quisiera tener diferentes vistas» y «que funcione en la
// consola de verdad». La salida se oculta y se muestra, hay tres vistas, y «Probar con mis datos» ejecuta el código con lo que el
// estudiante escribe (POST /submissions/:id/run con `input`, el mismo juez que califica).
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

type Id = 'estandar' | 'codigo' | 'solo';
const { VISTAS_DEL_EJERCICIO, vistaActual, plegadosDe } = cargar<{
  VISTAS_DEL_EJERCICIO: Array<{ id: Id; nombre: string; ayuda: string; panelPlegado: boolean; salidaPlegada: boolean }>;
  vistaActual: (panel: boolean, salida: boolean) => Id | null;
  plegadosDe: (id: Id) => { panelPlegado: boolean; salidaPlegada: boolean };
}>('vistaEjercicio');

describe('Las vistas del ejercicio de programar', () => {
  it('son tres, con nombre y ayuda, y cada una es una combinación distinta de enunciado y salida plegados', () => {
    expect(VISTAS_DEL_EJERCICIO.map((v) => v.id)).toEqual(['estandar', 'codigo', 'solo']);
    expect(new Set(VISTAS_DEL_EJERCICIO.map((v) => `${v.panelPlegado}-${v.salidaPlegada}`)).size).toBe(3);
    for (const v of VISTAS_DEL_EJERCICIO) {
      expect(v.nombre.length).toBeGreaterThan(0);
      expect(v.ayuda.length).toBeGreaterThan(0);
    }
  });

  it('«Estándar» deja a la vista el enunciado y la salida; «Código grande» esconde solo el enunciado; «Solo código» esconde los dos', () => {
    expect(plegadosDe('estandar')).toEqual({ panelPlegado: false, salidaPlegada: false });
    expect(plegadosDe('codigo')).toEqual({ panelPlegado: true, salidaPlegada: false });
    expect(plegadosDe('solo')).toEqual({ panelPlegado: true, salidaPlegada: true });
  });

  it('reconoce la vista actual según lo plegado, y una combinación propia no marca ninguna', () => {
    expect(vistaActual(false, false)).toBe('estandar');
    expect(vistaActual(true, false)).toBe('codigo');
    expect(vistaActual(true, true)).toBe('solo');
    expect(vistaActual(false, true)).toBeNull();
  });
});

describe('La pantalla del ejercicio de programar', () => {
  const pagina = leer('pages', 'estudiante', 'evaluacion', '[activityId].vue');
  const salida = leer('components', 'exercise', 'SalidaPrograma.vue');
  const selector = leer('components', 'exercise', 'SelectorVista.vue');

  it('la salida se puede ocultar y mostrar, y se recuerda en este navegador', () => {
    expect(pagina).toContain("usePanelPlegable('stire.ejercicio.salidaPlegada')");
    expect(pagina).toContain(':plegada="salidaPlegada" @plegar="plegarSalida"');
    expect(salida).toContain(":aria-expanded=\"!plegada\"");
    expect(salida).toContain('aria-controls="salida-cuerpo"');
    expect(salida).toContain("$emit('plegar', !plegada)");
    expect(salida).toContain('v-show="!plegada"');
  });

  it('las tres vistas están en la barra del editor, con su estado marcado para los lectores de pantalla', () => {
    expect(pagina).toContain('<ExerciseSelectorVista');
    expect(pagina).toContain('@elegir="elegirVista"');
    expect(pagina.indexOf('<ExerciseSelectorVista')).toBeLessThan(pagina.indexOf('<CodeEditor'));
    expect(selector).toContain(':aria-pressed="actual === v.id"');
    expect(selector).toContain('aria-label="Vista del ejercicio"');
  });

  it('elegir una vista pliega o muestra el enunciado y la salida a la vez', () => {
    expect(pagina).toContain('function elegirVista(id: IdVista) { const v = plegadosDe(id); plegarPanel(v.panelPlegado); plegarSalida(v.salidaPlegada) }');
  });
});

describe('«Probar con mis datos»', () => {
  const composable = leer('composables', 'useProbarConMisDatos.ts');
  const salida = leer('components', 'exercise', 'SalidaPrograma.vue');

  it('manda al mismo servicio de «Probar» el código y la entrada que escribió el estudiante', () => {
    expect(composable).toContain('`/submissions/${id}/run`');
    expect(composable).toContain('{ code: ws.code, input: entrada.value }');
  });

  it('no gasta intento ni califica: el panel lo dice y el resultado se muestra sin compararlo', () => {
    expect(salida).toContain('No se califica ni gasta intentos.');
    expect(salida).toContain('Probar con mis datos');
    expect(salida).toContain('Tu programa mostró');
  });

  it('el campo tiene su etiqueta y su ayuda enlazadas, un tope de caracteres y se ejecuta con Ctrl+Enter', () => {
    expect(salida).toContain('for="mis-datos"');
    expect(salida).toContain('aria-describedby="mis-datos-ayuda"');
    expect(salida).toContain('maxlength="5000"');
    expect(salida).toContain('@keydown.ctrl.enter.prevent="ejecutar"');
  });

  it('un fallo o un límite de pruebas seguidas se dice en palabras, no con un código', () => {
    expect(composable).toContain('Probaste muchas veces seguidas');
    expect(composable).toContain('No se pudo ejecutar ahora');
  });

  it('la propiedad `ejecutando` (la de «Probar código») no se pisa con la de «mis datos»', () => {
    expect(salida).toContain('ejecutando: ejecutandoPropio');
    expect(salida).toContain(':disabled="ejecutandoPropio"');
  });
});
