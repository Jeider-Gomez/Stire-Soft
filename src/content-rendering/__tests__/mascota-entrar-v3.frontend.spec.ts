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
  it('Apariencia abre a un lado sin oscurecer, para ver la pantalla de atrás', () => {
    expect(leer('components', 'layout', 'BotonApariencia.vue')).toContain('lateral');
    expect(leer('components', 'admin', 'AdminDialogo.vue')).toContain("lateral ? 'items-stretch justify-end");
  });
});
