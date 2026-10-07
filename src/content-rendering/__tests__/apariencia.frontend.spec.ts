import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Apariencia y lectura (MOB-03; pedido del dueño, 04/10): tema claro, oscuro o el del dispositivo; alto contraste;
// tamaño del texto y espaciado. utils/apariencia.ts, assets/css/temas.css, docs/DISENO_APARIENCIA.md.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

type Apariencia = { tema: string; altoContraste: boolean; temaContraste: string; texto: string; espaciado: boolean; menosMovimiento: boolean };
type Paleta = Record<string, string>;
type Sistema = { oscuro: boolean; masContraste: boolean };
const a = cargar<{
  leerApariencia: (crudo: string | null, sistema?: Sistema) => Apariencia;
  atributosApariencia: (x: Apariencia, sistema?: Sistema) => Record<string, string>;
  temaEfectivo: (tema: string, sistema?: Sistema, temaContraste?: string) => string;
  variablesDeContraste: (t: string) => Record<string, string>;
  razonDeContraste: (x: string, y: string) => number;
  TEMAS_CONTRASTE: Array<{ valor: string; texto: string; oscuro: boolean; paleta: Paleta }>;
  APARIENCIA_POR_DEFECTO: Apariencia;
}>('apariencia');
const BASE = { tema: 'claro', altoContraste: false, temaContraste: 'ninguno', texto: 'normal', espaciado: false, menosMovimiento: false };

describe('preferencias guardadas', () => {
  it('por defecto, el tema claro de siempre (se lee mejor; Piepenbrock et al., 2013)', () => {
    expect(a.APARIENCIA_POR_DEFECTO).toEqual(BASE);
    expect(a.leerApariencia(null)).toEqual(a.APARIENCIA_POR_DEFECTO);
  });

  it('un valor dañado vuelve al de por defecto sin perder los demás', () => {
    expect(a.leerApariencia('{"tema":"oscuro","texto":"gigante","altoContraste":true,"temaContraste":"rosado"}')).toEqual({ ...BASE, tema: 'oscuro', altoContraste: true });
    expect(a.leerApariencia('no es json')).toEqual(a.APARIENCIA_POR_DEFECTO);
    expect(a.leerApariencia('[1,2]')).toEqual(a.APARIENCIA_POR_DEFECTO);
  });

  it('se traducen a los atributos de <html> que leen los estilos; «Como mi dispositivo» llega ya resuelto', () => {
    expect(a.atributosApariencia({ ...BASE, tema: 'sistema', altoContraste: true, texto: 'grande', espaciado: true, menosMovimiento: true }, { oscuro: true, masContraste: false })).toEqual({
      'data-tema': 'oscuro', 'data-tema-elegido': 'sistema', 'data-contraste': 'alto', 'data-tema-contraste': 'ninguno', 'data-texto': 'grande', 'data-espaciado': 'amplio', 'data-movimiento': 'reducido',
    });
    expect(a.temaEfectivo('sistema', { oscuro: false, masContraste: false })).toBe('claro');
    expect(a.temaEfectivo('oscuro', { oscuro: false, masContraste: false })).toBe('oscuro');
    expect(a.temaEfectivo('claro', { oscuro: true, masContraste: true })).toBe('claro');
  });

  it('si nunca se eligió nada y el dispositivo pide más contraste, el alto contraste empieza activado (y se puede quitar)', () => {
    expect(a.leerApariencia(null, { oscuro: false, masContraste: true }).altoContraste).toBe(true);
    expect(a.leerApariencia('{"altoContraste":false}', { oscuro: false, masContraste: true }).altoContraste).toBe(false);
  });
});

