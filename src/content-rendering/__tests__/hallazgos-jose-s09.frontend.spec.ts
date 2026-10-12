import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Los 5 hallazgos de UX de José (tarjeta S08-JO02, 09/10), tarea S09-J01 de Jeider.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(...p: string[]): T {
  const js = ts.transpileModule(leer(...p), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

type Area = { alto: number; arriba: number; altoPantalla: number };
const area = cargar<{
  estiloPanelVisible: (a: Area | null, ancha: boolean) => Record<string, string> | undefined;
}>('utils', 'areaVisible.ts');
type Estado = 'encima' | 'disponible' | 'normal';
const zona = cargar<{
  estadoZona: (z: string, e: { sobre: string | null; arrastrando: string | null; seleccionado: string | null }) => Estado;
  saleDeLaZona: (z: { contains(o: unknown): boolean } | null, hacia: unknown) => boolean;
}>('utils', 'zonaArrastre.ts');
const asis = cargar<{ textoCuentaQr: (s: number) => string }>('utils', 'asistencia.ts');

describe('1. En el celular, el teclado ya no tapa el chat del Tutor', () => {
  it('con el teclado abierto, el panel mide lo que se ve y empieza donde empieza lo visible', () => {
    expect(area.estiloPanelVisible({ alto: 400, arriba: 0, altoPantalla: 800 }, false)).toEqual({ height: '400px', top: '0px' });
    expect(area.estiloPanelVisible({ alto: 380.4, arriba: 120.2, altoPantalla: 800 }, false)).toEqual({ height: '380px', top: '120px' });
  });

  it('sin teclado o en computador no cambia nada', () => {
    expect(area.estiloPanelVisible({ alto: 800, arriba: 0, altoPantalla: 800 }, false)).toBeUndefined();
    expect(area.estiloPanelVisible({ alto: 400, arriba: 0, altoPantalla: 800 }, true)).toBeUndefined();
    expect(area.estiloPanelVisible(null, false)).toBeUndefined();
  });

  it('el panel escucha al teclado y baja hasta el último mensaje al escribir', () => {
    expect(leer('composables', 'useAreaVisible.ts')).toContain("window.visualViewport?.addEventListener('resize', medir)");
    const v = leer('components', 'tutor', 'TutorChatDrawer.vue');
    expect(v).toContain('useAreaVisible(pantallaAncha, () => { if (tutorStore.isOpen) scrollToBottom() })');
    expect(v).toContain(':style="estiloAlTeclado"');
    expect(v).toContain('@focus="scrollToBottom"');
  });
});

describe('2. Notificaciones a pantalla completa en el celular', () => {
  const v = leer('components', 'layout', 'NotificationBell.vue');
  it('en el celular el panel ocupa toda la pantalla y va al <body> (el encabezado tiene desenfoque)', () => {
    expect(v).toContain('<Teleport to="body" :disabled="!esCelular">');
    expect(v).toMatch(/class="fixed inset-0 z-\[60\][^"]*sm:absolute sm:inset-auto sm:right-0 sm:top-12 sm:w-96/);
    expect(v).toContain("window.matchMedia('(max-width: 639px)')");
  });
  it('un toque dentro del panel no lo cierra, aunque esté fuera de la campana', () => {
    expect(v).toContain('if (panelRef.value?.contains(objetivo)) return');
  });
});

describe('3. «Mi asistencia» dice cuánto le queda al código QR', () => {
  it('en palabras, además de la barra', () => {
    expect(asis.textoCuentaQr(20)).toBe('Cambia en 20 segundos');
    expect(asis.textoCuentaQr(1)).toBe('Cambia en 1 segundo');
    expect(asis.textoCuentaQr(0)).toBe('Cambiando el código…');
  });
  it('la barra es más gruesa, con borde, y se vuelve ámbar al final', () => {
    const v = leer('pages', 'estudiante', 'asistencia.vue');
    expect(v).toContain('h-3 rounded-full bg-base-bg-secundario border border-base-borde-fuerte');
    expect(v).toContain("segundos <= 5 ? 'bg-acento-ambar-fuerte' : 'bg-stire-teal'");
    expect(v).toContain('textoCuentaQr(segundos)');
  });
});

describe('4. Notificaciones y Tutor no se abren a la vez', () => {
  it('abrir las notificaciones cierra el Tutor, y abrir el Tutor cierra las notificaciones', () => {
    const v = leer('components', 'layout', 'NotificationBell.vue');
    expect(v).toContain('if (tutorStore.isOpen) tutorStore.closeDrawer()');
    expect(v).toContain('watch(() => tutorStore.isOpen, (abierto) => { if (abierto) isOpen.value = false })');
  });
  it('al cerrarse el Tutor por eso, no le quita el foco a las notificaciones', () => {
    const v = leer('components', 'tutor', 'TutorChatDrawer.vue');
    expect(v).toContain('if (activo && activo !== document.body && !drawerRef.value?.contains(activo)) return');
  });
});

describe('5. En arrastrar y soltar, la zona reacciona a la pieza', () => {
  it('encima, la zona se resalta; con una pieza en la mano, todas se marcan como disponibles', () => {
    expect(zona.estadoZona('a', { sobre: 'a', arrastrando: 'x', seleccionado: null })).toBe('encima');
    expect(zona.estadoZona('b', { sobre: 'a', arrastrando: 'x', seleccionado: null })).toBe('disponible');
    expect(zona.estadoZona('b', { sobre: null, arrastrando: null, seleccionado: 'x' })).toBe('disponible');
    expect(zona.estadoZona('a', { sobre: 'a', arrastrando: null, seleccionado: null })).toBe('normal');
  });

  it('pasar sobre el título o una pieza ya puesta no apaga el resaltado (antes parpadeaba)', () => {
    const hijo = {};
    const z = { contains: (o: unknown) => o === hijo };
    expect(zona.saleDeLaZona(z, hijo)).toBe(false);
    expect(zona.saleDeLaZona(z, {})).toBe(true);
    expect(zona.saleDeLaZona(z, null)).toBe(true);
  });

  it('dice «Suelta aquí» y no depende solo del color', () => {
    const v = leer('components', 'exercise', 'DragDropExercise.vue');
    expect(v).toContain('Suelta aquí');
    expect(v).toContain('ring-4 ring-acento-ambar/30');
    expect(v).toContain('@dragleave="salir($event)"');
  });
});

describe('MOB-02 (José): el lanzador del Tutor no tapa la última opción del ejercicio', () => {
  it('todos los ejercicios dejan espacio abajo en el celular', () => {
    expect(leer('layouts', 'workspace.vue')).toContain('class="flex-1 md:overflow-hidden pb-24 md:pb-0"');
  });
});

describe('MOB-01 (José): un bloque de código largo del Tutor no mueve el chat de lado', () => {
  it('la burbuja puede encogerse (min-w-0) y el código se desplaza dentro de su recuadro', () => {
    expect(leer('components', 'tutor', 'TutorChatDrawer.vue')).toContain('class="min-w-0 break-words rounded-2xl p-3');
    expect(leer('utils', 'formatTutorMessage.ts')).toContain('overflow-x-auto');
  });
});
