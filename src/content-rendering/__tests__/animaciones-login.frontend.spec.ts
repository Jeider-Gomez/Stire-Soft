import { readFileSync } from 'fs';
import * as path from 'path';

// Las animaciones del login y el registro (prototipo de José) se veían «pausarse o cortarse»:
// - el destello del botón pasaba en 1,5 s y quedaba 1 s quieto (keyframes 60 %–100 % sin movimiento);
// - los resplandores del fondo iban y venían con ease-in-out y frenaban hasta detenerse en cada extremo;
// - con «reducir movimiento», la regla global cortaba la animación y los resplandores volvían a opacidad 1.
// Jest no compila frontend-nuxt/, así que estas pruebas leen el CSS real que se publica.
const FRONT = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...ruta: string[]) => readFileSync(path.join(FRONT, ...ruta), 'utf8');

function bloque(css: string, inicio: string): string {
  const i = css.indexOf(inicio);
  if (i < 0) throw new Error(`No se encontró «${inicio}»`);
  let nivel = 0;
  for (let j = css.indexOf('{', i); j < css.length; j++) {
    if (css[j] === '{') nivel++;
    if (css[j] === '}' && --nivel === 0) return css.slice(i, j + 1);
  }
  throw new Error(`Bloque sin cerrar: «${inicio}»`);
}

describe('Animaciones del login: movimiento continuo, sin pausas', () => {
  const fondo = leer('components', 'layout', 'FondoTecnologico.vue');
  const css = leer('assets', 'css', 'main.css');

  it('los resplandores del fondo orbitan a velocidad constante y el recorrido cierra en el punto de partida', () => {
    expect(bloque(fondo, '.resplandor {')).toMatch(/animation:\s*orbita\s+var\(--vuelta\)\s+linear\s+infinite/);
    const orbita = bloque(fondo, '@keyframes orbita');
    expect(orbita).toMatch(/from\s*\{\s*transform:\s*rotate\(0deg\)\s+translateX\(var\(--radio-orbita\)\)\s+rotate\(0deg\)/);
    expect(orbita).toMatch(/to\s*\{\s*transform:\s*rotate\(360deg\)\s+translateX\(var\(--radio-orbita\)\)\s+rotate\(-360deg\)/);
  });

  it('el fondo no usa filter: blur (se recalcularía en cada cuadro)', () => {
    const estilos = fondo.slice(fondo.indexOf('<style')).replace(/\/\*[\s\S]*?\*\//g, '');
    expect(estilos).not.toMatch(/filter\s*:\s*blur/);
  });

  it('con «reducir movimiento» el fondo queda quieto y tenue, no a opacidad completa', () => {
    const reducido = bloque(fondo, '@media (prefers-reduced-motion: reduce)');
    expect(reducido).toMatch(/animation:\s*none/);
    expect(reducido).toMatch(/opacity:\s*var\(--opacidad-min\)/);
    for (const color of ['azul', 'morado', 'turquesa']) {
      const opacidad = bloque(fondo, `.resplandor-${color} .nucleo {`).match(/--opacidad-min:\s*([\d.]+)/);
      expect(Number(opacidad?.[1])).toBeLessThanOrEqual(0.1);
    }
  });

  it('el destello del botón nunca queda quieto: sin retardo y sin tramo muerto en los keyframes', () => {
    expect(bloque(css, '.brillo-barrido {')).toMatch(/animation:\s*stire-brillo\s+[\d.]+s\s+linear\s+infinite;/);
    const keyframes = bloque(css, '@keyframes stire-brillo');
    // Ningún selector de porcentaje (como «60%, 100% {»): solo from → to.
    expect(keyframes).not.toMatch(/[{}]\s*\d+%\s*[,{]/);
    expect(keyframes).toMatch(/from\s*\{\s*transform:\s*translateX\(-50%\)/);
    expect(keyframes).toMatch(/to\s*\{\s*transform:\s*translateX\(0\)/);
  });

  it('el destello se repite sin salto: la franja mide 2 anchos y avanza exactamente 1 copia del destello por ciclo', () => {
    const franja = bloque(css, '.brillo-barrido {');
    expect(franja).toMatch(/width:\s*200%/);
    expect(franja).toMatch(/background-size:\s*50%\s+100%/);
    expect(franja).toMatch(/background-repeat:\s*repeat-x/);
  });

  it('con «reducir movimiento» el destello se oculta en lugar de quedar pintado a mitad del botón', () => {
    expect(bloque(css, '@media (prefers-reduced-motion: reduce)')).toMatch(/\.brillo-barrido\s*\{\s*display:\s*none/);
  });

  it.each(['login.vue', 'register.vue'])('%s usa el destello compartido y no uno propio', (pagina) => {
    const vue = leer('pages', 'auth', pagina);
    expect(vue).toContain('<span class="brillo-barrido" aria-hidden="true" />');
    expect(vue).not.toMatch(/w-1\/3[^"]*brillo-barrido/);
  });
});