describe('los colores', () => {
  const config = leer('tailwind.config.ts');
  const temas = leer('assets', 'css', 'temas.css');
  const claro = temas.slice(temas.indexOf(':root {'), temas.indexOf('}', temas.indexOf(':root {')));
  const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(' ');

  it('los tokens semánticos leen variables, con transparencias', () => {
    for (const v of ['base-blanco', 'base-texto-primario', 'acento-ambar-fuerte', 'semantico-pasa', 'unidad-dominado', 'repaso-critico', 'stire-canvas']) {
      expect(config).toContain(`'rgb(var(--c-${v}) / <alpha-value>)'`);
    }
  });

  it('el tema claro conserva los colores de antes; solo el texto secundario subió a slate-600 (07/10: 4,3 a 1 sobre gris)', () => {
    const antes: Record<string, string> = {
      'base-blanco': '#FFFFFF', 'base-bg-primario': '#F7F9FC', 'base-bg-secundario': '#F1F5F9', 'base-borde-sutil': '#E2E8F0',
      'base-borde-fuerte': '#CBD5E1', 'base-texto-secundario': '#475569', 'base-texto-primario': '#1E293B',
      'acento-ambar': '#082A66', 'acento-ambar-fuerte': '#0B3D91', 'semantico-pasa': '#047857', 'semantico-falla': '#B91C1C',
      'repaso-vencido': '#B45309', 'unidad-en-progreso': '#7B2FBF', 'stire-canvas': '#F7F9FC',
    };
    for (const [v, hex] of Object.entries(antes)) expect(claro).toContain(`--c-${v}: ${rgb(hex)};`);
  });

  it('hay tema oscuro y alto contraste en los dos temas; lo que siempre es oscuro (editor) no cambia', () => {
    expect(temas).toContain(':root[data-tema="oscuro"] {');
    expect(temas).not.toContain('data-tema="sistema"');
    expect(temas).toContain(':root[data-contraste="alto"] {');
    expect(temas).toContain(':root[data-tema="oscuro"][data-contraste="alto"] {');
    expect(temas).toContain('color-scheme: dark;');
    expect(config).toContain("bg: '#0F172A'");
  });

  it('las variables cargan antes que main.css y se aplican antes de mostrar la página', () => {
    const nuxt = leer('nuxt.config.ts');
    expect(nuxt.indexOf("'~/assets/css/temas.css'")).toBeLessThan(nuxt.indexOf("'~/assets/css/main.css'"));
    const plugin = leer('plugins', 'apariencia.client.ts');
    expect(plugin).toContain('aplicarApariencia(apariencia.value)');
    expect(plugin).toContain('seguirAlSistema(');
  });

  it('el alto contraste es de verdad (Canvas, GitHub): enlaces subrayados, foco de 3 px, bordes marcados, sin sombras', () => {
    const ac = temas.slice(temas.indexOf('── Alto contraste ──'), temas.indexOf('── Colores forzados'));
    expect(ac).toContain('text-decoration: underline');
    expect(ac).toContain(':focus-visible { outline: 3px solid');
    expect(ac).toContain('box-shadow: none');
    expect(ac).toContain('--c-base-borde-sutil: 71 85 105;');
    expect(ac).toContain('--c-base-texto-primario: 255 255 255;');
  });

  it('respeta los «Temas de contraste» de Windows (forced-colors): botones con borde, foco y barras visibles', () => {
    const fc = temas.slice(temas.indexOf('@media (forced-colors: active)'));
    expect(fc).toContain('border: 1px solid ButtonText');
    expect(fc).toContain('outline: 3px solid Highlight');
    expect(fc).toContain('background-color: Highlight');
  });
});

describe('el texto', () => {
  it('los tamaños están en rem para que «Texto grande» los agrande; los fijos en px también crecen', () => {
    const config = leer('tailwind.config.ts');
    expect(config).toContain("xs: '0.75rem'");
    expect(config).not.toMatch(/xs: '12px'/);
    const temas = leer('assets', 'css', 'temas.css');
    expect(temas).toContain(':root[data-texto="grande"] { font-size: 112.5%; }');
    expect(temas).toContain('.text-\\[11px\\] { font-size: 0.6875rem; }');
    expect(temas).toContain(':root[data-espaciado="amplio"]');
  });

  it('no se ofrece una fuente para dislexia: no mejoró la lectura (Wery y Diliberto, 2017)', () => {
    expect(leer('components', 'perfil', 'AparienciaLectura.vue').toLowerCase()).not.toContain('dyslexic');
  });
});

describe('dónde se elige', () => {
  it('en el perfil de los tres roles, en el menú del usuario y en el botón «Apariencia» de la cabecera (como Moodle)', () => {
    for (const rol of ['estudiante', 'docente', 'admin']) expect(leer('pages', rol, 'perfil.vue')).toContain('<PerfilAparienciaLectura class="mt-6" />');
    const cabecera = leer('components', 'layout', 'HeaderNav.vue');
    expect(cabecera).toContain(':to="`${homeRoute}/perfil#apariencia`"');
    expect(cabecera).toContain('<LayoutBotonApariencia />');
    const boton = leer('components', 'layout', 'BotonApariencia.vue');
    expect(boton).toContain('<PerfilAparienciaLectura compacto />');
    expect(boton).toContain('devolver-foco="boton-apariencia"');
  });

  it('el panel: grupos de opciones con leyenda, controles de 44 px y «Volver a la apariencia de siempre»', () => {
    const c = leer('components', 'perfil', 'AparienciaLectura.vue');
    expect(c).toContain('<legend class="text-xs font-semibold text-base-texto-primario mb-1">Tema</legend>');
    expect(c).toContain('min-h-[44px]');
    expect(c).toContain('Volver a la apariencia de siempre');
    expect(c).toContain('MUESTRAS[t.valor]');
    expect(leer('composables', 'useApariencia.ts')).toContain('localStorage.setItem(CLAVE_APARIENCIA');
  });
});

