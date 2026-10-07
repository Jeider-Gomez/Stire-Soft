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

type Apariencia = { tema: string; altoContraste: boolean; texto: string; espaciado: boolean };
type Sistema = { oscuro: boolean; masContraste: boolean };
const a = cargar<{
  leerApariencia: (crudo: string | null, sistema?: Sistema) => Apariencia;
  atributosApariencia: (x: Apariencia, sistema?: Sistema) => Record<string, string>;
  temaEfectivo: (tema: string, sistema?: Sistema) => string;
  APARIENCIA_POR_DEFECTO: Apariencia;
}>('apariencia');

describe('preferencias guardadas', () => {
  it('por defecto, el tema claro de siempre (se lee mejor; Piepenbrock et al., 2013)', () => {
    expect(a.APARIENCIA_POR_DEFECTO).toEqual({ tema: 'claro', altoContraste: false, texto: 'normal', espaciado: false });
    expect(a.leerApariencia(null)).toEqual(a.APARIENCIA_POR_DEFECTO);
  });

  it('un valor dañado vuelve al de por defecto sin perder los demás', () => {
    expect(a.leerApariencia('{"tema":"oscuro","texto":"gigante","altoContraste":true}')).toEqual({ tema: 'oscuro', altoContraste: true, texto: 'normal', espaciado: false });
    expect(a.leerApariencia('no es json')).toEqual(a.APARIENCIA_POR_DEFECTO);
    expect(a.leerApariencia('[1,2]')).toEqual(a.APARIENCIA_POR_DEFECTO);
  });

  it('se traducen a los atributos de <html> que leen los estilos; «Como mi dispositivo» llega ya resuelto', () => {
    expect(a.atributosApariencia({ tema: 'sistema', altoContraste: true, texto: 'grande', espaciado: true }, { oscuro: true, masContraste: false })).toEqual({
      'data-tema': 'oscuro', 'data-tema-elegido': 'sistema', 'data-contraste': 'alto', 'data-texto': 'grande', 'data-espaciado': 'amplio',
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
