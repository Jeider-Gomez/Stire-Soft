import { readdirSync, readFileSync } from 'fs';
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

const caja = (scrollHeight: number, enVentana = false) => ({
  style: { height: '', overflowY: '' }, offsetHeight: 42, clientHeight: 40, scrollHeight,
  closest: () => (enVentana ? {} : null),
});

describe('Ajustes de UI/UX de José', () => {
  it('la caja de texto crece con el contenido hasta el 60 % de la pantalla y luego se desplaza', () => {
    const corta = caja(80);
    ajustarAltura(corta, 1000);
    expect(corta.style).toEqual({ height: '82px', overflowY: 'hidden' });
    const larga = caja(900);
    ajustarAltura(larga, 1000);
    expect(larga.style).toEqual({ height: '600px', overflowY: 'auto' });
  });

  it('dentro de una ventana emergente la caja crece solo hasta el 35 %, para no tapar el botón de guardar (reporte de Jeider)', () => {
    const larga = caja(900, true);
    ajustarAltura(larga, 1000);
    expect(larga.style).toEqual({ height: '350px', overflowY: 'auto' });
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

describe('Admin: restablecer contraseña (reporte de Jorge, 02/10)', () => {
  const admin = readFileSync(path.join(raiz, 'pages', 'admin', 'index.vue'), 'utf8');

  it('los paneles se cierran por el fondo solo si el clic empezó en el fondo (no al soltar una selección fuera)', () => {
    expect(admin).not.toMatch(/@click\.self="\w+">/);
    expect(admin.match(/@mousedown="inicioClic = \$event\.target" @click\.self="inicioClic === \$event\.currentTarget && /g)).toHaveLength(5);
    // con la contraseña ya generada, el fondo no cierra: se perdería para siempre
    expect(admin).toContain('!resetSuccessPassword && closeResetPwdModal()');
  });

  it('la contraseña generada va en un campo de solo lectura que se selecciona entera, sin espacios alrededor', () => {
    expect(admin).toMatch(/id="reset-pwd-generada"\s+:value="resetSuccessPassword"\s+readonly/);
    expect(admin).toContain("document.getElementById('reset-pwd-generada')");
  });
});

describe('Ajustes de Jeider (02/10): ventanas con scroll, aviso de rol, menú y login', () => {
  const vues = (dir: string): string[] =>
    readdirSync(path.join(raiz, dir), { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? vues(path.join(dir, e.name)) : e.name.endsWith('.vue') ? [path.join(dir, e.name)] : []);

  it('toda ventana emergente centrada tiene alto máximo y se puede desplazar hasta el botón de guardar', () => {
    const sinTope: string[] = [];
    for (const f of [...vues('pages'), ...vues('components')]) {
      const lineas = leer(f).split('\n');
      lineas.forEach((l, i) => {
        if (!/fixed inset-0.*items-center/.test(l)) return;
        const panel = lineas.slice(i, i + 22).find((x) => /class="[^"]*max-w-/.test(x)) ?? '';
        if (!/max-h-/.test(panel)) sinTope.push(`${f}:${i + 1}`);
      });
    }
    expect(sinTope).toEqual([]);
  });

  it('crear clase: la ventana no se cierra al soltar una selección afuera y la X es un ícono con nombre', () => {
    const d = leer('pages', 'docente', 'index.vue');
    expect(d).toContain('@click.self="inicioClic === $event.currentTarget && (isModalOpen = false)"');
    expect(d).not.toContain('✕');
  });

  it('la solicitud de docente pendiente se avisa en rojo y dice que el admin aún no cambia el rol', () => {
    const e = leer('pages', 'estudiante', 'index.vue');
    expect(e).toContain("'bg-semantico-falla/10 border-semantico-falla text-semantico-falla': myRoleRequest.status !== 'approved'");
    expect(e).toContain('El administrador todavía no ha cambiado tu rol a docente');
    const r = leer('pages', 'auth', 'register.vue');
    expect(r).toContain('Todavía no eres docente');
    expect(r).toMatch(/v-if="selectedRole === 'docente'"[^>]*text-semantico-falla/);
  });

  it('el botón para ocultar el menú va arriba de la barra lateral y queda fijo al bajar', () => {
    const menu = leer('components', 'layout', 'SidebarNav.vue');
    const boton = menu.indexOf('id="boton-menu"');
    expect(boton).toBeGreaterThan(-1);
    expect(boton).toBeLessThan(menu.indexOf('<nav'));
    expect(menu).toMatch(/id="boton-menu"[\s\S]*?class="[^"]*sticky top-16/);
  });

  it('login: marca al lado del título en computador, foco tras un error y ayuda de recuperación en su página', () => {
    const l = leer('pages', 'auth', 'login.vue');
    expect(l).toContain('flex flex-col lg:flex-row items-center');
    expect(l).toContain('passwordRef.value?.focus()');
    expect(l).toContain(":aria-describedby=\"errorMessage ? 'login-error' : undefined\"");
    expect(l).not.toContain('No te llega el correo de recuperación');
    const f = leer('pages', 'auth', 'forgot-password.vue');
    expect(f).toContain('¿No te llega el correo?');
    expect(f).not.toContain('⚠');
  });
});
