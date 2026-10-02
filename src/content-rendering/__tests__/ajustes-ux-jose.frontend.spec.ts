import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Ajustes de UI/UX que propuso José (tarea S08-J01): Tutor al lado de la lección, menú que se oculta, cajas de texto
// que crecen y registro con lo obligatorio arriba y lo opcional plegado.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');

const { ajustarAltura } = (() => {
  const js = ts.transpileModule(leer('plugins', 'crece.ts').replace(/export default defineNuxtPlugin[\s\S]*$/, ''), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as { ajustarAltura: (el: unknown, alto: number) => void };
})();

const caja = (scrollHeight: number) => ({ style: { height: '', overflowY: '' }, offsetHeight: 42, clientHeight: 40, scrollHeight });

describe('Ajustes de UI/UX de José', () => {
  it('la caja de texto crece con el contenido hasta el 60 % de la pantalla y luego se desplaza', () => {
    const corta = caja(80);
    ajustarAltura(corta, 1000);
    expect(corta.style).toEqual({ height: '82px', overflowY: 'hidden' });
    const larga = caja(900);
    ajustarAltura(larga, 1000);
    expect(larga.style).toEqual({ height: '600px', overflowY: 'auto' });
  });

  it('las cajas para textos largos usan v-crece; los editores de código no', () => {
    for (const f of [['pages', 'estudiante', 'mensajes.vue'], ['pages', 'docente', 'mensajes.vue'], ['components', 'layout', 'BotonSugerencias.vue'], ['components', 'docente', 'EntregaForm.vue'], ['pages', 'auth', 'register.vue']]) {
      expect(leer(...f)).toContain('v-crece');
    }
    expect(leer('components', 'CodeEditor.vue')).not.toContain('v-crece');
  });

  it('en computador el Tutor es un panel al lado: sin fondo oscuro, sin atrapar el foco y la página le deja espacio', () => {
    const tutor = leer('components', 'tutor', 'TutorChatDrawer.vue');
    expect(tutor).toContain('v-if="tutorStore.isOpen && !pantallaAncha"');
    expect(tutor).toContain(":aria-modal=\"pantallaAncha ? undefined : 'true'\"");
    expect(tutor).toContain("if (event.key === 'Tab' && !pantallaAncha.value)");
    for (const layout of ['student.vue', 'workspace.vue']) expect(leer('layouts', layout)).toContain(":class=\"{ 'lg:pr-[400px]': tutorStore.isOpen }\"");
    expect(leer('composables', 'usePantallaAncha.ts')).toContain("matchMedia('(min-width: 1024px)')");
  });

  it('el menú lateral se oculta en computador (solo íconos, recordado) sin perder los nombres para el lector de pantalla', () => {
    const menu = leer('components', 'layout', 'SidebarNav.vue');
    expect(menu).toContain(':aria-expanded="!colapsado"');
    expect(menu).toContain("localStorage.setItem(CLAVE_MENU, colapsado.value ? '1' : '0')");
    expect(menu).toContain('clip: rect(0 0 0 0)');
    expect(menu).not.toMatch(/<Settings[^>]*\/>\s*<Settings/);
  });

  it('registro: lo opcional va debajo y plegado, y la clave de Google es solo para estudiantes', () => {
    const r = leer('pages', 'auth', 'register.vue');
    const opcional = r.indexOf('<details class="grupo-opcional');
    expect(opcional).toBeGreaterThan(r.indexOf('id="confirmPassword"'));
    expect(r.indexOf('id="classCode"')).toBeGreaterThan(opcional);
    expect(r.indexOf('id="teacherReason"')).toBeGreaterThan(opcional);
    expect(r).toContain(`<div v-if="selectedRole === 'estudiante'" class="border border-slate-200 rounded-xl p-3 space-y-2 bg-white">`);
    expect(r).toContain("if (selectedRole.value === 'estudiante' && !skipApiKey.value && apiKey.value.trim())");
  });
});
