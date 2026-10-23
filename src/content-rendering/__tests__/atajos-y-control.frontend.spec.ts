import { readFileSync } from 'fs';
import { join } from 'path';
import * as ts from 'typescript';

// Mejoras tras la evaluación heurística del 22/10 (docs/investigacion/EVALUACION_HEURISTICA_STIRE_2026-10-22.md):
// detener una prueba (ítem 8), atajos de teclado (21), sonidos opcionales (1 y 22), glosario en línea (4 y 28) y
// errores que dicen qué hacer (14).
const front = (r: string) => readFileSync(join(__dirname, '../../../frontend-nuxt', r), 'utf8');
function cargar<T>(ruta: string): T {
  const js = ts.transpileModule(front(ruta), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

type Tecla = { key: string; ctrlKey: boolean; metaKey: boolean; shiftKey: boolean; altKey: boolean };
const atajos = cargar<{ ATAJOS: Array<{ teclas: string[]; accion: string }>; esAtajoProbar: (e: Tecla) => boolean }>('utils/atajos.ts');
const tecla = (t: Partial<Tecla>): Tecla => ({ key: 'Enter', ctrlKey: false, metaKey: false, shiftKey: false, altKey: false, ...t });

describe('Atajos de teclado (ítem 21)', () => {
  it('Ctrl+Enter o Cmd+Enter prueban; Enter solo, Shift o Alt no', () => {
    expect(atajos.esAtajoProbar(tecla({ ctrlKey: true }))).toBe(true);
    expect(atajos.esAtajoProbar(tecla({ metaKey: true }))).toBe(true);
    expect(atajos.esAtajoProbar(tecla({}))).toBe(false);
    expect(atajos.esAtajoProbar(tecla({ ctrlKey: true, shiftKey: true }))).toBe(false);
    expect(atajos.esAtajoProbar(tecla({ key: 'a', ctrlKey: true }))).toBe(false);
  });

  it('cada atajo de la lista está implementado donde dice', () => {
    const acciones = atajos.ATAJOS.map((a) => a.accion);
    expect(acciones).toEqual(expect.arrayContaining(['Probar tu código', 'Enviar tu pregunta al Tutor']));
    const layout = front('layouts/workspace.vue');
    expect(layout).toContain("window.addEventListener('keydown', alPulsarTecla, true)");
    expect(layout).toContain('aria-keyshortcuts="Control+Enter"');
    expect(front('components/tutor/TutorChatDrawer.vue')).toContain('@keydown.enter="handleSend"');
    expect(front('components/tutor/TutorChatDrawer.vue')).toMatch(/event\.key === 'Escape'/);
  });

  it('el menú de ayuda abre la lista de atajos', () => {
    const menu = front('components/layout/MenuAyuda.vue');
    expect(menu).toContain('Atajos de teclado');
    expect(menu).toContain('<LayoutAtajosTeclado');
    expect(front('components/layout/AtajosTeclado.vue')).toContain('showModal()');
  });
});

describe('Detener una prueba (ítem 8)', () => {
  it('mientras corre, «Probar» se vuelve «Detener» y cancela la espera sin borrar el código', () => {
    const layout = front('layouts/workspace.vue');
    expect(layout).toContain("workspaceStore.isRunning ? workspaceStore.detenerEjecucion() : handleRun()");
    expect(layout).toContain("workspaceStore.isRunning ? 'Detener'");
    const store = front('stores/workspace.ts');
    expect(store).toContain('function detenerEjecucion()');
    expect(store.match(/\{ signal: senal \}/g)).toHaveLength(2);
    expect(store.match(/if \(senal\.aborted\)/g)).toHaveLength(2);
    expect(front('composables/useApi.ts')).toContain('...(options.signal ? { signal: options.signal } : {})');
  });
});

describe('Sonidos opcionales (ítems 1 y 22)', () => {
  it('vienen apagados, se encienden en Apariencia y suenan al probar', () => {
    const apariencia = front('utils/apariencia.ts');
    expect(apariencia).toContain('sonidos: false,');
    expect(apariencia).toContain('sonidos: p.sonidos === true');
    expect(front('components/perfil/AparienciaLectura.vue')).toContain("cambiar({ sonidos: !a.sonidos })");
    expect(front('stores/workspace.ts').match(/sonarResultado\(res\.allPassed\)/g)).toHaveLength(2);
    const sonidos = front('utils/sonidos.ts');
    expect(sonidos).toContain('if (!sonidosEncendidos(guardado)) return');
  });
});

describe('Glosario en línea (ítems 4 y 28)', () => {
  it('las palabras explicadas en pantalla están en el glosario del manual', () => {
    const manual = front('utils/manual.ts');
    for (const palabra of ['Dominio', 'Casos de prueba', 'Repetición espaciada']) {
      expect(manual).toContain(`{ titulo: '${palabra}', texto:`);
    }
    expect(front('components/estudiante/TuAvance.vue')).toContain('<Termino palabra="Dominio" />');
    expect(front('pages/estudiante/repasos.vue')).toContain('<Termino palabra="Repetición espaciada">');
    expect(front('pages/estudiante/evaluacion/[activityId].vue')).toContain(":title=\"definicion('Casos de prueba')\"");
  });

  it('la explicación se abre con el teclado y se anuncia al lector de pantalla', () => {
    const termino = front('components/Termino.vue');
    expect(termino).toContain('role="tooltip"');
    expect(termino).toContain(':aria-expanded="abierto"');
    expect(termino).toContain('@keydown.esc="abierto = false"');
  });
});

describe('Errores que dicen qué hacer (ítem 14)', () => {
  const { useApiErrorMessage } = cargar<{ useApiErrorMessage: () => { messageOf: (e: unknown, f: string) => string } }>('composables/useApiErrorMessage.ts');
  const { messageOf } = useApiErrorMessage();

  it('sin motivo del servidor, el 500 y el 429 dicen qué hacer; el motivo del servidor manda', () => {
    expect(messageOf({ statusCode: 500 }, 'x')).toMatch(/Espera unos segundos e inténtalo de nuevo/);
    expect(messageOf({ statusCode: 429 }, 'x')).toMatch(/Espera un minuto/);
    expect(messageOf({ statusCode: 0 }, 'x')).toMatch(/Revisa tu conexión/);
    expect(messageOf({ statusCode: 400 }, 'texto propio')).toBe('texto propio');
    expect(messageOf({ statusCode: 500, data: { error: 'La clase no existe' } }, 'x')).toBe('La clase no existe');
  });
});
