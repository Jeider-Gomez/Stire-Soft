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

  it('registro en dos pasos: lo obligatorio primero; lo opcional en otro paso y la clave de Google solo para estudiantes', () => {
    const r = leer('pages', 'auth', 'register.vue');
    const p1 = r.indexOf('id="paso-obligatorio"');
    const p2 = r.indexOf('id="paso-opcional"');
    expect(p1).toBeGreaterThan(-1);
    expect(p2).toBeGreaterThan(p1);
    for (const id of ['fullName', 'email', 'password']) expect(r.indexOf(`id="${id}"`)).toBeGreaterThan(p1);
    for (const id of ['classCode', 'teacherReason', 'apiKey']) expect(r.indexOf(`id="${id}"`)).toBeGreaterThan(p2);
    // sin «confirmar contraseña»: el ojo para ver la clave cumple esa función
    expect(r).not.toContain('confirmPassword');
    expect(r).toContain(`<div v-if="selectedRole === 'estudiante'" class="border border-slate-200 rounded-xl p-3 space-y-2 bg-white">`);
    expect(r).toContain("if (selectedRole.value === 'estudiante' && apiKey.value.trim())");
    // «Crear cuenta» se puede pulsar desde el paso 1; ir a lo opcional valida primero
    expect(r).toMatch(/type="submit"[\s\S]*?Crear cuenta/);
    expect(r).toContain('id="ir-opcional"');
    expect(r).toContain('if (Object.keys(validar()).length) { enfocarPrimerFaltante(); return }');
    // el borde rojo debe ganarle al estilo del campo (.campo-auth es scoped y pisaba «border-red-400»)
    expect(r).toContain("'!border-red-400 !ring-1 !ring-red-300'");
    expect(leer('pages', 'auth', 'login.vue')).not.toMatch(/'border-red-400'/);
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

  it('el botón para ocultar el menú va arriba de la barra lateral, solo con ícono, y toda la barra queda fija al bajar', () => {
    const menu = leer('components', 'layout', 'SidebarNav.vue');
    const boton = menu.indexOf('id="boton-menu"');
    expect(boton).toBeGreaterThan(-1);
    expect(boton).toBeLessThan(menu.indexOf('<nav'));
    // un ícono de 36 px, sin borde ni fondo fijo (P-UI-03)
    expect(menu).toMatch(/id="boton-menu"[\s\S]*?class="boton-menu hidden md:flex self-end[^"]*w-9 h-9/);
    expect(menu).not.toMatch(/id="boton-menu"[\s\S]*?class="[^"]*border border-base-borde-sutil/);
    // la barra entera es la que queda fija (P-UI-02)
    expect(leer('composables', 'useMobileSidebar.ts')).toContain("const FIJA = 'md:sticky md:top-16 md:self-start md:h-[calc(100vh-4rem)] md:overflow-y-auto'");
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

describe('El Tutor se ofrece al fallar (como Khan Academy con Khanmigo)', () => {
  const { debeOfrecerTutor, pistaSegunTipo } = (() => {
    const js = ts.transpileModule(leer('utils', 'ofertaTutor.ts'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    const mod = { exports: {} as Record<string, unknown> };
    new Function('module', 'exports', js)(mod, mod.exports);
    return mod.exports as {
      debeOfrecerTutor: (c: Array<{ passed?: boolean }>, corriendo: boolean, cerrada: boolean) => boolean;
      pistaSegunTipo: (t: string | undefined) => string;
    };
  })();

  it('solo cuando terminó de correr, algún caso falló y el estudiante no cerró la oferta', () => {
    expect(debeOfrecerTutor([{ passed: true }, { passed: false }], false, false)).toBe(true);
    expect(debeOfrecerTutor([{ passed: true }, { passed: true }], false, false)).toBe(false);
    expect(debeOfrecerTutor([{}, {}], false, false)).toBe(false);
    expect(debeOfrecerTutor([{ passed: false }], true, false)).toBe(false);
    expect(debeOfrecerTutor([{ passed: false }], false, true)).toBe(false);
  });

  it('en código pide «por qué no sale lo esperado»; en lo demás, la idea de fondo', () => {
    expect(pistaSegunTipo('coding')).toBe('parada');
    expect(pistaSegunTipo('html_css')).toBe('parada');
    expect(pistaSegunTipo('multiple_choice')).toBe('conceptual');
  });

  it('la pantalla del ejercicio la muestra en los casos de prueba y en el resultado no aprobado, y se puede cerrar', () => {
    const p = leer('pages', 'estudiante', 'evaluacion', '[activityId].vue');
    expect(p).toContain('v-if="ofrecerTutor"');
    expect(p).toContain('@click="ofertaCerrada = true"');
    expect(p).toMatch(/v-if="!isSuccessResult"\s+id="oferta-tutor-resultado"/);
    expect(p).toContain('tutorStore.requestQuickHint(pistaSegunTipo(');
  });
});

describe('Registro: validación del paso 1 con mensajes que dicen qué arreglar', () => {
  const { faltantesDelRegistro, claveCumple } = (() => {
    const js = ts.transpileModule(leer('utils', 'registro.ts'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    const mod = { exports: {} as Record<string, unknown> };
    new Function('module', 'exports', js)(mod, mod.exports);
    return mod.exports as {
      faltantesDelRegistro: (n: string, c: string, k: string) => Record<string, string>;
      claveCumple: (k: string) => boolean;
    };
  })();

  it('la contraseña sigue las reglas del servidor', () => {
    expect(claveCumple('Test123.')).toBe(true);
    expect(claveCumple('Abc12')).toBe(false);
    expect(claveCumple('abcdef1')).toBe(false);
    expect(claveCumple('ABCDEF1')).toBe(false);
    expect(claveCumple('Abcdefg')).toBe(false);
    expect(claveCumple('Abcdef!')).toBe(true);
  });

  it('marca solo lo que falta, con un mensaje por campo', () => {
    expect(faltantesDelRegistro('Ana Ruiz', 'ana@unicor.edu.co', 'Test123.')).toEqual({});
    const f = faltantesDelRegistro('  ', 'ana@', 'abc');
    expect(Object.keys(f).sort()).toEqual(['email', 'fullName', 'password']);
    expect(f.email).toContain('nombre@dominio.com');
    expect(faltantesDelRegistro('Ana', '', 'Test123.')).toEqual({ email: 'Escribe tu correo.' });
  });
});

describe('Atajos del Tutor: solos al empezar un ejercicio; si no, detrás del bombillo (pedido de Jeider, 03/10)', () => {
  const { atajosDisponibles, atajosASimpleVista } = (() => {
    const js = ts.transpileModule(leer('utils', 'atajosTutor.ts'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    const mod = { exports: {} as Record<string, unknown> };
    new Function('module', 'exports', js)(mod, mod.exports);
    return mod.exports as {
      atajosDisponibles: (r: string, t: string | null) => string[];
      atajosASimpleVista: (r: string, m: Array<{ id: string; sender: string }>, alEntrar: number) => boolean;
    };
  })();

  it('«caso borde» y «por qué no sale» solo con un ejercicio de código abierto; en lecciones, solo la pista conceptual', () => {
    expect(atajosDisponibles('/estudiante/evaluacion/236', 'coding')).toEqual(['conceptual', 'borde', 'parada']);
    expect(atajosDisponibles('/estudiante/evaluacion/236', 'multiple_choice')).toEqual(['conceptual']);
    expect(atajosDisponibles('/estudiante/unidad/12', 'coding')).toEqual(['conceptual']);
  });

  it('se muestran solos en un ejercicio hasta que el estudiante pregunta algo en él; el historial no cuenta', () => {
    const e = '/estudiante/evaluacion/236';
    expect(atajosASimpleVista(e, [{ id: 'msg-1-tutor', sender: 'tutor' }], 0)).toBe(true);
    // preguntas viejas cargadas del historial: siguen visibles
    expect(atajosASimpleVista(e, [{ id: 'hist-9', sender: 'student' }, { id: 'hist-10', sender: 'tutor' }], 0)).toBe(true);
    expect(atajosASimpleVista(e, [{ id: 'msg-2-user', sender: 'student' }], 0)).toBe(false);
    // en el ejercicio siguiente vuelven: ya llevaba 1 pregunta al entrar
    expect(atajosASimpleVista(e, [{ id: 'msg-2-user', sender: 'student' }], 1)).toBe(true);
    expect(atajosASimpleVista('/estudiante/unidad/12', [], 0)).toBe(false);
  });

  it('el Tutor ya no tiene la fila fija «Atajos»: usa el bombillo junto al campo', () => {
    const d = leer('components', 'tutor', 'TutorChatDrawer.vue');
    expect(d).not.toContain('</Lightbulb> Atajos');
    expect(d).not.toMatch(/uppercase tracking-wider text-slate-500">\s*<Lightbulb[^>]*\/> Atajos/);
    expect(d).toContain('id="boton-atajos"');
    expect(d).toContain(':aria-expanded="verAtajos"');
    expect(d).toContain('v-if="atajosVisibles"');
  });
});

describe('Tutor: aviso de repasos compacto y «Mi clave» en una línea (pedido de Jeider, 03/10)', () => {
  const d = leer('components', 'tutor', 'TutorChatDrawer.vue');

  it('el aviso de repasos es una franja de una línea que se puede descartar, no una tarjeta flotante', () => {
    expect(d).toContain('v-if="tutorStore.tutorEnabled && overdueNotice && !avisoRepasosDescartado"');
    expect(d).toContain('aria-label="Ocultar el aviso de repasos"');
    expect(d).toContain("useState('tutor-aviso-repasos-descartado'");
    expect(d).toContain("sessionStorage.setItem(CLAVE_AVISO_REPASOS, '1')");
    expect(d).not.toContain('mx-4 mt-3 p-3 rounded-lg bg-acento-ambar/10');
  });

  it('«Mi clave» no se parte en dos líneas', () => {
    expect(d).toMatch(/whitespace-nowrap[^"]*"[\s\S]{0,200}?<KeyRound :size="12" aria-hidden="true" \/> Mi clave/);
  });
});

describe('Patrones de interfaz tomados de los referentes (docs/investigacion/referentes/PATRONES_DE_INTERFAZ.md)', () => {
  it('P-UI-01: el encabezado queda fijo y es semitransparente con desenfoque', () => {
    expect(leer('components', 'layout', 'HeaderNav.vue')).toMatch(/class="h-16 bg-white\/80 glass-header[^"]*sticky top-0/);
  });

  it('P-UI-04: en el celular el Tutor se abre con un lanzador flotante con texto; el del encabezado es para sm en adelante', () => {
    const lanzador = leer('components', 'tutor', 'LanzadorTutor.vue');
    expect(lanzador).toContain('v-if="!tutorStore.isOpen"');
    expect(lanzador).toMatch(/class="sm:hidden fixed right-4/);
    expect(lanzador).toMatch(/<Sparkles[^>]*\/>\s*Tutor\s*<\/button>/);
    for (const layout of ['student.vue', 'workspace.vue']) expect(leer('layouts', layout)).toContain('<TutorLanzadorTutor />');
    expect(leer('components', 'layout', 'HeaderNav.vue')).toMatch(/aria-label="Abrir el Tutor IA"\s*class="hidden sm:inline-flex/);
  });

  it('P-UI-05: en el celular la barra del ejercicio (Probar, Entregar) queda fija arriba', () => {
    expect(leer('layouts', 'workspace.vue')).toMatch(/<header class="sticky top-0 md:static/);
  });
});
