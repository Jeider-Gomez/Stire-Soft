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
const a = cargar<{
  leerApariencia: (crudo: string | null) => Apariencia;
  atributosApariencia: (x: Apariencia) => Record<string, string>;
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

  it('se traducen a los atributos de <html> que leen los estilos', () => {
    expect(a.atributosApariencia({ tema: 'sistema', altoContraste: true, texto: 'grande', espaciado: true })).toEqual({
      'data-tema': 'sistema', 'data-contraste': 'alto', 'data-texto': 'grande', 'data-espaciado': 'amplio',
    });
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

  it('el tema claro conserva exactamente los colores de antes: quien no cambia nada ve lo mismo', () => {
    const antes: Record<string, string> = {
      'base-blanco': '#FFFFFF', 'base-bg-primario': '#F7F9FC', 'base-bg-secundario': '#F1F5F9', 'base-borde-sutil': '#E2E8F0',
      'base-borde-fuerte': '#CBD5E1', 'base-texto-secundario': '#64748B', 'base-texto-primario': '#1E293B',
      'acento-ambar': '#082A66', 'acento-ambar-fuerte': '#0B3D91', 'semantico-pasa': '#047857', 'semantico-falla': '#B91C1C',
      'repaso-vencido': '#B45309', 'unidad-en-progreso': '#7B2FBF', 'stire-canvas': '#F7F9FC',
    };
    for (const [v, hex] of Object.entries(antes)) expect(claro).toContain(`--c-${v}: ${rgb(hex)};`);
  });

  it('hay tema oscuro, el del sistema y alto contraste; lo que siempre es oscuro (editor) no cambia', () => {
    expect(temas).toContain(':root[data-tema="oscuro"] {');
    expect(temas).toContain('@media (prefers-color-scheme: dark)');
    expect(temas).toContain(':root[data-contraste="alto"] {');
    expect(temas).toContain('color-scheme: dark;');
    expect(config).toContain("bg: '#0F172A'");
  });

  it('las variables cargan antes que main.css y se aplican antes de mostrar la página', () => {
    const nuxt = leer('nuxt.config.ts');
    expect(nuxt.indexOf("'~/assets/css/temas.css'")).toBeLessThan(nuxt.indexOf("'~/assets/css/main.css'"));
    expect(leer('plugins', 'apariencia.client.ts')).toContain('aplicarApariencia(leerApariencia(guardado))');
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
  it('en el perfil de los tres roles y desde el menú del usuario', () => {
    for (const rol of ['estudiante', 'docente', 'admin']) expect(leer('pages', rol, 'perfil.vue')).toContain('<PerfilAparienciaLectura class="mt-6" />');
    expect(leer('components', 'layout', 'HeaderNav.vue')).toContain(':to="`${homeRoute}/perfil#apariencia`"');
  });

  it('el panel: grupos de opciones con leyenda, controles de 44 px y «Volver a la apariencia de siempre»', () => {
    const c = leer('components', 'perfil', 'AparienciaLectura.vue');
    expect(c).toContain('<legend class="text-xs font-semibold text-base-texto-primario mb-1">Tema</legend>');
    expect(c).toContain('min-h-[44px]');
    expect(c).toContain('Volver a la apariencia de siempre');
    expect(c).toContain('localStorage.setItem(CLAVE_APARIENCIA');
  });
});
