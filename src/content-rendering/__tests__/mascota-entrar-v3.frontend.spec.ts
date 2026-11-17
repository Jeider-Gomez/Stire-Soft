import { readFileSync } from 'fs';
import * as path from 'path';

// Las interacciones de la mascota en «Entrar» (cuadro «Entrar» del lienzo v3) y la Apariencia lateral (16/11).
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');

describe('la mascota de Entrar reacciona como en el diseño', () => {
  const m = leer('components', 'auth', 'MascotaEntrar.vue');
  it('con la contraseña baja la persiana con candado y un punto por tecla, nunca la clave', () => {
    expect(m).toContain(":class=\"{ baja: campo === 'password', espia: campo === 'password' && verClave }\"");
    expect(m).toContain("'•'.repeat(Math.min(props.largoClave, 8))");
    expect(leer('pages', 'auth', 'login.vue')).toContain('largoClave: password.length');
  });
  it('avisa la @ que falta, las MAYÚSCULAS y se duerme a los 15 s', () => {
    expect(m).toContain('A ese correo le falta la @');
    expect(m).toContain('Ojo: tienes las MAYÚSCULAS activadas');
    expect(m).toContain('15000');
  });
  it('la pantalla de la mascota acepta lo que se le muestre encima, recortado a la pantalla', () => {
    expect(leer('components', 'tutor', 'Mascota.vue')).toContain('<slot name="pantalla" />');
  });
  it('en los temas de contraste la mascota y el logo toman la paleta del tema', () => {
    expect(leer('components', 'tutor', 'Mascota.vue')).toContain(':root[data-tema-contraste]:not([data-tema-contraste="ninguno"]) .mascota-tutor');
    expect(leer('components', 'layout', 'Logo.vue')).toContain(':root[data-tema-contraste]:not([data-tema-contraste="ninguno"]) .logo-stire');
  });
  it('el diálogo puede abrir a un lado sin oscurecer, para ver la pantalla de atrás', () => {
    expect(leer('components', 'admin', 'AdminDialogo.vue')).toContain("lateral ? 'items-stretch justify-end");
  });
});

describe('cambiar de tema con un círculo, como remotion.dev', () => {
  const t = leer('utils', 'transicionTema.ts');
  it('el círculo sale de donde se tocó y cubre hasta la esquina más lejana', () => {
    const ts = require('typescript');
    const js = ts.transpileModule(t, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
    const mod = { exports: {} as { radioHastaLaEsquina?: (x: number, y: number, w: number, h: number) => number } };
    new Function('module', 'exports', js)(mod, mod.exports);
    expect(mod.exports.radioHastaLaEsquina?.(0, 0, 300, 400)).toBe(500);
    expect(mod.exports.radioHastaLaEsquina?.(150, 200, 300, 400)).toBe(250);
  });
  it('solo con los cambios de color, y sin animación con «reducir movimiento»', () => {
    expect(leer('composables', 'useApariencia.ts')).toContain("['tema', 'altoContraste', 'temaContraste'].some((k) => k in cambios)");
    expect(t).toContain("matchMedia('(prefers-reduced-motion: reduce)')");
    expect(leer('assets', 'css', 'temas.css')).toContain('::view-transition-new(root) { z-index: 2; }');
  });
});

describe('el menú lateral sin la barra de scroll gruesa', () => {
  it('fina hasta pasar el mouse, y oculta con el menú recogido', () => {
    const c = leer('assets', 'css', 'menu-v3.css');
    expect(c).toContain('aside.w-sidebar.menu-colapsado { scrollbar-width: none; }');
    expect(c).toContain('aside.w-sidebar { scrollbar-width: thin;');
  });
});

describe('el menú del docente cabe sin scroll', () => {
  it('recogido, las secciones de la clase también quedan solo con su ícono (regla global, no «scoped»)', () => {
    const c = leer('assets', 'css', 'menu-v3.css');
    expect(c).toContain('.menu-colapsado .item-menu > span:not(.icono-menu):not(.siglas-clase)');
    expect(c).toContain('@media (min-width: 768px) and (max-height: 760px)');
  });
});
