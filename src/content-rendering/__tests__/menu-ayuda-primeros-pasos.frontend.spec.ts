import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Menú de ayuda y primeros pasos (docs/PLAN_AYUDA_AL_USUARIO.md, frentes B.2 y C; 20/10). Antes el «?» solo repetía el
// recorrido y desaparecía en las pantallas sin él, y el manual solo se enlazaba desde el pie de página.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', 'require', js)(mod, mod.exports, () => ({}));
  return mod.exports as T;
}

type Paso = { id: string; texto: string; enlace: string };
const p = cargar<{
  PRIMEROS_PASOS: Paso[];
  pasoDeRuta: (ruta: string) => string | null;
  avancePrimerosPasos: (hechos: string[]) => { hechos: number; total: number; terminado: boolean };
  clavePrimerosPasos: (id: number | null) => string;
}>('primerosPasos');
const manual = cargar<{ MANUAL: Array<{ id: string; tareas: Array<{ id: string }> }> }>('manual');

describe('menú de ayuda', () => {
  it('está en la cabecera de todos los roles y reúne recorrido, ayuda de la pantalla, manual, preguntas y sugerencias', () => {
    const m = leer('components', 'layout', 'MenuAyuda.vue');
    expect(m).toContain(':aria-expanded="abierto"');
    expect(m).toContain('<span class="sr-only">Ayuda</span>');
    expect(m).toContain('<li v-if="recorrido.actual.value">');
    expect(m).toContain(':href="`/ayuda#${tareaDePantalla}`"');
    expect(m).toContain('href="/ayuda"');
    expect(m).toContain('href="/ayuda#preguntas-frecuentes"');
    expect(m).toContain("sugerencias: 'nueva'");
    // Se cierra con Escape, tocando fuera y al cambiar de pantalla.
    expect(m).toContain('useEscapeToClose(() => abierto.value');
    expect(m).toContain("document.addEventListener('click', alTocarFuera)");
    expect(m).toContain('watch(() => route.path, () => { abierto.value = false })');
    // Lo que se abre en otra pestaña lo dice al lector de pantalla.
    expect((m.match(/\(se abre en otra pestaña\)/g) ?? []).length).toBe(3);
  });

  it('la ventana de sugerencias se abre en blanco con ?sugerencias=nueva', () => {
    const b = leer('components', 'layout', 'BotonSugerencias.vue');
    expect(b).toContain("if (v !== 'mias' && v !== 'nueva') return");
  });

  it('«Ayuda» está al final de la barra lateral para los tres roles', () => {
    const s = leer('components', 'layout', 'SidebarNav.vue');
    const ayuda = s.indexOf('<nav aria-label="Ayuda"');
    expect(ayuda).toBeGreaterThan(s.lastIndexOf('<span>Registros y mantenimiento</span>'));
    expect(s).toContain('<NuxtLink to="/ayuda" data-recorrido="ayuda"');
  });
});

describe('primeros pasos del estudiante', () => {
  it('cinco pasos, cada uno con un enlace que existe (una pantalla o una tarea del manual)', () => {
    expect(p.PRIMEROS_PASOS.map((x) => x.id)).toEqual(['clase', 'leccion', 'ejercicio', 'tutor', 'repasos']);
    const tareas = new Set(manual.MANUAL.flatMap((s) => s.tareas.map((t) => t.id)));
    for (const x of p.PRIMEROS_PASOS) {
      if (x.enlace.startsWith('/ayuda#')) expect(tareas.has(x.enlace.slice('/ayuda#'.length))).toBe(true);
      else expect(['/estudiante/clases', '/estudiante/repasos']).toContain(x.enlace);
    }
  });

  it('se marcan al hacerlos: entrar a una lección, a un ejercicio o a los repasos', () => {
    expect(p.pasoDeRuta('/estudiante/unidad/12')).toBe('leccion');
    expect(p.pasoDeRuta('/estudiante/evaluacion/40')).toBe('ejercicio');
    expect(p.pasoDeRuta('/estudiante/repasos/')).toBe('repasos');
    expect(p.pasoDeRuta('/estudiante/progreso')).toBeNull();
    const c = leer('composables', 'usePrimerosPasos.ts');
    expect(c).toContain("if (abierto) marcar('tutor')");
    expect(c).toContain("studentStore.enrolledClasses.length > 0");
    for (const l of ['student.vue', 'workspace.vue']) expect(leer('layouts', l)).toContain('usePrimerosPasos().seguir()');
  });

  it('cuenta el avance y desaparece al terminar o al ocultarla; el menú de ayuda la vuelve a mostrar', () => {
    expect(p.avancePrimerosPasos(['clase', 'tutor'])).toEqual({ hechos: 2, total: 5, terminado: false });
    expect(p.avancePrimerosPasos(['clase', 'leccion', 'ejercicio', 'tutor', 'repasos']).terminado).toBe(true);
    expect(p.clavePrimerosPasos(7)).toBe('stire-primeros-pasos-7');
    const c = leer('composables', 'usePrimerosPasos.ts');
    expect(c).toContain('const visible = computed(() => !estado.value.oculta && !avance.value.terminado)');
    expect(leer('layouts', 'student.vue')).toContain(`<EstudiantePrimerosPasos v-if="route.path === '/estudiante'" class="mb-6" />`);
    expect(leer('components', 'layout', 'MenuAyuda.vue')).toContain('primerosPasos.mostrar()');
  });
});