describe('lo que encontró la revisión con agent-browser (07/10)', () => {
  it('los botones de Ajustes y los contadores del menú tienen contraste suficiente (no usan el color de borde como fondo)', () => {
    expect(leer('pages', 'docente', 'clase', '[classId]', 'ajustes.vue')).not.toContain("'bg-base-borde-sutil text-slate-700'");
    expect(leer('components', 'docente', 'ajustes', 'SeccionLogros.vue')).not.toContain('bg-base-borde-sutil');
    expect(leer('components', 'layout', 'SidebarNav.vue')).toContain('bg-semantico-falla text-base-blanco');
  });

  it('cada lista del ejercicio de emparejar dice de qué elemento es la pareja; la flecha es decorativa', () => {
    const c = leer('components', 'exercise', 'MatchingExercise.vue');
    expect(c).toContain(':aria-label="`Pareja de «${itemText(leftItem)}»`"');
    expect(c).toContain('aria-hidden="true">➔</span>');
  });

  it('en «Mi progreso» los títulos no saltan de h1 a h3', () => {
    expect(leer('components', 'EstadisticasEstudiante.vue')).toContain('<h2 id="autorregulacion-titulo"');
  });
});


describe('temas de contraste como los de Windows 11 (07/10)', () => {
  it('son los cuatro de Windows, con sus colores de fondo, texto, enlace y selección', () => {
    expect(a.TEMAS_CONTRASTE.map((t) => t.texto)).toEqual(['Acuático', 'Desierto', 'Anochecer', 'Cielo nocturno']);
    const cielo = a.TEMAS_CONTRASTE.find((t) => t.valor === 'cielo-nocturno')!.paleta;
    expect(cielo).toMatchObject({ fondo: '#000000', texto: '#FFFFFF', enlace: '#8080FF', resalte: '#D6B4FD', botonTexto: '#FFEE32' });
    expect(a.TEMAS_CONTRASTE.find((t) => t.valor === 'desierto')!.paleta).toMatchObject({ fondo: '#FFFAEF', texto: '#3D3D3D', resalte: '#903909' });
  });

  it.each(['acuatico', 'desierto', 'anochecer', 'cielo-nocturno'])('%s: 7 a 1 o más en texto, botón, selección y estados; enlaces y deshabilitado, 4,5 a 1 o más', (valor) => {
    const p = a.TEMAS_CONTRASTE.find((t) => t.valor === valor)!.paleta;
    for (const c of [p.texto, p.botonTexto, p.resalte, p.correcto, p.error, p.aviso, p.progreso]) expect(a.razonDeContraste(c, p.fondo)).toBeGreaterThanOrEqual(7);
    expect(a.razonDeContraste(p.resalteTexto, p.resalte)).toBeGreaterThanOrEqual(7);
    expect(a.razonDeContraste(p.fondo, p.resalte)).toBeGreaterThanOrEqual(7); // texto del botón principal
    for (const c of [p.enlace, p.inactivo]) expect(a.razonDeContraste(c, p.fondo)).toBeGreaterThanOrEqual(4.5);
  });

  it('un tema de contraste manda sobre el tema elegido y trae el contraste aumentado; sus colores van a las variables', () => {
    expect(a.temaEfectivo('claro', { oscuro: false, masContraste: false }, 'cielo-nocturno')).toBe('oscuro');
    expect(a.temaEfectivo('oscuro', { oscuro: true, masContraste: false }, 'desierto')).toBe('claro');
    expect(a.atributosApariencia({ ...BASE, temaContraste: 'acuatico' })).toMatchObject({ 'data-tema': 'oscuro', 'data-contraste': 'alto', 'data-tema-contraste': 'acuatico' });
    const v = a.variablesDeContraste('acuatico');
    expect(v['--c-base-blanco']).toBe('32 32 32');
    expect(v['--c-base-texto-secundario']).toBe(v['--c-base-texto-primario']); // sin gris para el texto secundario (Microsoft)
    expect(v['--c-acento-ambar-fuerte']).toBe('142 227 240');
    expect(a.variablesDeContraste('ninguno')).toEqual({});
  });

  it('el CSS reduce a la paleta los colores fijos, el editor y las ventanas (borde de 2 px)', () => {
    const temas = leer('assets', 'css', 'temas.css');
    const ct = temas.slice(temas.indexOf('── Temas de contraste'), temas.indexOf('── Colores forzados'));
    expect(ct).toContain('[class*="text-slate-"]');
    // Los colores escritos a mano (text-[#…]) y la pestaña activa: los encontró la pasada con los cuatro temas (222 fallas).
    expect(ct).toContain('[class*="text-[#"]');
    expect(ct).toContain('[class*="bg-[#"]');
    expect(ct).toContain('a:not([class*="bg-"]):not([aria-current])');
    expect(ct).toContain(':is([class~="bg-acento-ambar-fuerte"], [class~="bg-acento-ambar"], .btn-stire-primary, .btn-stire-teal):not([data-sin-regla])');
    expect(ct).toContain('.peer:checked ~ [class*="peer-checked:bg-acento-ambar"]');
    expect(ct).not.toContain('[class*="bg-acento-ambar-fuerte"]');
    expect(ct).toContain('.gradient-stire');
    expect(ct).toContain('.cm-editor');
    expect(ct).toContain('[role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"]) { border: 2px solid');
    expect(ct).toContain('rgb(var(--c-ct-enlace))');
    expect(ct).toContain('rgb(var(--c-ct-inactivo))');
    // Un deshabilitado no puede verse como el botón principal (se vio en «Guardar nombre» con Cielo nocturno).
    expect(ct).toContain(':is(:disabled, [aria-disabled="true"]):not([data-sin-regla]) { opacity: 1 !important;');
  });

  it('el panel ofrece un interruptor «Tema de contraste» que despliega los cuatro temas, «Reducir el movimiento» y el aviso de Windows', () => {
    const c = leer('components', 'perfil', 'AparienciaLectura.vue');
    // 07/10 noche, Jeider: la sección debía ser «un desplegable que se activa». Como en Windows: interruptor y, encendido, los temas.
    expect(c).toContain('role="switch" :aria-checked="!!temaDeContraste"');
    expect(c).toContain('<fieldset v-show="temaDeContraste"');
    expect(c).toContain('v-for="t in TEMAS_CONTRASTE"');
    expect(c).not.toContain("texto: 'Ninguno'");
    // Apagarlo vuelve a los colores normales; encenderlo recuerda el último tema.
    expect(c).toMatch(/if \(temaDeContraste\.value\) cambiar\(\{ temaContraste: 'ninguno' \}\)\s*else elegirContraste\(ultimoContraste\(\)\)/);
    expect(c).toContain('Reducir el movimiento');
    expect(c).toContain('sistemaConColoresForzados()');
    const temas = leer('assets', 'css', 'temas.css');
    expect(temas).toContain(':root[data-movimiento="reducido"] *');
    expect(temas).toContain('@media (prefers-reduced-motion: reduce)');
  });
});

describe('revisión exhaustiva de accesibilidad (07/10, axe-core con WCAG 2.2 en 39 pantallas)', () => {
  it('2.5.3 Etiqueta en el nombre: los botones de la cabecera no tapan con aria-label el texto que se ve', () => {
    for (const f of ['BotonSugerencias.vue', 'BotonApariencia.vue', 'NotificationBell.vue']) {
      const c = leer('components', 'layout', f);
      expect(c).not.toMatch(/\saria-label="(Enviar una sugerencia|Apariencia y lectura|Notificaciones)/);
    }
    expect(leer('components', 'layout', 'BotonSugerencias.vue')).toContain('<span class="sr-only lg:not-sr-only">Sugerencias</span>');
    expect(leer('components', 'layout', 'NotificationBell.vue')).toContain('<span class="sr-only"> sin leer</span>');
    const cab = leer('components', 'layout', 'HeaderNav.vue');
    expect(cab).not.toContain(':aria-label="`Menú de ${');
    expect(cab).toContain(':aria-expanded="showUserMenu"');
    expect(leer('pages', 'docente', 'contenidos.vue')).not.toContain('aria-label="Traer contenidos de otra clase"');
    expect(leer('pages', 'estudiante', 'index.vue')).toContain('<span class="sr-only">: {{ estadoLeccion(unit) }}</span>');
  });

  it('2.5.8 Tamaño del objetivo: casillas de 20 px en filas de 32 px; migas del ejercicio sin tapar; nombre de la clase de 28 px', () => {
    expect(leer('pages', 'docente', 'refuerzos', 'nuevo.vue').match(/w-5 h-5 shrink-0 accent-acento-ambar-fuerte/g)).toHaveLength(2);
    expect(leer('layouts', 'workspace.vue').match(/min-h-\[44px\] -my-3\.5 relative z-10/g)).toHaveLength(2); // 44 px (MOB-02) y sin quedar tapadas por el título
    expect(leer('components', 'docente', 'PestanasClase.vue')).toContain('py-1 min-h-[28px]');
  });

  it('2.1.1 Teclado: las zonas que se desplazan se pueden enfocar', () => {
    expect(leer('pages', 'admin', 'dashboard.vue')).toContain('<div class="overflow-x-auto" tabindex="0" role="region"');
    expect(leer('pages', 'admin', 'sistema.vue').replace(/\r\n/g, '\n')).toContain('tabindex="0"\n        aria-label="Registro del servidor"');
  });
});
